/**
 * Monarch Legal Platform - API Marketplace
 * Third-party integrations, webhooks, and developer ecosystem
 */

import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { authentication } from '../middleware/authentication';
import { rateLimiter } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const router = Router();

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'legal_research' | 'case_management' | 'document_automation' | 'communication' | 'analytics';
  provider: string;
  apiVersion: string;
  endpoints: IntegrationEndpoint[];
  authentication: 'api_key' | 'oauth2' | 'jwt';
  webhookSupport: boolean;
  rateLimits: RateLimit[];
  pricing: PricingTier[];
  documentation: string;
  status: 'active' | 'beta' | 'deprecated';
  installCount: number;
  rating: number;
  lastUpdated: Date;
}

interface IntegrationEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters: Parameter[];
  responseSchema: any;
  examples: any[];
}

interface Parameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: any;
}

interface RateLimit {
  tier: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}

interface PricingTier {
  name: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  requestLimits: RateLimit;
}

interface WebhookSubscription {
  id: string;
  userId: string;
  integrationId: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    retryDelay: number;
  };
  createdAt: Date;
  lastTriggered?: Date;
  failureCount: number;
}

interface DeveloperKey {
  id: string;
  userId: string;
  keyName: string;
  apiKey: string;
  hashedKey: string;
  permissions: string[];
  rateLimits: RateLimit;
  lastUsed?: Date;
  usageCount: number;
  createdAt: Date;
  expiresAt?: Date;
  active: boolean;
}

// Mock data stores (would be replaced with actual database)
const integrations: Map<string, Integration> = new Map();
const webhookSubscriptions: Map<string, WebhookSubscription> = new Map();
const developerKeys: Map<string, DeveloperKey> = new Map();

/**
 * @swagger
 * /api/marketplace/integrations:
 *   get:
 *     summary: List available integrations
 *     tags: [Marketplace]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search integrations
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of integrations
 */
