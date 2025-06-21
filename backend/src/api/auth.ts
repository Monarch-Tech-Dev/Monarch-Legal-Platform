import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/errorHandler';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import { logger, logSecurity } from '../utils/logger';
import { CustomError, AuthenticationError } from '../middleware/errorHandler';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '@monarch/shared';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - acceptTerms
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *                 minLength: 2
 *               acceptTerms:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
router.post('/register',
  authRateLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('acceptTerms')
      .isBoolean()
      .custom(value => value === true)
      .withMessage('Terms and conditions must be accepted')
  ],
  validateRequest,
  asyncHandler(async (req: any, res: any) => {
    const { email, password, name, acceptTerms } = req.body;

    // Check if user already exists (placeholder)
    const existingUser = null; // TODO: Check database
    if (existingUser) {
      throw new CustomError('User already exists', 400, 'USER_EXISTS');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user (placeholder)
    const user = {
      id: `user_${Date.now()}`,
      email,
      name,
      tier: 'free',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true
    };

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, tier: user.tier },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );

    logSecurity('User registered', { userId: user.id, email });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          createdAt: user.createdAt
        },
        token,
        expiresIn: '24h'
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id']
    });
  })
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login',
  authRateLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email, password }: LoginRequest = req.body;

    logger.info('User login attempt', { email });

    // TODO: Fetch user from database
    // For now, simulate database lookup
    const user = {
      id: 'user_123',
      email,
      name: 'Test User',
      role: 'user',
      tier: 'free',
      verified: true,
      passwordHash: '$2a$10$example_hash', // This would come from database
      createdAt: new Date().toISOString()
    };

    if (!user) {
      logSecurity('Login attempt with non-existent email', { 
        email, 
        ip: req.ip 
      });
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    // const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    const isValidPassword = true; // Placeholder for demo

    if (!isValidPassword) {
      logSecurity('Login attempt with invalid password', { 
        userId: user.id, 
        email, 
        ip: req.ip 
      });
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tier: user.tier,
        verified: user.verified
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // TODO: Update last login time in database

    logger.info('User logged in successfully', { 
      userId: user.id, 
      email: user.email 
    });

    const userResponse: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      tier: user.tier as any,
      verified: user.verified,
      createdAt: user.createdAt,
      lastLogin: new Date().toISOString()
    };

    const response: LoginResponse = {
      token,
      refreshToken,
      user: userResponse,
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    };

    res.json({
      success: true,
      data: response,
      message: 'Login successful',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id']
    });
  })
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    try {
      const decoded = jwt.verify(refreshToken, jwtSecret) as any;
      
      // TODO: Fetch user from database
      const user = {
        id: decoded.userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        tier: 'free',
        verified: true,
        createdAt: new Date().toISOString()
      };

      // Generate new access token
      const newToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tier: user.tier,
          verified: user.verified
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      logger.info('Token refreshed successfully', { userId: user.id });

      res.json({
        success: true,
        data: {
          token: newToken,
          expiresIn: 24 * 60 * 60
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      });

    } catch (error) {
      logSecurity('Invalid refresh token used', { 
        ip: req.ip,
        error: (error as Error).message
      });
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  })
);

export default router;