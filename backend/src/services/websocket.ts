import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export const setupWebSocket = (io: SocketIOServer): void => {
  // Authentication middleware for WebSocket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return next(new Error('JWT secret not configured'));
      }
      
      const decoded = jwt.verify(token, jwtSecret) as any;
      (socket as any).userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    logger.info('WebSocket client connected', { userId, socketId: socket.id });
    
    // Join user to their personal room
    socket.join(`user:${userId}`);
    
    // Handle real-time analysis requests
    socket.on('start_analysis', (data) => {
      logger.info('Real-time analysis started', { userId, data });
      
      // TODO: Implement real-time analysis
      // For now, send a mock response
      socket.emit('analysis_progress', {
        progress: 100,
        status: 'completed',
        results: {
          findings: [],
          overallScore: 0.5
        }
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info('WebSocket client disconnected', { userId, socketId: socket.id });
    });
  });
};

export default setupWebSocket;