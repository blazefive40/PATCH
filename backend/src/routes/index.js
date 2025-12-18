const express = require('express');
const userController = require('../controllers/userController');
const commentController = require('../controllers/commentController');
const validators = require('../middlewares/validators');
const { writeLimiter, populateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// API Home - List available endpoints
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'IPSSI_PATCH API - Secured Layered Architecture',
    architecture: {
      routes: 'Define HTTP endpoints',
      controllers: 'Handle HTTP requests/responses',
      services: 'Business logic and ORM interactions',
      models: 'Sequelize ORM models'
    },
    security: {
      helmet: 'Enhanced security headers with CSP',
      rateLimiting: 'API-wide and endpoint-specific limits',
      xssProtection: 'Input sanitization for XSS prevention',
      sqlInjection: 'Sequelize ORM parameterized queries',
      inputValidation: 'express-validator for all inputs',
      cors: 'Strict origin policy',
      bodyLimits: '10kb max request size'
    },
    endpoints: {
      health: 'GET /health',
      users: {
        populate: 'GET /populate - Generate 3 random users (rate limited)',
        list: 'GET /users - List all users',
        getById: 'POST /user - Get user by ID (body: {userId: number})'
      },
      comments: {
        create: 'POST /comment - Create comment (XSS protected, rate limited)',
        list: 'GET /comments - List all comments',
        getById: 'GET /comments/:id - Get comment by ID',
        delete: 'DELETE /comments/:id - Delete comment (rate limited)'
      }
    }
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running securely' });
});

// User routes with security middleware
router.get('/populate', populateLimiter, userController.populate);
router.get('/users', userController.getUserIds);
router.post('/user', validators.validateUserId, userController.getUserById);

// Comment routes with security middleware
router.post('/comment', writeLimiter, validators.validateComment, commentController.createComment);
router.get('/comments', commentController.getAllComments);
router.get('/comments/:id', validators.validateCommentId, commentController.getCommentById);
router.delete('/comments/:id', writeLimiter, validators.validateCommentId, commentController.deleteComment);

// Legacy route compatibility (for old /query endpoint)
router.post('/query', (req, res) => {
  res.status(410).json({
    success: false,
    error: 'This endpoint has been deprecated for security reasons. Please use /user endpoint instead.'
  });
});

module.exports = router;
