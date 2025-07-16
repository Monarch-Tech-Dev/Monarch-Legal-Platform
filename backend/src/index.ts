import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { authentication } from './middleware/authentication';
import { requestLogger } from './middleware/requestLogger';
import { metricsMiddleware } from './middleware/metrics';

// Route imports
import authRoutes from './api/auth';
import documentRoutes from './api/documents';
import analysisRoutes from './api/analysis';
import responseRoutes from './api/responses';
import caseRoutes from './api/cases';
import userRoutes from './api/users';
import patternRoutes from './api/patterns';
import healthRoutes from './api/health';
import outreachRoutes from './api/outreach';
import marketplaceRoutes from './api/marketplace';

// Database connections
import { initializeDatabase } from './database/connection';
import { initializeRedis } from './database/redis';
import { initializeNeo4j } from './database/neo4j';

// WebSocket handling
import { setupWebSocket } from './services/websocket';

// Swagger documentation
import { setupSwagger } from './utils/swagger';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : true,
  credentials: true
}));

// Compression and parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}
app.use(requestLogger);

// Metrics middleware
app.use(metricsMiddleware);

// Rate limiting
app.use('/api/', rateLimiter);

// Health check (before authentication)
app.use('/health', healthRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', authentication, documentRoutes);
app.use('/api/analysis', authentication, analysisRoutes);
app.use('/api/responses', authentication, responseRoutes);
app.use('/api/cases', authentication, caseRoutes);
app.use('/api/users', authentication, userRoutes);
app.use('/api/patterns', authentication, patternRoutes);
app.use('/api/outreach', authentication, outreachRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Swagger documentation
if (NODE_ENV === 'development') {
  setupSwagger(app);
}

// WebSocket setup
setupWebSocket(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// Initialize database connections
async function initializeServices() {
  try {
    logger.info('Initializing database connections...');
    
    await initializeDatabase();
    logger.info('PostgreSQL connection established');
    
    await initializeRedis();
    logger.info('Redis connection established');
    
    await initializeNeo4j();
    logger.info('Neo4j connection established');
    
    logger.info('All database connections initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    server.listen(PORT, () => {
      logger.info(`🚀 Monarch Legal Platform API server running on port ${PORT}`);
      logger.info(`📚 Environment: ${NODE_ENV}`);
      if (NODE_ENV === 'development') {
        logger.info(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if this file is executed directly
if (require.main === module) {
  startServer();
}

export { app, server, io };
export default app;