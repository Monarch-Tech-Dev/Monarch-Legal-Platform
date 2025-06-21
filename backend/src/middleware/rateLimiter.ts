import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Redis client for distributed rate limiting
let redis: Redis | null = null;
try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
} catch (error) {
  logger.warn('Redis not available for rate limiting, using memory store');
}

// Custom rate limit store using Redis
class RedisStore {
  private redis: Redis;
  private prefix: string;

  constructor(redisClient: Redis, prefix = 'rl:') {
    this.redis = redisClient;
    this.prefix = prefix;
  }

  async incr(key: string, window: number): Promise<{ totalHits: number; resetTime: number }> {
    const redisKey = `${this.prefix}${key}`;
    const multi = this.redis.multi();
    
    multi.incr(redisKey);
    multi.expire(redisKey, Math.ceil(window / 1000));
    
    const results = await multi.exec();
    const totalHits = results?.[0]?.[1] as number || 0;
    const resetTime = Date.now() + window;
    
    return { totalHits, resetTime };
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(`${this.prefix}${key}`);
  }
}

// Get user tier from request
const getUserTier = (req: Request): string => {
  const user = (req as any).user;
  return user?.tier || 'free';
};

// Get rate limit based on user tier
const getRateLimit = (tier: string, endpoint: string): number => {
  const limits = {
    free: {
      analysis: parseInt(process.env.RATE_LIMIT_FREE_TIER || '3'),
      general: 100
    },
    professional: {
      analysis: parseInt(process.env.RATE_LIMIT_PRO_TIER || '100'),
      general: 1000
    },
    legal_firm: {
      analysis: parseInt(process.env.RATE_LIMIT_ENTERPRISE_TIER || '1000'),
      general: 5000
    },
    enterprise: {
      analysis: parseInt(process.env.RATE_LIMIT_ENTERPRISE_TIER || '1000'),
      general: 10000
    }
  };

  const tierLimits = limits[tier as keyof typeof limits] || limits.free;
  return tierLimits[endpoint as keyof typeof tierLimits] || tierLimits.general;
};

// Key generator function
const keyGenerator = (req: Request): string => {
  const user = (req as any).user;
  const userId = user?.id || req.ip || 'unknown';
  const endpoint = req.path.split('/')[3] || 'general'; // Extract endpoint from path
  return `${userId}:${endpoint}`;
};

// Custom handler for rate limit exceeded
const rateLimitHandler = (req: Request, res: Response) => {
  const user = (req as any).user;
  const tier = getUserTier(req);
  
  logger.warn('Rate limit exceeded', {
    userId: user?.id,
    userTier: tier,
    ip: req.ip,
    path: req.path,
    userAgent: req.get('User-Agent')
  });

  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit exceeded for ${tier} tier. Please upgrade your plan or wait before making more requests.`,
      details: {
        tier,
        resetTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        upgradeUrl: process.env.FRONTEND_URL + '/upgrade'
      }
    },
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] as string
  });
};

// Create store based on Redis availability  
const createStore = () => {
  if (redis) {
    return new RedisStore(redis) as any; // Type assertion for compatibility
  }
  // Fallback to memory store (not recommended for production)
  return undefined; // Express rate limit will use default memory store
};

// General rate limiter
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  max: (req: Request) => {
    const tier = getUserTier(req);
    return getRateLimit(tier, 'general');
  },
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore()
});

// Analysis-specific rate limiter (more restrictive)
export const analysisRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'), // 1 hour
  max: (req: Request) => {
    const tier = getUserTier(req);
    return getRateLimit(tier, 'analysis');
  },
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    const userId = user?.id || req.ip || 'unknown';
    return `${userId}:analysis`;
  },
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore()
});

// Authentication rate limiter (for login attempts)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  keyGenerator: (req: Request) => req.ip || 'unknown',
  handler: (req: Request, res: Response) => {
    logger.warn('Authentication rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body.email
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again later.',
        details: {
          retryAfter: '15 minutes'
        }
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore()
});

// Upload rate limiter
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (req: Request) => {
    const tier = getUserTier(req);
    const limits = { free: 3, professional: 20, legal_firm: 50, enterprise: 100 };
    return limits[tier as keyof typeof limits] || limits.free;
  },
  keyGenerator,
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore()
});

export default rateLimiter;