import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { legalDatabaseService } from '../services/legalDatabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/outreach/assess-merit:
 *   post:
 *     summary: Assess case merit for potential legal assistance outreach
 *     tags: [Outreach]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - analysisId
 *               - contactInfo
 *             properties:
 *               analysisId:
 *                 type: string
 *                 description: Analysis ID from document analysis
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                 required: [email, name]
 *               caseDetails:
 *                 type: object
 *                 properties:
 *                   institution:
 *                     type: string
 *                   description:
 *                     type: string
 *                   urgency:
 *                     type: string
 *                     enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: Merit assessment completed
 *       400:
 *         description: Invalid request
 */
router.post('/assess-merit',
  [
    body('analysisId')
      .notEmpty()
      .withMessage('Analysis ID is required'),
    body('contactInfo.email')
      .isEmail()
      .withMessage('Valid email is required'),
    body('contactInfo.name')
      .notEmpty()
      .withMessage('Name is required')
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { analysisId, contactInfo, caseDetails } = req.body;
    const user = req.user;

    try {
      // TODO: Retrieve analysis results from database using analysisId
      // For now, mock the analysis results
      const mockAnalysisResults = {
        contradictionTypes: ['physical_confrontation_contradiction', 'settlement_contradiction'],
        confidence: 0.92,
        findings: 3,
        severity: 'critical'
      };

      // Assess case merit
      const meritAssessment = await legalDatabaseService.identifyHighMeritCases(mockAnalysisResults);
      
      // Generate outreach recommendation
      const outreachData = {
        caseId: `case_outreach_${Date.now()}`,
        userId: user.id,
        analysisId,
        contactInfo,
        caseDetails: caseDetails || {},
        meritAssessment,
        createdAt: new Date().toISOString(),
        status: 'assessed'
      };

      // Log high-merit case for follow-up
      if (meritAssessment.merit === 'high') {
        logger.info('High-merit case identified for outreach', {
          userId: user.id,
          analysisId,
          winProbability: meritAssessment.winProbability,
          estimatedValue: meritAssessment.estimatedValue,
          contactEmail: contactInfo.email
        });

        // TODO: Add to outreach queue/database
        // TODO: Send notification to legal team
      }

      res.json({
        success: true,
        data: {
          meritLevel: meritAssessment.merit,
          winProbability: meritAssessment.winProbability,
          estimatedValue: meritAssessment.estimatedValue,
          recommendation: meritAssessment.outreachRecommendation,
          nextSteps: generateNextSteps(meritAssessment.merit),
          outreachEligible: meritAssessment.merit === 'high'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      });

    } catch (error) {
      logger.error('Merit assessment failed', {
        userId: user.id,
        analysisId,
        error: (error as Error).message
      });
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/outreach/case-feedback:
 *   post:
 *     summary: Submit case outcome feedback for learning
 *     tags: [Outreach]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caseId
 *               - outcome
 *             properties:
 *               caseId:
 *                 type: string
 *               outcome:
 *                 type: string
 *                 enum: [won, settled, lost]
 *               settlementAmount:
 *                 type: number
 *               timeToResolution:
 *                 type: number
 *                 description: Resolution time in days
 *               feedback:
 *                 type: string
 *                 description: Additional feedback about the case
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 */
router.post('/case-feedback',
  [
    body('caseId')
      .notEmpty()
      .withMessage('Case ID is required'),
    body('outcome')
      .isIn(['won', 'settled', 'lost'])
      .withMessage('Valid outcome is required'),
    body('timeToResolution')
      .optional()
      .isNumeric()
      .withMessage('Time to resolution must be a number')
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { caseId, outcome, settlementAmount, timeToResolution, feedback } = req.body;
    const user = req.user;

    try {
      // Submit learning data
      await legalDatabaseService.learnFromCaseOutcome({
        contradictionTypes: ['settlement_contradiction'], // TODO: Get from case data
        outcome,
        settlementAmount,
        timeToResolution: timeToResolution || 0,
        opposingParty: 'Unknown', // TODO: Get from case data
        legalStrategy: ['contradiction_challenge'],
        successFactors: outcome === 'won' ? ['Strong evidence', 'Expert representation'] : [],
        failureFactors: outcome === 'lost' ? [feedback || 'Unknown factors'] : undefined,
        confidenceAtStart: 0.89, // TODO: Get from original analysis
        actualOutcome: outcome === 'won' ? 1.0 : outcome === 'settled' ? 0.75 : 0.0
      });

      logger.info('Case feedback submitted for learning', {
        userId: user.id,
        caseId,
        outcome,
        settlementAmount,
        timeToResolution
      });

      res.json({
        success: true,
        message: 'Takk for tilbakemeldingen! Dette hjelper oss å forbedre våre prediksjoner.',
        data: {
          caseId,
          outcome,
          learningImpact: 'Positive'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      });

    } catch (error) {
      logger.error('Case feedback submission failed', {
        userId: user.id,
        caseId,
        error: (error as Error).message
      });
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/outreach/high-merit-cases:
 *   get:
 *     summary: Get list of high-merit cases for legal team review
 *     tags: [Outreach]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: High-merit cases retrieved
 */
router.get('/high-merit-cases',
  asyncHandler(async (req: any, res: any) => {
    const user = req.user;
    const limit = parseInt(req.query.limit as string) || 20;

    // TODO: Implement database query for high-merit cases
    // For now, return mock data
    const mockHighMeritCases = [
      {
        id: 'case_001',
        analysisId: 'analysis_001',
        contactInfo: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        meritLevel: 'high',
        winProbability: 0.92,
        estimatedValue: 150000,
        contradictionTypes: ['settlement_contradiction', 'physical_confrontation_contradiction'],
        createdAt: new Date().toISOString(),
        status: 'pending_review'
      }
    ];

    res.json({
      success: true,
      data: {
        cases: mockHighMeritCases.slice(0, limit),
        total: mockHighMeritCases.length,
        summary: {
          totalHighMerit: mockHighMeritCases.length,
          avgWinProbability: 0.89,
          totalEstimatedValue: mockHighMeritCases.reduce((sum, c) => sum + c.estimatedValue, 0)
        }
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id']
    });
  })
);

/**
 * Generate next steps based on merit level
 */
function generateNextSteps(merit: string): string[] {
  switch (merit) {
    case 'high':
      return [
        'Last ned analyserapporten med alle juridiske referanser',
        'Kontakt en juridisk rådgiver for umiddelbar oppfølging',
        'Samle all relevant dokumentasjon relatert til saken',
        'Vurder å sende formell klage eller krav til institusjonen'
      ];
    case 'medium':
      return [
        'Gjennomgå analyserapporten grundig',
        'Vurder å få en andre mening fra juridisk ekspert',
        'Samle ytterligere dokumentasjon som styrker saken',
        'Overvåk lignende saker for precedens'
      ];
    default:
      return [
        'Gjennomgå analysen for å forstå utfordringene',
        'Vurder å forbedre dokumentasjonsgrunnlaget',
        'Søk juridisk rådgiving kun hvis situasjonen endrer seg betydelig'
      ];
  }
}

export default router;