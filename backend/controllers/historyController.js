const History = require('../models/History');
const Restaurant = require('../models/Restaurant');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class HistoryController {
  /**
   * Lấy history của user
   * GET /api/history
   */
  static async getAll(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const history = await History.findByUserId(req.user.id, limit);
      const count = await History.count(req.user.id);

      return successResponse(res, 200, 'History retrieved successfully', {
        history,
        count
      });
    } catch (error) {
      console.error('Get history error:', error);
      return errorResponse(res, 500, 'Failed to retrieve history');
    }
  }

  /**
   * Thêm vào history
   * POST /api/history
   */
  static async add(req, res) {
    try {
      const { restaurantId, action } = req.body;

      // Validate action
      const validActions = ['view', 'search', 'visit', 'order'];
      if (!validActions.includes(action)) {
        return errorResponse(res, 400, 'Invalid action. Must be: view, search, visit, or order');
      }

      // Check if restaurant exists
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return errorResponse(res, 404, 'Restaurant not found');
      }

      // Add to history
      await History.add(req.user.id, restaurantId, action);

      return successResponse(res, 201, 'Added to history', {
        restaurantId: parseInt(restaurantId),
        action
      });
    } catch (error) {
      console.error('Add history error:', error);
      return errorResponse(res, 500, 'Failed to add to history');
    }
  }

  /**
   * Lấy history theo action type
   * GET /api/history/by-action/:action
   */
  static async getByAction(req, res) {
    try {
      const { action } = req.params;
      
      const validActions = ['view', 'search', 'visit', 'order'];
      if (!validActions.includes(action)) {
        return errorResponse(res, 400, 'Invalid action');
      }

      const history = await History.findByAction(req.user.id, action);

      return successResponse(res, 200, `${action} history retrieved`, {
        history,
        count: history.length,
        action
      });
    } catch (error) {
      console.error('Get history by action error:', error);
      return errorResponse(res, 500, 'Failed to retrieve history');
    }
  }

  /**
   * Lấy recently viewed restaurants
   * GET /api/history/recently-viewed
   */
  static async getRecentlyViewed(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const restaurants = await History.getRecentlyViewed(req.user.id, limit);

      return successResponse(res, 200, 'Recently viewed retrieved', {
        restaurants,
        count: restaurants.length
      });
    } catch (error) {
      console.error('Get recently viewed error:', error);
      return errorResponse(res, 500, 'Failed to retrieve recently viewed');
    }
  }

  /**
   * Xóa tất cả history
   * DELETE /api/history
   */
  static async deleteAll(req, res) {
    try {
      await History.deleteAll(req.user.id);

      return successResponse(res, 200, 'All history deleted');
    } catch (error) {
      console.error('Delete history error:', error);
      return errorResponse(res, 500, 'Failed to delete history');
    }
  }

  /**
   * Xóa history cũ hơn X ngày
   * DELETE /api/history/old/:days
   */
  static async deleteOld(req, res) {
    try {
      const { days } = req.params;
      const daysInt = parseInt(days);

      if (isNaN(daysInt) || daysInt < 1) {
        return errorResponse(res, 400, 'Invalid days parameter');
      }

      await History.deleteOld(req.user.id, daysInt);

      return successResponse(res, 200, `History older than ${daysInt} days deleted`);
    } catch (error) {
      console.error('Delete old history error:', error);
      return errorResponse(res, 500, 'Failed to delete old history');
    }
  }
}

module.exports = HistoryController;
