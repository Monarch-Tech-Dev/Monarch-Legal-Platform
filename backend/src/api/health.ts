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

/**
 * @swagger
 * /health/test-contradiction:
 *   post:
 *     summary: Test contradiction detection without auth (development only)
 *     tags: [Health]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Vi tilbyr et oppgjør på 50 000 kroner. Vi benekter ethvert ansvar for skadene."
 *     responses:
 *       200:
 *         description: Test results
 */
router.post('/test-contradiction', asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' });
  }

  const { text } = req.body;
  
  if (!text || text.length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Text is required and must be at least 10 characters'
    });
  }

  // Import the contradiction detector
  const ContradictionDetector = require('../analyzers/contradictionDetector').default;
  const detector = new ContradictionDetector();

  // Create a mock processed document
  const processedDocument = {
    id: `test_${Date.now()}`,
    originalFile: null,
    extractedText: text,
    metadata: {
      filename: 'test_input',
      fileSize: text.length,
      mimeType: 'text/plain',
      language: 'no'
    },
    structure: {
      sections: [],
      entities: [],
      statements: [],
      metadata: {}
    },
    timestamp: new Date(),
    processingTime: 0
  };

  try {
    const startTime = Date.now();
    const result = await detector.analyze(processedDocument);
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        findings: result.findings,
        confidence: result.confidence,
        severity: result.severity,
        recommendations: result.recommendations,
        processingTime
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
}));

export default router;