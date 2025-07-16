import { Router } from 'express';
import { body, param } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { analysisRateLimiter } from '../middleware/rateLimiter';
import { uploadSingle, handleUploadError } from '../middleware/upload';
import { validateRequest } from '../middleware/validation';
import DocumentProcessor from '../services/documentProcessor';
import ContradictionDetector from '../analyzers/contradictionDetector';
import { logger } from '../utils/logger';
import { documentStorage } from '../models/Document';
import { fileStorage } from '../services/fileStorage';
import { 
  AnalyzeDocumentRequest, 
  AnalyzeDocumentResponse, 
  ApiResponse,
  ModuleResult
} from '@monarch/shared';

const router = Router();

// Initialize services
const documentProcessor = new DocumentProcessor();
const contradictionDetector = new ContradictionDetector();

/**
 * @swagger
 * /api/analysis/document:
 *   post:
 *     summary: Analyze uploaded document for contradictions and legal issues
 *     tags: [Analysis]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Document file (PDF, DOCX, TXT)
 *               modules:
 *                 type: string
 *                 description: JSON array of analysis modules to run
 *                 example: '["contradiction", "authority", "manipulation"]'
 *               options:
 *                 type: string
 *                 description: JSON object with analysis options
 *                 example: '{"language": "no", "jurisdiction": "norway"}'
 *     responses:
 *       200:
 *         description: Analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyzeDocumentResponse'
 *       400:
 *         description: Invalid request or file
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/document',
  analysisRateLimiter,
  uploadSingle,
  handleUploadError,
  [
    body('modules')
      .optional()
      .isJSON()
      .withMessage('Modules must be valid JSON array'),
    body('options')
      .optional()
      .isJSON()
      .withMessage('Options must be valid JSON object')
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const startTime = Date.now();
    const user = req.user;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No document file provided'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      });
    }

    try {
      // Parse request parameters
      const modules = req.body.modules ? JSON.parse(req.body.modules) : ['contradiction'];
      const options = req.body.options ? JSON.parse(req.body.options) : {};
      
      logger.info('Starting document analysis', {
        userId: user.id,
        filename: req.file.originalname,
        modules,
        options
      });

      // Step 1: Process document
      const processedDocument = await documentProcessor.processDocument(req.file, {
        extractMetadata: true,
        performNLP: true,
        language: options.language || 'no',
        jurisdiction: options.jurisdiction || 'norway'
      });

      // Step 2: Run analysis modules
      const moduleResults: ModuleResult[] = [];
      
      if (modules.includes('contradiction')) {
        // Log extracted text for debugging
        logger.info('Extracted text for contradiction analysis', {
          textLength: processedDocument.extractedText.length,
          textPreview: processedDocument.extractedText.substring(0, 500),
          documentId: processedDocument.id
        });
        
        const contradictionResult = await contradictionDetector.analyze(processedDocument);
        moduleResults.push(contradictionResult);
      }
      
      // TODO: Add other analysis modules (authority, manipulation, etc.)
      
      // Step 3: Combine results
      const findings = moduleResults.flatMap(result => result.findings);
      const recommendations = moduleResults.flatMap(result => result.recommendations);
      
      // Calculate overall score and severity
      const overallScore = moduleResults.length > 0 
        ? moduleResults.reduce((sum, result) => sum + result.confidence, 0) / moduleResults.length
        : 0;
      
      const severity = findings.some(f => f.severity === 'critical') ? 'critical' :
                      findings.some(f => f.severity === 'warning') ? 'warning' : 'info';
      
      const processingTime = Date.now() - startTime;
      
      // Generate unique analysis ID
      const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response: ApiResponse<AnalyzeDocumentResponse> = {
        success: true,
        data: {
          analysisId,
          overallScore,
          severity,
          findings,
          recommendations,
          processingTime
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      };

      // Store document permanently
      const storedFile = await fileStorage.storeFile(req.file, user.id);
      
      // Save document to database
      const documentRecord = await documentStorage.saveDocument({
        userId: user.id,
        filename: storedFile.filename,
        originalName: storedFile.originalName,
        fileSize: storedFile.fileSize,
        mimeType: storedFile.mimeType,
        filePath: storedFile.filePath,
        extractedText: processedDocument.extractedText,
        metadata: {
          language: options.language || 'no',
          jurisdiction: options.jurisdiction || 'norway',
          ...processedDocument.metadata
        },
        analysisIds: [analysisId],
        tags: [],
        isDeleted: false
      });

      // Save analysis results to database
      await documentStorage.saveAnalysis({
        userId: user.id,
        documentId: documentRecord.id,
        type: 'document',
        modules,
        options,
        results: {
          overallScore,
          severity,
          findings,
          recommendations,
          processingTime
        },
        status: 'completed'
      });

      logger.info('Document analysis completed', {
        userId: user.id,
        analysisId,
        documentId: documentRecord.id,
        findingsCount: findings.length,
        overallScore,
        severity,
        processingTime
      });

      res.json(response);

    } catch (error) {
      logger.error('Document analysis failed', {
        userId: user.id,
        filename: req.file.originalname,
        error: (error as Error).message
      });
      
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/analysis/text:
 *   post:
 *     summary: Analyze text for contradictions (real-time analysis)
 *     tags: [Analysis]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to analyze
 *                 minLength: 50
 *                 maxLength: 10000
 *               modules:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Analysis modules to run
 *                 default: ["contradiction"]
 *               options:
 *                 type: object
 *                 properties:
 *                   language:
 *                     type: string
 *                     default: "no"
 *                   jurisdiction:
 *                     type: string
 *                     default: "norway"
 *     responses:
 *       200:
 *         description: Text analysis completed
 */
