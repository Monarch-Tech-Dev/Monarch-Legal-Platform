import winston from 'winston';
import path from 'path';

const logLevel = process.env.LOG_LEVEL || 'info';
const nodeEnv = process.env.NODE_ENV || 'development';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let log = `${timestamp} [${level}] ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Logger configuration
export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { 
    service: 'monarch-backend',
    environment: nodeEnv
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Console output
    new winston.transports.Console({
      format: nodeEnv === 'development' ? consoleFormat : logFormat
    })
  ]
});

// Additional transport for structured logging in production
if (nodeEnv === 'production') {
  // Add external logging services here (e.g., Sentry, New Relic, etc.)
  if (process.env.SENTRY_DSN) {
    // Sentry integration would go here
  }
}

// Create a stream for Morgan HTTP request logging
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Helper functions for common logging patterns
export const logRequest = (req: any, message: string, meta?: any) => {
  logger.info(message, {
    requestId: req.id,
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    ...meta
  });
};

export const logError = (error: Error, context?: string, meta?: any) => {
  logger.error(`${context ? `[${context}] ` : ''}${error.message}`, {
    error: error.stack,
    ...meta
  });
};

export const logAnalysis = (analysisId: string, documentId: string, message: string, meta?: any) => {
  logger.info(`[ANALYSIS] ${message}`, {
    analysisId,
    documentId,
    ...meta
  });
};

export const logSecurity = (event: string, details: any) => {
  logger.warn(`[SECURITY] ${event}`, {
    securityEvent: true,
    ...details
  });
};

export const logPerformance = (operation: string, duration: number, meta?: any) => {
  logger.info(`[PERFORMANCE] ${operation}`, {
    duration,
    performanceMetric: true,
    ...meta
  });
};

// Ensure logs directory exists
import fs from 'fs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export default logger;