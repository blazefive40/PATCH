const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { connectDB } = require('./config/database');
const routes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimiter');

const app = express();
const port = process.env.PORT || 8000;
const isProduction = process.env.NODE_ENV === 'production';

// Enhanced security middleware with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));

// CORS configuration - strict in production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000'
    ];

    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Cookie parser for CSRF
app.use(cookieParser());

// Body parsers with size limits to prevent DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.text({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Apply rate limiting to all routes
app.use(apiLimiter);

// Request logging middleware (only log errors in production)
if (!isProduction) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Security headers for all responses
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Routes
app.use('/', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler - hide details in production
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Don't leak error details in production
  const errorMessage = isProduction
    ? 'An error occurred'
    : (err.message || 'Internal server error');

  res.status(err.status || 500).json({
    success: false,
    error: errorMessage,
    ...((!isProduction && err.stack) && { stack: err.stack })
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 Security features enabled:`);
      console.log(`   - Helmet with strict CSP`);
      console.log(`   - Rate limiting`);
      console.log(`   - XSS protection`);
      console.log(`   - Input validation`);
      console.log(`   - SQL injection protection (ORM)`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
