const db = require('../config/database');

// Haversine formula to calculate distance between two GPS coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000; // Convert to meters
  return Math.round(distance);
};

// AI-powered scoring algorithm
const calculateAIScore = (restaurant, userLat, userLon, preferences, favoriteCuisines, historyData) => {
  let score = 0;
  let reasons = [];

  // Calculate real distance using GPS
  if (userLat && userLon && restaurant.latitude && restaurant.longitude) {
    const distance = calculateDistance(userLat, userLon, restaurant.latitude, restaurant.longitude);
    restaurant.calculatedDistance = distance;

    // Distance scoring with AI weights
    if (distance <= 300) {
      score += 50; // Very close - highest priority
      reasons.push('Very close to you');
    } else if (distance <= 500) {
      score += 40;
      reasons.push('Within walking distance');
    } else if (distance <= 1000) {
      score += 30;
      reasons.push('Nearby location');
    } else if (distance <= 2000) {
      score += 20;
      reasons.push('Short distance away');
    } else {
      score += Math.max(0, 10 - (distance / 500)); // Penalty for far distance
    }

    // Check against user's max distance preference
    if (preferences && preferences.max_distance && distance <= preferences.max_distance) {
      score += 15;
      reasons.push('Within your preferred range');
    }
  }

  // Rating score (weighted heavily)
  score += restaurant.rating * 12;
  if (restaurant.rating >= 4.8) {
    score += 20;
    reasons.push('Exceptional rating');
  } else if (restaurant.rating >= 4.5) {
    score += 10;
    reasons.push('Highly rated');
  }

  // Cuisine preference matching
  const favCuisine = favoriteCuisines?.find(fc => fc.cuisine === restaurant.cuisine);
  if (favCuisine) {
    score += 35;
    reasons.push(`Your favorite: ${restaurant.cuisine}`);
  }

  // History-based learning
  const historyMatch = historyData?.find(h => 
    h.cuisine === restaurant.cuisine || h.price === restaurant.price
  );
  if (historyMatch) {
    score += 25;
    const visitCount = historyMatch.visit_count || 1;
    score += Math.min(visitCount * 3, 15); // Bonus for frequent visits
    reasons.push('Matches your taste');
  }

  // Price matching
  if (preferences && preferences.price_range) {
    try {
      const priceRange = typeof preferences.price_range === 'string' 
        ? JSON.parse(preferences.price_range) 
        : preferences.price_range;
      if (restaurant.price >= priceRange[0] && restaurant.price <= priceRange[1]) {
        score += 15;
        reasons.push('Perfect price range');
      }
    } catch (e) {}
  }

  // Popularity score
  if (restaurant.reviews > 500) {
    score += 15;
    reasons.push('Very popular');
  } else if (restaurant.reviews > 200) {
    score += 10;
    reasons.push('Popular choice');
  } else if (restaurant.reviews > 100) {
    score += 5;
  }

  // Freshness bonus (to show variety)
  if (!restaurant.isFavorite && Math.random() > 0.7) {
    score += 8;
    reasons.push('New discovery');
  }

  // Penalty if already favorited (encourage exploration)
  if (restaurant.isFavorite) {
    score -= 3;
  }

  return { score, reasons };
};

// Get personalized recommendations for user with GPS AI
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude } = req.query; // GPS coordinates from client

    // Get user's preferences
    const [preferences] = await db.execute(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    // Get user's favorite cuisines from favorites
    const [favoriteCuisines] = await db.execute(`
      SELECT r.cuisine, COUNT(*) as count
      FROM favorites f
      JOIN restaurants r ON f.restaurant_id = r.id
      WHERE f.user_id = ?
      GROUP BY r.cuisine
      ORDER BY count DESC
      LIMIT 3
    `, [userId]);

    // Get user's history to find patterns
    const [historyData] = await db.execute(`
      SELECT r.id, r.cuisine, r.price, r.rating, COUNT(*) as visit_count
      FROM history h
      JOIN restaurants r ON h.restaurant_id = r.id
      WHERE h.user_id = ?
      GROUP BY r.id, r.cuisine, r.price, r.rating
      ORDER BY visit_count DESC, h.created_at DESC
      LIMIT 10
    `, [userId]);

    // Get all restaurants
    const [allRestaurants] = await db.execute(`
      SELECT r.*, 
        EXISTS(SELECT 1 FROM favorites WHERE user_id = ? AND restaurant_id = r.id) as isFavorite
      FROM restaurants r
      WHERE r.rating >= 4.0
    `, [userId]);

    // Calculate AI-powered recommendation score for each restaurant
    const userLat = latitude ? parseFloat(latitude) : null;
    const userLon = longitude ? parseFloat(longitude) : null;
    const pref = preferences.data?.[0];
    
    const scoredRestaurants = allRestaurants.map(restaurant => {
      const aiScore = calculateAIScore(
        restaurant,
        userLat,
        userLon,
        pref,
        favoriteCuisines.data,
        historyData.data
      );

      return {
        ...restaurant,
        distance: restaurant.calculatedDistance || restaurant.distance,
        recommendationScore: aiScore.score,
        recommendationReasons: aiScore.reasons
      };
    });

    // Sort by score and get top 10
    const recommendations = scoredRestaurants
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10);

    res.json({
      success: true,
      recommendations,
      basedOn: {
        hasFavorites: favoriteCuisines.data && favoriteCuisines.data.length > 0,
        hasHistory: historyData.data && historyData.data.length > 0,
        hasPreferences: preferences.data && preferences.data.length > 0
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
};

// Save/Update user preferences
exports.savePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { maxDistance, maxWalkTime, cuisineTypes, priceRange } = req.body;

    // Check if preferences exist
    const [existing] = await db.execute(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    const cuisineTypesJson = cuisineTypes ? JSON.stringify(cuisineTypes) : null;
    const priceRangeJson = priceRange ? JSON.stringify(priceRange) : null;

    if (existing.data && existing.data.length > 0) {
      // Update existing preferences
      await db.execute(`
        UPDATE user_preferences
        SET max_distance = ?, max_walk_time = ?, cuisine_types = ?, price_range = ?
        WHERE user_id = ?
      `, [maxDistance, maxWalkTime, cuisineTypesJson, priceRangeJson, userId]);
    } else {
      // Insert new preferences
      await db.execute(`
        INSERT INTO user_preferences (user_id, max_distance, max_walk_time, cuisine_types, price_range)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, maxDistance, maxWalkTime, cuisineTypesJson, priceRangeJson]);
    }

    res.json({
      success: true,
      message: 'Preferences saved successfully'
    });

  } catch (error) {
    console.error('Save preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save preferences',
      error: error.message
    });
  }
};

// Get user preferences
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const [preferences] = await db.execute(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    if (!preferences.data || preferences.data.length === 0) {
      return res.json({
        success: true,
        preferences: {
          maxDistance: 1000,
          maxWalkTime: 15,
          cuisineTypes: [],
          priceRange: [1, 3]
        }
      });
    }

    const pref = preferences.data[0];
    
    res.json({
      success: true,
      preferences: {
        maxDistance: pref.max_distance || 1000,
        maxWalkTime: pref.max_walk_time || 15,
        cuisineTypes: pref.cuisine_types ? JSON.parse(pref.cuisine_types) : [],
        priceRange: pref.price_range ? JSON.parse(pref.price_range) : [1, 3]
      }
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
      error: error.message
    });
  }
};

