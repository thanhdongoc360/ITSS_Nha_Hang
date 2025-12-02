const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GohanGo API Server is running! 骨',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      favorites: '/api/favorites',
      history: '/api/history',
      profile: '/api/profile',
      recommendations: '/api/recommendations'
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/history', require('./routes/history'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/recommendations', require('./routes/recommendations'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
笊披武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶風
笊・  骨 GohanGo API Server Started 骨    笊・
笊笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊｣
笊・  Port: ${PORT}                          笊・
笊・  Environment: ${process.env.NODE_ENV || 'development'}              笊・
笊・  Database: ${process.env.DB_NAME || 'gohan_go'}                 笊・
笊壺武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶幅
  `);
});

module.exports = app;

