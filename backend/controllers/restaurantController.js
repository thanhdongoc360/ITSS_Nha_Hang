const Restaurant = require('../models/Restaurant');
const History = require('../models/History');
const Favorite = require('../models/Favorite');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class RestaurantController {
  /**
   * Lấy danh sách restaurants
   * GET /api/restaurants
   */
  static async getAll(req, res) {
    try {
      const filters = {
        q: req.query.q,
        cuisine: req.query.cuisine,
        maxDistance: req.query.maxDistance,
        maxPrice: req.query.maxPrice,
        minRating: req.query.minRating,
        sortBy: req.query.sortBy,
        order: req.query.order,
        limit: req.query.limit,
        offset: req.query.offset
      };

      const restaurants = await Restaurant.findAll(filters);

      // Nếu user đã login, check favorites
      if (req.user) {
        const favoriteIds = await Favorite.getFavoriteIds(req.user.id);
        restaurants.forEach(restaurant => {
          restaurant.isFavorite = favoriteIds.includes(restaurant.id);
        });
      }

      return successResponse(res, 200, 'Restaurants retrieved successfully', {
        restaurants,
        count: restaurants.length
      });
    } catch (error) {
      console.error('Get restaurants error:', error);
      return errorResponse(res, 500, 'Failed to retrieve restaurants');
    }
  }

  /**
   * Lấy chi tiết restaurant
   * GET /api/restaurants/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const restaurant = await Restaurant.findById(id);

      if (!restaurant) {
        return errorResponse(res, 404, 'Restaurant not found');
      }

      // Check if favorited
      if (req.user) {
        try {
          restaurant.isFavorite = await Favorite.isFavorite(req.user.id, id);
          
          // Add to history
          await History.add(req.user.id, id, 'view');
        } catch (userError) {
          // Log but don't fail the main request
          console.error('Error checking favorite/history:', userError);
          restaurant.isFavorite = false;
        }
      }

      return successResponse(res, 200, 'Restaurant retrieved successfully', { restaurant });
    } catch (error) {
      console.error('Get restaurant error:', error);
      console.error('Error stack:', error.stack);
      return errorResponse(res, 500, 'Failed to retrieve restaurant');
    }
  }

  /**
   * Tìm kiếm restaurants
   * GET /api/restaurants/search
   */
  static async search(req, res) {
    try {
      const { q, cuisine, maxDistance, maxPrice } = req.query;

      const restaurants = await Restaurant.search(q, cuisine, maxDistance, maxPrice);

      // Add search to history
      if (req.user && q) {
        // Log search với first result nếu có
        if (restaurants.length > 0) {
          await History.add(req.user.id, restaurants[0].id, 'search');
        }
      }

      return successResponse(res, 200, 'Search completed', {
        restaurants,
        count: restaurants.length,
        query: { q, cuisine, maxDistance, maxPrice }
      });
    } catch (error) {
      console.error('Search error:', error);
      return errorResponse(res, 500, 'Search failed');
    }
  }

  /**
   * Lấy recommendations
   * GET /api/restaurants/recommendations
   */
  static async getRecommendations(req, res) {
    try {
      if (!req.user) {
        return errorResponse(res, 401, 'Authentication required for recommendations');
      }

      const recommendations = await Restaurant.getRecommendations(req.user.id);

      return successResponse(res, 200, 'Recommendations retrieved successfully', {
        restaurants: recommendations,
        count: recommendations.length
      });
    } catch (error) {
      console.error('Get recommendations error:', error);
      return errorResponse(res, 500, 'Failed to get recommendations');
    }
  }

  /**
   * Lấy popular restaurants
   * GET /api/restaurants/popular
   */
  static async getPopular(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const restaurants = await Restaurant.getPopular(limit);

      return successResponse(res, 200, 'Popular restaurants retrieved', {
        restaurants,
        count: restaurants.length
      });
    } catch (error) {
      console.error('Get popular error:', error);
      return errorResponse(res, 500, 'Failed to get popular restaurants');
    }
  }

  /**
   * Lấy nearby restaurants
   * GET /api/restaurants/nearby
   */
  static async getNearby(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const restaurants = await Restaurant.getNearby(limit);

      return successResponse(res, 200, 'Nearby restaurants retrieved', {
        restaurants,
        count: restaurants.length
      });
    } catch (error) {
      console.error('Get nearby error:', error);
      return errorResponse(res, 500, 'Failed to get nearby restaurants');
    }
  }

  /**
   * Lấy danh sách cuisine types
   * GET /api/restaurants/cuisines
   */
  static async getCuisines(req, res) {
    try {
      const cuisines = await Restaurant.getCuisineTypes();

      return successResponse(res, 200, 'Cuisine types retrieved', {
        cuisines,
        count: cuisines.length
      });
    } catch (error) {
      console.error('Get cuisines error:', error);
      return errorResponse(res, 500, 'Failed to get cuisine types');
    }
  }
}

module.exports = RestaurantController;
