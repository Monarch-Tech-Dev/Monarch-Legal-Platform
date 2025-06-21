import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Placeholder for users routes
router.get('/profile', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: (req as any).user,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id']
  });
}));

export default router;