router.post('/text',
  analysisRateLimiter,
  [
    body('text')
      .notEmpty()
      .withMessage('Text is required')
      .isLength({ min: 50, max: 10000 })
      .withMessage('Text must be between 50 and 10000 characters'),
    body('modules')
      .optional()
      .isArray()
      .withMessage('Modules must be an array'),
    body('options')
      .optional()
      .isObject()
      .withMessage('Options must be an object')
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const startTime = Date.now();
    const { text, modules = ['contradiction'], options = {} } = req.body;
    const user = req.user;

    logger.info('Starting text analysis', {
      userId: user.id,
      textLength: text.length,
      modules,
      options
    });

    try {
      // Create a mock processed document for text analysis
      const processedDocument = {
        id: `text_${Date.now()}`,
        originalFile: null as any,
        extractedText: text,
        metadata: {
          filename: 'direct_text_input',
          fileSize: text.length,
          mimeType: 'text/plain',
          language: options.language || 'no'
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

      // Run analysis modules
      const moduleResults: ModuleResult[] = [];
      
      if (modules.includes('contradiction')) {
        const contradictionResult = await contradictionDetector.analyze(processedDocument);
        moduleResults.push(contradictionResult);
      }

      // Combine results
      const findings = moduleResults.flatMap(result => result.findings);
      const recommendations = moduleResults.flatMap(result => result.recommendations);
      
      const overallScore = moduleResults.length > 0 
        ? moduleResults.reduce((sum, result) => sum + result.confidence, 0) / moduleResults.length
        : 0;
      
      const severity = findings.some(f => f.severity === 'critical') ? 'critical' :
                      findings.some(f => f.severity === 'warning') ? 'warning' : 'info';
      
      const processingTime = Date.now() - startTime;
      
      const response: ApiResponse = {
        success: true,
        data: {
          findings,
          recommendations,
          overallScore,
          severity,
          processingTime,
          realTime: true
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string
      };

      logger.info('Text analysis completed', {
        userId: user.id,
        findingsCount: findings.length,
        overallScore,
        severity,
        processingTime
      });

      res.json(response);

    } catch (error) {
      logger.error('Text analysis failed', {
        userId: user.id,
        textLength: text.length,
        error: (error as Error).message
      });
      
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/analysis/{analysisId}:
 *   get:
 *     summary: Get analysis results by ID
 *     tags: [Analysis]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: analysisId
 *         required: true
 *         schema:
 *           type: string
 *         description: Analysis ID
 *     responses:
 *       200:
 *         description: Analysis results retrieved
 *       404:
 *         description: Analysis not found
 */
router.get('/:analysisId',
  [
    param('analysisId')
      .notEmpty()
      .withMessage('Analysis ID is required')
      .matches(/^analysis_\d+_[a-z0-9]+$/)
      .withMessage('Invalid analysis ID format')
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { analysisId } = req.params;
    const user = req.user;

    logger.info('Retrieving analysis', {
      userId: user.id,
      analysisId
    });

    // Retrieve analysis from storage
    const analysis = await documentStorage.getAnalysis(analysisId, user.id);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: 'Analysis not found or access denied'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      });
    }

    // Get associated document if it exists
    let documentInfo: any = null;
    if (analysis.documentId) {
      const document = await documentStorage.getDocument(analysis.documentId, user.id);
      if (document) {
        documentInfo = {
          id: document.id,
          filename: document.originalName,
          fileSize: document.fileSize,
          uploadedAt: document.createdAt.toISOString()
        };
      }
    }

    const response: ApiResponse<any> = {
      success: true,
      data: {
        analysisId: analysis.id,
        overallScore: analysis.results.overallScore,
        severity: analysis.results.severity,
        findings: analysis.results.findings,
        recommendations: analysis.results.recommendations,
        processingTime: analysis.results.processingTime,
        documentInfo
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string
    };

    res.json(response);
  })
);

/**
 * @swagger
 * /api/analysis/stats:
 *   get:
 *     summary: Get analysis statistics and capabilities
 *     tags: [Analysis]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Analysis statistics retrieved
 */
router.get('/stats',
  asyncHandler(async (req: any, res: any) => {
    const user = req.user;

    const stats = {
      supportedModules: [
        {
          id: 'contradiction',
          name: 'Contradiction Detection',
          description: 'Detects logical contradictions in legal documents',
          successRate: 0.89,
          supportedLanguages: ['no', 'en'],
          version: '1.0.0'
        }
        // TODO: Add other modules
      ],
      processingCapabilities: documentProcessor.getProcessingStats(),
      userStats: {
        tier: user.tier,
        analysesRemaining: user.tier === 'free' ? 3 : 'unlimited', // TODO: Get from database
        totalAnalyses: 0 // TODO: Get from database
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id']
    });
  })
);

export default router;