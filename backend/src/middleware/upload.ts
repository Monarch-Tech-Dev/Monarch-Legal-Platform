import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { CustomError } from './errorHandler';
import { logger } from '../utils/logger';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc (legacy)
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    logger.warn('File upload rejected - invalid type', {
      filename: file.originalname,
      mimetype: file.mimetype,
      allowedTypes
    });
    callback(new CustomError(
      `Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`,
      400,
      'INVALID_FILE_TYPE'
    ));
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, callback) => {
    // Create user-specific subdirectory
    const user = (req as any).user;
    const userDir = path.join(uploadDir, user?.id || 'anonymous');
    
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    callback(null, userDir);
  },
  filename: (req: Request, file: Express.Multer.File, callback) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    // Sanitize filename
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const filename = `${sanitizedBaseName}_${uniqueSuffix}${extension}`;
    
    callback(null, filename);
  }
});

// Memory storage for processing (alternative to disk storage)
const memoryStorage = multer.memoryStorage();

// Configure multer
const upload = multer({
  storage: process.env.USE_MEMORY_STORAGE === 'true' ? memoryStorage : storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: 1 // Single file upload
  }
});

// Multiple files upload configuration
const uploadMultiple = multer({
  storage: process.env.USE_MEMORY_STORAGE === 'true' ? memoryStorage : storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    files: parseInt(process.env.MAX_FILES_PER_UPLOAD || '5')
  }
});

// Error handling middleware for multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    let code = 'UPLOAD_ERROR';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File too large. Maximum size: ${parseInt(process.env.MAX_FILE_SIZE || '10485760') / (1024 * 1024)}MB`;
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = `Too many files. Maximum: ${process.env.MAX_FILES_PER_UPLOAD || '5'}`;
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name';
        code = 'UNEXPECTED_FIELD';
        break;
      default:
        message = error.message;
    }

    logger.warn('File upload error', {
      code: error.code,
      message: error.message,
      field: error.field
    });

    return res.status(400).json({
      success: false,
      error: {
        code,
        message,
        details: {
          multerCode: error.code,
          field: error.field
        }
      },
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id']
    });
  }

  next(error);
};

// Cleanup function to remove old uploaded files
export const cleanupOldFiles = async (maxAgeHours: number = 24): Promise<void> => {
  try {
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    
    const processDirectory = async (dirPath: string) => {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          await processDirectory(itemPath);
          
          // Remove empty directories
          if (fs.readdirSync(itemPath).length === 0) {
            fs.rmdirSync(itemPath);
            logger.info(`Removed empty directory: ${itemPath}`);
          }
        } else if (stats.isFile() && stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(itemPath);
          logger.info(`Cleaned up old file: ${itemPath}`);
        }
      }
    };
    
    if (fs.existsSync(uploadDir)) {
      await processDirectory(uploadDir);
    }
  } catch (error) {
    logger.error('File cleanup failed', { error: (error as Error).message });
  }
};

// Schedule cleanup to run periodically
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    cleanupOldFiles(parseInt(process.env.FILE_CLEANUP_HOURS || '24'));
  }, 60 * 60 * 1000); // Run every hour
}

// Middleware functions
export const uploadSingle = upload.single('document');
export const uploadMultipleFiles = uploadMultiple.array('documents', parseInt(process.env.MAX_FILES_PER_UPLOAD || '5'));

// Export configured multer instances
export { upload, uploadMultiple };
export default upload;