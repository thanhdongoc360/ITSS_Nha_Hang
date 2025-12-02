const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get personalized recommendations
router.get('/', recommendationController.getRecommendations);

// Get user preferences
router.get('/preferences', recommendationController.getPreferences);

// Save/update preferences
router.post('/preferences', recommendationController.savePreferences);

module.exports = router;

