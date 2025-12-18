const express = require('express');
const userController = require('../controllers/userController');
const commentController = require('../controllers/commentController');

const router = express.Router();

// API Home - List available endpoints
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'IPSSI_PATCH API - Layered Architecture (Routes → Controllers → Services → ORM)',
    architecture: {
      routes: 'Define HTTP endpoints',
      controllers: 'Handle HTTP requests/responses',
      services: 'Business logic and ORM interactions',
      models: 'Sequelize ORM models'
    },
    endpoints: {
      health: 'GET /health',
      users: {
        populate: 'GET /populate - Generate 3 random users',
        list: 'GET /users - List all users',
        getById: 'POST /user - Get user by ID (body: {userId: number})'
      },
      comments: {
        create: 'POST /comment - Create comment (body: text or {comment: text})',
        list: 'GET /comments - List all comments',
        getById: 'GET /comments/:id - Get comment by ID',
        delete: 'DELETE /comments/:id - Delete comment'
      }
    }
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// User routes
router.get('/populate', userController.populate);
router.get('/users', userController.getUserIds);
router.post('/user', userController.getUserById);

// Comment routes
router.post('/comment', commentController.createComment);
router.get('/comments', commentController.getAllComments);
router.get('/comments/:id', commentController.getCommentById);
router.delete('/comments/:id', commentController.deleteComment);

// Legacy route compatibility (for old /query endpoint)
router.post('/query', (req, res) => {
  res.status(410).json({
    success: false,
    error: 'This endpoint has been deprecated for security reasons. Please use /user endpoint instead.'
  });
});

module.exports = router;
