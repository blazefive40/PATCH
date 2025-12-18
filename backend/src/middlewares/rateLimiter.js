const rateLimit = require('express-rate-limit');

/**
 * Rate limiting configuration to prevent abuse
 */

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for write operations (POST, PUT, DELETE)
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 write requests per windowMs
  message: {
    success: false,
    error: 'Too many write requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict limiter for user population (to prevent database flooding)
const populateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 populate requests per hour
  message: {
    success: false,
    error: 'Too many populate requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  writeLimiter,
  populateLimiter
};