router.get('/integrations',
  [
    query('category').optional().isIn(['legal_research', 'case_management', 'document_automation', 'communication', 'analytics']),
    query('search').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { category, search, limit = 20 } = req.query;

    let filteredIntegrations = Array.from(integrations.values());

    // Filter by category
    if (category) {
      filteredIntegrations = filteredIntegrations.filter(i => i.category === category);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredIntegrations = filteredIntegrations.filter(i => 
        i.name.toLowerCase().includes(searchLower) ||
        i.description.toLowerCase().includes(searchLower) ||
        i.provider.toLowerCase().includes(searchLower)
      );
    }

    // Sort by rating and install count
    filteredIntegrations.sort((a, b) => 
      (b.rating * Math.log(b.installCount + 1)) - (a.rating * Math.log(a.installCount + 1))
    );

    const results = filteredIntegrations.slice(0, limit);

    res.json({
      success: true,
      data: {
        integrations: results.map(i => ({
          id: i.id,
          name: i.name,
          description: i.description,
          category: i.category,
          provider: i.provider,
          rating: i.rating,
          installCount: i.installCount,
          status: i.status,
          pricing: i.pricing.map(p => ({
            name: p.name,
            price: p.price,
            currency: p.currency,
            billingPeriod: p.billingPeriod
          }))
        })),
        total: filteredIntegrations.length,
        categories: ['legal_research', 'case_management', 'document_automation', 'communication', 'analytics']
      },
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/marketplace/integrations/{integrationId}:
 *   get:
 *     summary: Get integration details
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: integrationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Integration details
 */
router.get('/integrations/:integrationId',
  [param('integrationId').notEmpty()],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { integrationId } = req.params;

    const integration = integrations.get(integrationId);
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INTEGRATION_NOT_FOUND',
          message: 'Integration not found'
        }
      });
    }

    res.json({
      success: true,
      data: integration,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/marketplace/integrations/{integrationId}/install:
 *   post:
 *     summary: Install an integration
 *     tags: [Marketplace]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: integrationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pricingTier:
 *                 type: string
 *               configuration:
 *                 type: object
 *     responses:
 *       200:
 *         description: Integration installed successfully
 */
router.post('/integrations/:integrationId/install',
  authentication,
  [
    param('integrationId').notEmpty(),
    body('pricingTier').notEmpty(),
    body('configuration').optional().isObject()
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { integrationId } = req.params;
    const { pricingTier, configuration } = req.body;
    const user = req.user;

    const integration = integrations.get(integrationId);
    if (!integration) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INTEGRATION_NOT_FOUND',
          message: 'Integration not found'
        }
      });
    }

    // Validate pricing tier
    const selectedTier = integration.pricing.find(p => p.name === pricingTier);
    if (!selectedTier) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRICING_TIER',
          message: 'Invalid pricing tier selected'
        }
      });
    }

    // Generate API credentials for the integration
    const credentials = await generateIntegrationCredentials(user.id, integrationId);

    // Install integration for user
    const installation = {
      id: `install_${Date.now()}`,
      userId: user.id,
      integrationId,
      pricingTier: selectedTier,
      configuration: configuration || {},
      credentials,
      installedAt: new Date(),
      active: true
    };

    // Update install count
    integration.installCount++;
    integrations.set(integrationId, integration);

    logger.info('Integration installed', {
      userId: user.id,
      integrationId,
      pricingTier: selectedTier.name
    });

    res.json({
      success: true,
      data: {
        installationId: installation.id,
        integration: {
          id: integration.id,
          name: integration.name,
          provider: integration.provider
        },
        credentials: credentials,
        endpoints: integration.endpoints.map(e => ({
          method: e.method,
          path: e.path,
          description: e.description
        }))
      },
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/marketplace/webhooks:
 *   post:
 *     summary: Create webhook subscription
 *     tags: [Marketplace]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - events
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *               retryPolicy:
 *                 type: object
 *     responses:
 *       201:
 *         description: Webhook created successfully
 */
router.post('/webhooks',
  authentication,
  [
    body('url').isURL(),
    body('events').isArray().notEmpty(),
    body('retryPolicy').optional().isObject()
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { url, events, retryPolicy } = req.body;
    const user = req.user;

    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook: WebhookSubscription = {
      id: `webhook_${Date.now()}`,
      userId: user.id,
      integrationId: req.body.integrationId || 'core',
      url,
      events,
      secret,
      active: true,
      retryPolicy: retryPolicy || {
        maxRetries: 3,
        backoffStrategy: 'exponential',
        retryDelay: 1000
      },
      createdAt: new Date(),
      failureCount: 0
    };

    webhookSubscriptions.set(webhook.id, webhook);

    logger.info('Webhook subscription created', {
      userId: user.id,
      webhookId: webhook.id,
      url,
      events
    });

    res.status(201).json({
      success: true,
      data: {
        webhookId: webhook.id,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret,
        active: webhook.active,
        createdAt: webhook.createdAt
      },
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/marketplace/webhooks:
 *   get:
 *     summary: List webhook subscriptions
 *     tags: [Marketplace]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of webhook subscriptions
 */
router.get('/webhooks',
  authentication,
  asyncHandler(async (req: any, res: any) => {
    const user = req.user;

    const userWebhooks = Array.from(webhookSubscriptions.values())
      .filter(w => w.userId === user.id)
      .map(w => ({
        id: w.id,
        url: w.url,
        events: w.events,
        active: w.active,
        createdAt: w.createdAt,
        lastTriggered: w.lastTriggered,
        failureCount: w.failureCount
      }));

    res.json({
      success: true,
      data: {
        webhooks: userWebhooks,
        total: userWebhooks.length
      },
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/marketplace/api-keys:
 *   post:
 *     summary: Generate API key
 *     tags: [Marketplace]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - keyName
 *               - permissions
 *             properties:
 *               keyName:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: API key generated successfully
 */
router.post('/api-keys',
  authentication,
  rateLimiter, // Limit API key generation
  [
    body('keyName').notEmpty(),
    body('permissions').isArray().notEmpty(),
    body('expiresAt').optional().isISO8601()
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { keyName, permissions, expiresAt } = req.body;
    const user = req.user;

    // Generate API key
    const apiKey = `mlp_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    const developerKey: DeveloperKey = {
      id: `key_${Date.now()}`,
      userId: user.id,
      keyName,
      apiKey,
      hashedKey,
      permissions,
      rateLimits: {
        tier: 'standard',
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      },
      usageCount: 0,
      createdAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      active: true
    };

    developerKeys.set(developerKey.id, developerKey);

    logger.info('API key generated', {
      userId: user.id,
      keyId: developerKey.id,
      keyName,
      permissions
    });

    res.status(201).json({
      success: true,
      data: {
        keyId: developerKey.id,
        keyName: developerKey.keyName,
        apiKey: developerKey.apiKey, // Only shown once
        permissions: developerKey.permissions,
        rateLimits: developerKey.rateLimits,
        createdAt: developerKey.createdAt,
        expiresAt: developerKey.expiresAt
      },
      warning: 'Store this API key securely. It will not be shown again.',
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/marketplace/api-keys:
 *   get:
 *     summary: List API keys
 *     tags: [Marketplace]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of API keys
 */
router.get('/api-keys',
  authentication,
  asyncHandler(async (req: any, res: any) => {
    const user = req.user;

    const userKeys = Array.from(developerKeys.values())
      .filter(k => k.userId === user.id)
      .map(k => ({
        id: k.id,
        keyName: k.keyName,
        permissions: k.permissions,
        rateLimits: k.rateLimits,
        lastUsed: k.lastUsed,
        usageCount: k.usageCount,
        createdAt: k.createdAt,
        expiresAt: k.expiresAt,
        active: k.active,
        // API key itself is never returned in list
        maskedKey: `${k.apiKey.substring(0, 8)}...${k.apiKey.substring(k.apiKey.length - 4)}`
      }));

    res.json({
      success: true,
      data: {
        apiKeys: userKeys,
        total: userKeys.length
      },
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/marketplace/usage:
 *   get:
 *     summary: Get API usage statistics
 *     tags: [Marketplace]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Usage period
 *     responses:
 *       200:
 *         description: Usage statistics
 */
router.get('/usage',
  authentication,
  [query('period').optional().isIn(['day', 'week', 'month'])],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const user = req.user;
    const { period = 'day' } = req.query;

    // Mock usage data (would query actual usage from database)
    const usageData = {
      period,
      totalRequests: 1247,
      successfulRequests: 1189,
      failedRequests: 58,
      averageResponseTime: 245, // ms
      quotaUsed: 0.124, // 12.4% of quota used
      quotaRemaining: 8753,
      topEndpoints: [
        { endpoint: '/api/v1/analyze/document', requests: 456, avgResponseTime: 1200 },
        { endpoint: '/api/v1/patterns/match', requests: 234, avgResponseTime: 180 },
        { endpoint: '/api/v1/generate/response', requests: 189, avgResponseTime: 890 }
      ],
      errorBreakdown: {
        '400': 23,
        '429': 15, // Rate limited
        '500': 12,
        '503': 8
      },
      integrationUsage: [
        { integrationId: 'lovdata_search', requests: 89, quota: 1000 },
        { integrationId: 'rettsdata_api', requests: 34, quota: 500 }
      ]
    };

    res.json({
      success: true,
      data: usageData,
      timestamp: new Date().toISOString()
    });
  })
);

// Helper functions

async function generateIntegrationCredentials(userId: string, integrationId: string) {
  return {
    clientId: `client_${crypto.randomBytes(16).toString('hex')}`,
    clientSecret: crypto.randomBytes(32).toString('hex'),
    apiKey: `integration_${crypto.randomBytes(24).toString('hex')}`,
    webhookSecret: crypto.randomBytes(16).toString('hex')
  };
}

// Initialize with example integrations
function initializeMarketplace() {
  const lovdataIntegration: Integration = {
    id: 'lovdata_legal_search',
    name: 'Lovdata Legal Search',
    description: 'Search Norwegian laws, regulations, and legal precedents directly from Lovdata',
    category: 'legal_research',
    provider: 'Lovdata AS',
    apiVersion: '2.1',
    endpoints: [
      {
        method: 'GET',
        path: '/search/laws',
        description: 'Search Norwegian laws and regulations',
        parameters: [
          {
            name: 'query',
            type: 'string',
            required: true,
            description: 'Search query',
            example: 'yrkesskadeforskriften'
          },
          {
            name: 'limit',
            type: 'number',
            required: false,
            description: 'Number of results to return',
            example: 10
          }
        ],
        responseSchema: {
          type: 'object',
          properties: {
            results: { type: 'array' },
            total: { type: 'number' }
          }
        },
        examples: []
      }
    ],
    authentication: 'api_key',
    webhookSupport: true,
    rateLimits: [
      {
        tier: 'basic',
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 1000
      },
      {
        tier: 'professional',
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      }
    ],
    pricing: [
      {
        name: 'basic',
        price: 99,
        currency: 'NOK',
        billingPeriod: 'monthly',
        features: ['1000 searches/month', 'Basic support'],
        requestLimits: {
          tier: 'basic',
          requestsPerMinute: 10,
          requestsPerHour: 100,
          requestsPerDay: 1000
        }
      },
      {
        name: 'professional',
        price: 999,
        currency: 'NOK',
        billingPeriod: 'monthly',
        features: ['10000 searches/month', 'Priority support', 'Advanced filters'],
        requestLimits: {
          tier: 'professional',
          requestsPerMinute: 60,
          requestsPerHour: 1000,
          requestsPerDay: 10000
        }
      }
    ],
    documentation: 'https://api.lovdata.no/docs',
    status: 'active',
    installCount: 1247,
    rating: 4.8,
    lastUpdated: new Date()
  };

  integrations.set(lovdataIntegration.id, lovdataIntegration);

  // Add more example integrations...
  const caseManagementIntegration: Integration = {
    id: 'legal_case_manager',
    name: 'Legal Case Manager',
    description: 'Comprehensive case management and client communication platform',
    category: 'case_management',
    provider: 'LegalTech Solutions',
    apiVersion: '1.0',
    endpoints: [
      {
        method: 'POST',
        path: '/cases',
        description: 'Create a new case',
        parameters: [
          {
            name: 'title',
            type: 'string',
            required: true,
            description: 'Case title'
          },
          {
            name: 'clientId',
            type: 'string',
            required: true,
            description: 'Client identifier'
          }
        ],
        responseSchema: {
          type: 'object',
          properties: {
            caseId: { type: 'string' },
            status: { type: 'string' }
          }
        },
        examples: []
      }
    ],
    authentication: 'oauth2',
    webhookSupport: true,
    rateLimits: [
      {
        tier: 'standard',
        requestsPerMinute: 30,
        requestsPerHour: 500,
        requestsPerDay: 5000
      }
    ],
    pricing: [
      {
        name: 'standard',
        price: 299,
        currency: 'NOK',
        billingPeriod: 'monthly',
        features: ['Unlimited cases', 'Client portal', 'Document management'],
        requestLimits: {
          tier: 'standard',
          requestsPerMinute: 30,
          requestsPerHour: 500,
          requestsPerDay: 5000
        }
      }
    ],
    documentation: 'https://docs.legaltech.com/api',
    status: 'active',
    installCount: 567,
    rating: 4.6,
    lastUpdated: new Date()
  };

  integrations.set(caseManagementIntegration.id, caseManagementIntegration);
}

// Initialize on startup
initializeMarketplace();

export default router;