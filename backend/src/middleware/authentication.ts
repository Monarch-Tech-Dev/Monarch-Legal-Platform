import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from './errorHandler';
import { logger, logSecurity } from '../utils/logger';
import { User } from '@monarch/shared';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authentication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication token required');
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new AuthenticationError('Authentication token required');
    }
    
    // DEV MODE: Allow test token for development
    if (process.env.NODE_ENV === 'development' && token === 'dev-token-123') {
      const testUser: User = {
        id: 'dev-user-001',
        email: 'test@monarchlegal.no',
        name: 'Test User',
        role: 'user',
        tier: 'professional',
        verified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      req.user = testUser;
      logger.info('Development user authenticated', {
        userId: testUser.id,
        email: testUser.email
      });
      next();
      return;
    }
    
    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      throw new Error('Authentication configuration error');
    }
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // TODO: Fetch user from database using decoded.userId
    // For now, create a mock user object
    const user: User = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'user',
      tier: decoded.tier || 'free',
      verified: decoded.verified || false,
      createdAt: decoded.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    req.user = user;
    
    // Log successful authentication
    logger.info('User authenticated', {
      userId: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier
    });
    
    next();
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logSecurity('Invalid JWT token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error.message
      });
      next(new AuthenticationError('Invalid authentication token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      logSecurity('Expired JWT token', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next(new AuthenticationError('Authentication token expired'));
    } else {
      next(error);
    }
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    
    if (!user) {
      next(new AuthenticationError('Authentication required'));
      return;
    }
    
    if (!allowedRoles.includes(user.role)) {
      logSecurity('Insufficient role permissions', {
        userId: user.id,
        userRole: user.role,
        requiredRoles: allowedRoles,
        ip: req.ip,
        path: req.path
      });
      next(new AuthorizationError(`Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`));
      return;
    }
    
    next();
  };
};

export const requireTier = (allowedTiers: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    
    if (!user) {
      next(new AuthenticationError('Authentication required'));
      return;
    }
    
    if (!allowedTiers.includes(user.tier)) {
      logSecurity('Insufficient tier permissions', {
        userId: user.id,
        userTier: user.tier,
        requiredTiers: allowedTiers,
        ip: req.ip,
        path: req.path
      });
      next(new AuthorizationError(`Feature requires ${allowedTiers.join(' or ')} tier`));
      return;
    }
    
    next();
  };
};

// Optional authentication (doesn't fail if no token provided)
export const optionalAuthentication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      next();
      return;
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // TODO: Fetch user from database
    const user: User = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'user',
      tier: decoded.tier || 'free',
      verified: decoded.verified || false,
      createdAt: decoded.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    req.user = user;
    
  } catch (error) {
    // Ignore authentication errors for optional auth
    logger.debug('Optional authentication failed', {
      error: (error as Error).message
    });
  }
  
  next();
};

export default authentication;