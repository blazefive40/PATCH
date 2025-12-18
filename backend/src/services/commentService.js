const { Comment } = require('../models');
const xss = require('xss');

/**
 * Service layer for Comment operations
 * Contains business logic and ORM interactions
 */

const commentService = {
  /**
   * Create a new comment with XSS protection
   * @param {string} content - Comment content
   * @returns {Promise<Object>} Created comment
   */
  async createComment(content) {
    // Sanitize content to prevent XSS attacks
    const sanitizedContent = xss(content, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style']
    });

    return await Comment.create({ content: sanitizedContent });
  },

  /**
   * Get all comments ordered by creation date
   * @returns {Promise<Array>} List of comments
   */
  async getAllComments() {
    return await Comment.findAll({
      order: [['createdAt', 'DESC']]
    });
  },

  /**
   * Get comment by ID
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object|null>} Comment object or null if not found
   */
  async getCommentById(commentId) {
    return await Comment.findByPk(commentId);
  },

  /**
   * Delete comment by ID
   * @param {number} commentId - Comment ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteComment(commentId) {
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return false;
    }

    await comment.destroy();
    return true;
  }
};

module.exports = commentService;
