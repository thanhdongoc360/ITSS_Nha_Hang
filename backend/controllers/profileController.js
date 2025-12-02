const User = require('../models/User');
const UserPreference = require('../models/UserPreference');
const Favorite = require('../models/Favorite');
const History = require('../models/History');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class ProfileController {
  /**
   * Lấy profile của user
   * GET /api/profile
   */
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return errorResponse(res, 404, 'User not found');
      }

      // Lấy preferences
      const preferences = await UserPreference.findByUserId(req.user.id);

      // Lấy stats
      const favoritesCount = await Favorite.count(req.user.id);
      const historyCount = await History.count(req.user.id);

      return successResponse(res, 200, 'Profile retrieved successfully', {
        user,
        preferences,
        stats: {
          favoritesCount,
          historyCount
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return errorResponse(res, 500, 'Failed to retrieve profile');
    }
  }

  /**
   * Cập nhật thông tin user
   * PUT /api/profile
   */
  static async updateProfile(req, res) {
    try {
      const { name, email } = req.body;

      // Check if email is being changed and if it already exists
      if (email && email !== req.user.email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.id !== req.user.id) {
          return errorResponse(res, 409, 'Email already in use');
        }
      }

      // Update user
      const updatedUser = await User.update(req.user.id, { name, email });

      return successResponse(res, 200, 'Profile updated successfully', {
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return errorResponse(res, 500, 'Failed to update profile');
    }
  }

  /**
   * Lấy preferences
   * GET /api/profile/preferences
   */
  static async getPreferences(req, res) {
    try {
      const preferences = await UserPreference.findByUserId(req.user.id);

      return successResponse(res, 200, 'Preferences retrieved successfully', {
        preferences: preferences || null
      });
    } catch (error) {
      console.error('Get preferences error:', error);
      return errorResponse(res, 500, 'Failed to retrieve preferences');
    }
  }

  /**
   * Cập nhật preferences
   * PUT /api/profile/preferences
   */
  static async updatePreferences(req, res) {
    try {
      const { max_distance, max_walk_time, cuisine_types, price_range } = req.body;

      // Validate data
      if (max_distance && (max_distance < 0 || max_distance > 10000)) {
        return errorResponse(res, 400, 'Invalid max_distance (0-10000 meters)');
      }

      if (max_walk_time && (max_walk_time < 0 || max_walk_time > 120)) {
        return errorResponse(res, 400, 'Invalid max_walk_time (0-120 minutes)');
      }

      if (price_range && (!Array.isArray(price_range) || price_range.length !== 2)) {
        return errorResponse(res, 400, 'Invalid price_range (must be array [min, max])');
      }

      if (cuisine_types && !Array.isArray(cuisine_types)) {
        return errorResponse(res, 400, 'Invalid cuisine_types (must be array)');
      }

      // Update preferences
      const preferences = await UserPreference.upsert(req.user.id, {
        max_distance,
        max_walk_time,
        cuisine_types,
        price_range
      });

      return successResponse(res, 200, 'Preferences updated successfully', {
        preferences
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      return errorResponse(res, 500, 'Failed to update preferences');
    }
  }

  /**
   * Xóa preferences
   * DELETE /api/profile/preferences
   */
  static async deletePreferences(req, res) {
    try {
      await UserPreference.delete(req.user.id);

      return successResponse(res, 200, 'Preferences deleted successfully');
    } catch (error) {
      console.error('Delete preferences error:', error);
      return errorResponse(res, 500, 'Failed to delete preferences');
    }
  }

  /**
   * Lấy stats của user
   * GET /api/profile/stats
   */
  static async getStats(req, res) {
    try {
      const favoritesCount = await Favorite.count(req.user.id);
      const historyCount = await History.count(req.user.id);
      
      // Get recently viewed
      const recentlyViewed = await History.getRecentlyViewed(req.user.id, 5);

      return successResponse(res, 200, 'Stats retrieved successfully', {
        stats: {
          favoritesCount,
          historyCount,
          recentlyViewedCount: recentlyViewed.length
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      return errorResponse(res, 500, 'Failed to retrieve stats');
    }
  }
}

module.exports = ProfileController;
