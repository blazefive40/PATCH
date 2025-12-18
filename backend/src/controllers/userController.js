const userService = require('../services/userService');

/**
 * Controller layer for User endpoints
 * Handles HTTP requests/responses and delegates to service layer
 */

const userController = {
  /**
   * Populate users from randomuser.me API
   * GET /populate
   */
  async populate(req, res) {
    try {
      const createdUsers = await userService.populateUsers();

      res.json({
        success: true,
        message: 'Users populated successfully',
        users: createdUsers
      });
    } catch (error) {
      console.error('Error populating users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to populate users'
      });
    }
  },

  /**
   * Get all user IDs
   * GET /users
   */
  async getUserIds(req, res) {
    try {
      const users = await userService.getAllUsers();

      res.json({
        success: true,
        users
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  },

  /**
   * Get user by ID
   * POST /user
   */
  async getUserById(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }

      const user = await userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user'
      });
    }
  }
};

module.exports = userController;
