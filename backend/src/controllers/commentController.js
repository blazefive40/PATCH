const commentService = require('../services/commentService');

/**
 * Controller layer for Comment endpoints
 * Handles HTTP requests/responses and delegates to service layer
 */

const commentController = {
  /**
   * Create a new comment
   * POST /comment
   */
  async createComment(req, res) {
    try {
      const commentText = typeof req.body === 'string' ? req.body : req.body.comment;

      if (!commentText || commentText.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Comment text is required'
        });
      }

      const comment = await commentService.createComment(commentText);

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        comment
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create comment'
      });
    }
  },

  /**
   * Get all comments
   * GET /comments
   */
  async getAllComments(req, res) {
    try {
      const comments = await commentService.getAllComments();

      res.json({
        success: true,
        comments
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch comments'
      });
    }
  },

  /**
   * Get comment by ID
   * GET /comments/:id
   */
  async getCommentById(req, res) {
    try {
      const { id } = req.params;

      const comment = await commentService.getCommentById(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found'
        });
      }

      res.json({
        success: true,
        comment
      });
    } catch (error) {
      console.error('Error fetching comment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch comment'
      });
    }
  },

  /**
   * Delete comment by ID
   * DELETE /comments/:id
   */
  async deleteComment(req, res) {
    try {
      const { id } = req.params;

      const deleted = await commentService.deleteComment(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found'
        });
      }

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete comment'
      });
    }
  }
};

module.exports = commentController;
