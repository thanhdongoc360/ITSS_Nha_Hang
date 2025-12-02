const { verifyToken } = require('../utils/jwtHelper');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Middleware để xác thực JWT token
 */
const authenticateToken = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return errorResponse(res, 401, 'Access token required');
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Gắn user info vào request
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 403, 'Invalid or expired token');
  }
};

/**
 * Optional auth middleware - không bắt buộc phải có token
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Ignore errors, continue without auth
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
