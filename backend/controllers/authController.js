const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelper');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { validationResult } = require('express-validator');

class AuthController {
  /**
   * Đăng ký user mới
   * POST /api/auth/register
   */
  static async register(req, res) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'Validation failed', errors.array());
      }

      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return errorResponse(res, 409, 'Email already registered');
      }

      // Create user
      const userId = await User.create(name, email, password);
      const user = await User.findById(userId);

      // Generate JWT token
      const token = generateToken({ 
        id: user.id, 
        email: user.email 
      });

      return successResponse(res, 201, 'Registration successful', {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      });
    } catch (error) {
      console.error('Register error:', error);
      return errorResponse(res, 500, 'Registration failed');
    }
  }

  /**
   * Đăng nhập
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, 'Validation failed', errors.array());
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return errorResponse(res, 401, 'Invalid email or password');
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return errorResponse(res, 401, 'Invalid email or password');
      }

      // Generate JWT token
      const token = generateToken({ 
        id: user.id, 
        email: user.email 
      });

      return successResponse(res, 200, 'Login successful', {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      return errorResponse(res, 500, 'Login failed');
    }
  }

  /**
   * Lấy thông tin user hiện tại
   * GET /api/auth/me
   */
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return errorResponse(res, 404, 'User not found');
      }

      return successResponse(res, 200, 'User retrieved successfully', { user });
    } catch (error) {
      console.error('Get current user error:', error);
      return errorResponse(res, 500, 'Failed to get user information');
    }
  }

  /**
   * Đăng xuất (client-side handling)
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    // JWT logout is handled on client-side by removing token
    // This endpoint is just for consistency
    return successResponse(res, 200, 'Logout successful');
  }
}

module.exports = AuthController;
