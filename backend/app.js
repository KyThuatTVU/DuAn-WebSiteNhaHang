// Main Application - Enterprise Architecture
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import custom modules
const { initDatabase } = require('./config/database');
const { requestLogger, logger } = require('./utils/logger');
const { specs, swaggerUi, swaggerUiOptions } = require('./config/swagger');
const {
  globalErrorHandler,
  notFound,
  handleUnhandledRejection,
  handleUncaughtException
} = require('./middleware/errorHandler');

// Import routes
const apiRoutes = require('./routes');

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.env = process.env.NODE_ENV || 'development';
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // Compression middleware
    this.app.use(compression());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: this.env === 'production' ? 100 : 1000, // limit each IP
      message: {
        error: 'Quá nhiều yêu cầu từ IP này',
        message: 'Vui lòng thử lại sau 15 phút'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // CORS configuration - Simple and permissive for development
    if (this.env !== 'production') {
      // Development: Allow everything
      this.app.use(cors({
        origin: true,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['*']
      }));
      console.log('🌐 CORS: Development mode - allowing all origins');
    } else {
      // Production: Strict CORS
      const allowedOrigins = (process.env.CORS_ORIGIN || 'https://yourdomain.com').split(',');
      this.app.use(cors({
        origin: allowedOrigins,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
      }));
      console.log('🔒 CORS: Production mode - restricted origins');
    }

    // Additional CORS headers for all requests
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;

      // Always set CORS headers
      if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
      } else {
        // For requests without origin (file://, mobile apps, etc.)
        res.header('Access-Control-Allow-Origin', '*');
      }

      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400'); // 24 hours

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        console.log(`✅ Preflight request from origin: ${origin || 'null'}`);
        res.status(200).end();
        return;
      }

      next();
    });

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: '10mb',
      type: 'application/json'
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));

    // Request logging
    this.app.use(requestLogger);

    // Static files
    this.app.use('/images', express.static(path.join(__dirname, 'images')));
    this.app.use('/public', express.static(path.join(__dirname, 'public')));

    // Request info middleware
    this.app.use((req, res, next) => {
      req.requestTime = new Date().toISOString();
      next();
    });

    logger.info('✅ Middlewares initialized');
  }

  initializeRoutes() {
    // Swagger Documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

    // Swagger JSON endpoint
    this.app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(specs);
    });

    // Health check route
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Restaurant API Server',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: this.env,
        endpoints: {
          api: '/api',
          health: '/api/health',
          docs: '/api/docs',
          swagger: '/api-docs'
        }
      });
    });

    // API routes
    this.app.use('/api', apiRoutes);

    // Legacy compatibility routes
    this.app.get('/api/test', (req, res) => {
      res.json({
        status: 'success',
        message: 'Backend is connected and running!',
        timestamp: new Date().toISOString()
      });
    });

    logger.info('✅ Routes initialized');
  }

  initializeErrorHandling() {
    // 404 handler
    this.app.use(notFound);

    // Global error handler
    this.app.use(globalErrorHandler);

    logger.info('✅ Error handling initialized');
  }

  async start() {
    try {
      // Initialize database connection
      await initDatabase();

      // Start server
      const server = this.app.listen(this.port, () => {
        logger.info(`🚀 Server running on port ${this.port}`);
        logger.info(`📱 Environment: ${this.env}`);
        logger.info(`🌐 API URL: http://localhost:${this.port}/api`);
        logger.info(`📚 Documentation: http://localhost:${this.port}/api/docs`);
        logger.info(`📖 Swagger UI: http://localhost:${this.port}/api-docs`);
        logger.info(`❤️  Health Check: http://localhost:${this.port}/api/health`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        logger.info('SIGTERM received. Shutting down gracefully...');
        server.close(() => {
          logger.info('Process terminated');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        logger.info('SIGINT received. Shutting down gracefully...');
        server.close(() => {
          logger.info('Process terminated');
          process.exit(0);
        });
      });

      return server;

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  getApp() {
    return this.app;
  }
}

module.exports = App;
