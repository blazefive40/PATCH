const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Validators for User endpoints
 */
const validators = {
  // Validate userId in request body
  validateUserId: [
    body('userId')
      .exists().withMessage('userId is required')
      .isInt({ min: 1 }).withMessage('userId must be a positive integer')
      .toInt(),
    handleValidationErrors
  ],

  // Validate comment creation
  validateComment: [
    body()
      .custom((value, { req }) => {
        // Accept both text/plain (string) and JSON with comment field
        if (typeof value === 'string') {
          req.sanitizedComment = value.trim();
          return true;
        }
        if (value && typeof value.comment === 'string') {
          req.sanitizedComment = value.comment.trim();
          return true;
        }
        throw new Error('Comment text is required');
      })
      .custom((value, { req }) => {
        // Validate length
        if (!req.sanitizedComment || req.sanitizedComment.length === 0) {
          throw new Error('Comment cannot be empty');
        }
        if (req.sanitizedComment.length > 1000) {
          throw new Error('Comment must be less than 1000 characters');
        }
        return true;
      }),
    handleValidationErrors
  ],

  // Validate comment ID in URL params
  validateCommentId: [
    param('id')
      .exists().withMessage('Comment ID is required')
      .isInt({ min: 1 }).withMessage('Comment ID must be a positive integer')
      .toInt(),
    handleValidationErrors
  ]
};

module.exports = validators;
