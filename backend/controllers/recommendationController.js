const db = require('../config/database');

// Get personalized recommendations for user
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

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

    // Calculate recommendation score for each restaurant
    const scoredRestaurants = allRestaurants.map(restaurant => {
      let score = 0;
      let reasons = [];

      // Base score from rating
      score += restaurant.rating * 10;

      // Boost if cuisine matches user's favorites
      const favCuisine = favoriteCuisines.data?.find(fc => fc.cuisine === restaurant.cuisine);
      if (favCuisine) {
        score += 30;
        reasons.push(`You love ${restaurant.cuisine}`);
      }

      // Boost if similar to history
      const historyMatch = historyData.data?.find(h => 
        h.cuisine === restaurant.cuisine || h.price === restaurant.price
      );
      if (historyMatch) {
        score += 20;
        reasons.push('Similar to your history');
      }

      // Boost if matches preferences
      if (preferences.data && preferences.data.length > 0) {
        const pref = preferences.data[0];
        
        // Check cuisine types
        if (pref.cuisine_types) {
          try {
            const cuisineTypes = JSON.parse(pref.cuisine_types);
            if (cuisineTypes.includes(restaurant.cuisine)) {
              score += 25;
              reasons.push('Matches your preferences');
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }

        // Check distance
        if (pref.max_distance && restaurant.distance && restaurant.distance <= pref.max_distance) {
          score += 15;
          reasons.push('Within your preferred distance');
        }

        // Check price range
        if (pref.price_range) {
          try {
            const priceRange = JSON.parse(pref.price_range);
            if (restaurant.price >= priceRange[0] && restaurant.price <= priceRange[1]) {
              score += 10;
              reasons.push('Within your budget');
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      }

      // Boost for high reviews count
      if (restaurant.reviews > 200) {
        score += 10;
        reasons.push('Popular choice');
      }

      // Boost for excellent rating
      if (restaurant.rating >= 4.7) {
        score += 15;
        reasons.push('Highly rated');
      }

      // Penalty if already favorited (to show variety)
      if (restaurant.isFavorite) {
        score -= 5;
      }

      return {
        ...restaurant,
        recommendationScore: score,
        recommendationReasons: reasons
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

