import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { getMetrics } from '../middleware/metrics';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: connected
 *                     redis:
 *                       type: string
 *                       example: connected
 */
router.get('/', asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      database: 'connected', // TODO: Check actual database connection
      redis: 'connected',     // TODO: Check actual Redis connection
      neo4j: 'connected'      // TODO: Check actual Neo4j connection
    }
  };

  res.json(health);
}));

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check for Kubernetes
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', asyncHandler(async (req, res) => {
  // TODO: Implement actual readiness checks
  const isReady = true; // Placeholder
  
  if (isReady) {
    res.json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
}));

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check for Kubernetes
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', asyncHandler(async (req, res) => {
  res.json({ status: 'alive' });
}));

// Metrics endpoint
router.get('/metrics', getMetrics);

export default router;