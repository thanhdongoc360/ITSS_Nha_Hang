const Favorite = require('../models/Favorite');
const Restaurant = require('../models/Restaurant');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class FavoriteController {
  /**
   * Lấy tất cả favorites của user
   * GET /api/favorites
   */
  static async getAll(req, res) {
    try {
      const favorites = await Favorite.findByUserId(req.user.id);
      const count = await Favorite.count(req.user.id);

      return successResponse(res, 200, 'Favorites retrieved successfully', {
        favorites,
        count
      });
    } catch (error) {
      console.error('Get favorites error:', error);
      return errorResponse(res, 500, 'Failed to retrieve favorites');
    }
  }

  /**
   * Thêm restaurant vào favorites
   * POST /api/favorites/:id
   */
  static async add(req, res) {
    try {
      const { id } = req.params;

      // Check if restaurant exists
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        return errorResponse(res, 404, 'Restaurant not found');
      }

      // Add to favorites
      const added = await Favorite.add(req.user.id, id);

      if (!added) {
        return errorResponse(res, 409, 'Restaurant already in favorites');
      }

      return successResponse(res, 201, 'Added to favorites', {
        restaurantId: parseInt(id)
      });
    } catch (error) {
      console.error('Add favorite error:', error);
      return errorResponse(res, 500, 'Failed to add to favorites');
    }
  }

  /**
   * Xóa restaurant khỏi favorites
   * DELETE /api/favorites/:id
   */
  static async remove(req, res) {
    try {
      const { id } = req.params;

      // Check if it's in favorites
      const isFavorite = await Favorite.isFavorite(req.user.id, id);
      if (!isFavorite) {
        return errorResponse(res, 404, 'Restaurant not in favorites');
      }

      // Remove from favorites
      await Favorite.remove(req.user.id, id);

      return successResponse(res, 200, 'Removed from favorites', {
        restaurantId: parseInt(id)
      });
    } catch (error) {
      console.error('Remove favorite error:', error);
      return errorResponse(res, 500, 'Failed to remove from favorites');
    }
  }

  /**
   * Toggle favorite status
   * PUT /api/favorites/:id/toggle
   */
  static async toggle(req, res) {
    try {
      const { id } = req.params;

      // Check if restaurant exists
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        return errorResponse(res, 404, 'Restaurant not found');
      }

      // Check current status
      const isFavorite = await Favorite.isFavorite(req.user.id, id);

      if (isFavorite) {
        // Remove from favorites
        await Favorite.remove(req.user.id, id);
        return successResponse(res, 200, 'Removed from favorites', {
          restaurantId: parseInt(id),
          isFavorite: false
        });
      } else {
        // Add to favorites
        await Favorite.add(req.user.id, id);
        return successResponse(res, 200, 'Added to favorites', {
          restaurantId: parseInt(id),
          isFavorite: true
        });
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      return errorResponse(res, 500, 'Failed to toggle favorite');
    }
  }

  /**
   * Check if restaurant is favorited
   * GET /api/favorites/:id/check
   */
  static async check(req, res) {
    try {
      const { id } = req.params;
      const isFavorite = await Favorite.isFavorite(req.user.id, id);

      return successResponse(res, 200, 'Favorite status checked', {
        restaurantId: parseInt(id),
        isFavorite
      });
    } catch (error) {
      console.error('Check favorite error:', error);
      return errorResponse(res, 500, 'Failed to check favorite status');
    }
  }
}

module.exports = FavoriteController;
