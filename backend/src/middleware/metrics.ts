import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

const analysisRequestsTotal = new client.Counter({
  name: 'analysis_requests_total',
  help: 'Total number of analysis requests',
  labelNames: ['module', 'status', 'user_tier'],
  registers: [register]
});

const analysisProcessingTime = new client.Histogram({
  name: 'analysis_processing_time_seconds',
  help: 'Time spent processing analysis requests',
  labelNames: ['module'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60],
  registers: [register]
});

const contradictionsFoundTotal = new client.Counter({
  name: 'contradictions_found_total',
  help: 'Total number of contradictions detected',
  labelNames: ['type', 'confidence_level'],
  registers: [register]
});

const documentUploadsTotal = new client.Counter({
  name: 'document_uploads_total',
  help: 'Total number of document uploads',
  labelNames: ['file_type', 'status', 'user_tier'],
  registers: [register]
});

const documentSizeBytes = new client.Histogram({
  name: 'document_size_bytes',
  help: 'Size of uploaded documents in bytes',
  buckets: [1024, 10240, 102400, 1048576, 10485760], // 1KB to 10MB
  registers: [register]
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Override response end to capture metrics
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): any {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    // Record HTTP metrics
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode.toString()
    });
    
    httpRequestDuration.observe({
      method: req.method,
      route
    }, duration);
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Metrics endpoint
export const getMetrics = async (req: Request, res: Response): Promise<void> => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

// Helper functions to record custom metrics
export const recordAnalysisRequest = (module: string, status: string, userTier: string): void => {
  analysisRequestsTotal.inc({ module, status, user_tier: userTier });
};

export const recordAnalysisProcessingTime = (module: string, durationSeconds: number): void => {
  analysisProcessingTime.observe({ module }, durationSeconds);
};

export const recordContradictionFound = (type: string, confidence: number): void => {
  const confidenceLevel = confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'medium' : 'low';
  contradictionsFoundTotal.inc({ type, confidence_level: confidenceLevel });
};

export const recordDocumentUpload = (fileType: string, status: string, userTier: string, sizeBytes: number): void => {
  documentUploadsTotal.inc({ file_type: fileType, status, user_tier: userTier });
  documentSizeBytes.observe(sizeBytes);
};

export { register };
export default metricsMiddleware;