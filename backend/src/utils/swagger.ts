import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Monarch Legal Platform API',
      version: '1.0.0',
      description: 'API for the Monarch Legal Platform - AI-powered legal document analysis and institutional protection',
      contact: {
        name: 'Monarch Legal Team',
        email: 'support@monarch-legal.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Error code'
                },
                message: {
                  type: 'string',
                  description: 'Error message'
                },
                details: {
                  type: 'object',
                  description: 'Additional error details'
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp'
            },
            requestId: {
              type: 'string',
              description: 'Unique request identifier'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User unique identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            role: {
              type: 'string',
              enum: ['user', 'lawyer', 'admin'],
              description: 'User role'
            },
            tier: {
              type: 'string',
              enum: ['free', 'professional', 'legal_firm', 'enterprise'],
              description: 'User subscription tier'
            },
            verified: {
              type: 'boolean',
              description: 'Email verification status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp'
            }
          }
        },
        AnalyzeDocumentResponse: {
          type: 'object',
          properties: {
            analysisId: {
              type: 'string',
              description: 'Unique analysis identifier'
            },
            overallScore: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Overall confidence score of the analysis'
            },
            severity: {
              type: 'string',
              enum: ['critical', 'warning', 'info'],
              description: 'Severity level of findings'
            },
            findings: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Finding'
              }
            },
            recommendations: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Recommendation'
              }
            },
            processingTime: {
              type: 'number',
              description: 'Processing time in milliseconds'
            }
          }
        },
        Finding: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Type of finding'
            },
            evidence: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Evidence supporting the finding'
            },
            explanation: {
              type: 'string',
              description: 'Explanation of the finding'
            },
            confidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Confidence level of the finding'
            },
            severity: {
              type: 'string',
              enum: ['critical', 'warning', 'info'],
              description: 'Severity level'
            },
            legalImplication: {
              type: 'string',
              description: 'Legal implications of the finding'
            }
          }
        },
        Recommendation: {
          type: 'object',
          properties: {
            strategy: {
              type: 'string',
              description: 'Recommended strategy'
            },
            priority: {
              type: 'string',
              enum: ['immediate', 'high', 'medium', 'low'],
              description: 'Priority level'
            },
            successProbability: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Probability of success'
            },
            description: {
              type: 'string',
              description: 'Description of the recommendation'
            },
            requiredActions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Actions required to implement the recommendation'
            },
            expectedOutcome: {
              type: 'string',
              description: 'Expected outcome'
            },
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Risk level'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Analysis',
        description: 'Document analysis and contradiction detection'
      },
      {
        name: 'Documents',
        description: 'Document management'
      },
      {
        name: 'Cases',
        description: 'Legal case management'
      },
      {
        name: 'Health',
        description: 'System health and monitoring'
      }
    ]
  },
  apis: [
    './src/api/*.ts', // Path to the API files
    './src/routes/*.ts'
  ]
};

export const setupSwagger = (app: Express): void => {
  const specs = swaggerJsdoc(options);
  
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Monarch Legal Platform API Documentation'
  }));
  
  // Serve raw OpenAPI JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default setupSwagger;