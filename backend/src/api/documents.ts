import { Router } from 'express';
import { param, query } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { authentication } from '../middleware/authentication';
import { documentStorage } from '../models/Document';
import { fileStorage } from '../services/fileStorage';
import { logger } from '../utils/logger';
import { ApiResponse } from '@monarch/shared';

const router = Router();

// Apply authentication to all routes
router.use(authentication);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get user's documents
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of documents to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of documents to skip
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 */
router.get('/',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be 0 or greater')
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    logger.info('Retrieving user documents', {
      userId: user.id,
      limit,
      offset
    });

    const documents = await documentStorage.getUserDocuments(user.id, limit, offset);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        documents: documents.map(doc => ({
          id: doc.id,
          filename: doc.originalName,
          fileSize: doc.fileSize,
          mimeType: doc.mimeType,
          extractedText: doc.extractedText.substring(0, 500) + (doc.extractedText.length > 500 ? '...' : ''),
          metadata: doc.metadata,
          analysisIds: doc.analysisIds,
          tags: doc.tags,
          createdAt: doc.createdAt.toISOString(),
          updatedAt: doc.updatedAt.toISOString()
        })),
        pagination: {
          limit,
          offset,
          total: documents.length
        }
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string
    };

    res.json(response);
  })
);

/**
 * @swagger
 * /api/documents/stats:
 *   get:
 *     summary: Get document statistics
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Document statistics retrieved
 */
router.get('/stats',
  asyncHandler(async (req: any, res: any) => {
    const user = req.user;

    logger.info('Retrieving document statistics', {
      userId: user.id
    });

    const stats = await documentStorage.getUserStats(user.id);
    const storageUsage = await fileStorage.getUserStorageUsage(user.id);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        ...stats,
        storage: {
          used: storageUsage.totalSize,
          fileCount: storageUsage.fileCount,
          limit: user.tier === 'free' ? 100 * 1024 * 1024 : 'unlimited' // 100MB for free tier
        }
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string
    };

    res.json(response);
  })
);

export default router;