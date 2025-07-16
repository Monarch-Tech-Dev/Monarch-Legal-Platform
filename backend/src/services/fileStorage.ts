import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface StoredFile {
  id: string;
  originalName: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
}

export class FileStorageService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
    this.ensureUploadsDir();
  }

  private async ensureUploadsDir(): Promise<void> {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      logger.info('Created uploads directory', { path: this.uploadsDir });
    }
  }

  /**
   * Store an uploaded file permanently
   */
  async storeFile(file: Express.Multer.File, userId: string): Promise<StoredFile> {
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ext = path.extname(file.originalname);
    const filename = `${fileId}${ext}`;
    const userDir = path.join(this.uploadsDir, userId);
    const filePath = path.join(userDir, filename);

    // Ensure user directory exists
    await fs.mkdir(userDir, { recursive: true });

    // Calculate checksum for file integrity
    const fileBuffer = await fs.readFile(file.path);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Move file to permanent location
    await fs.copyFile(file.path, filePath);
    
    // Remove temporary file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      logger.warn('Failed to remove temporary file', { 
        tempPath: file.path, 
        error: (error as Error).message 
      });
    }

    const storedFile: StoredFile = {
      id: fileId,
      originalName: file.originalname,
      filename,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      checksum
    };

    logger.info('File stored successfully', {
      userId,
      fileId,
      originalName: file.originalname,
      size: file.size,
      checksum
    });

    return storedFile;
  }

  /**
   * Retrieve a stored file
   */
  async getFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      logger.error('Failed to retrieve file', { 
        filePath, 
        error: (error as Error).message 
      });
      throw new Error('File not found or inaccessible');
    }
  }

  /**
   * Delete a stored file
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      logger.info('File deleted successfully', { filePath });
      return true;
    } catch (error) {
      logger.error('Failed to delete file', { 
        filePath, 
        error: (error as Error).message 
      });
      return false;
    }
  }

  /**
   * Get file stats
   */
  async getFileStats(filePath: string): Promise<{ size: number; modified: Date } | null> {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        modified: stats.mtime
      };
    } catch {
      return null;
    }
  }

  /**
   * Verify file integrity
   */
  async verifyFileIntegrity(filePath: string, expectedChecksum: string): Promise<boolean> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const actualChecksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      return actualChecksum === expectedChecksum;
    } catch {
      return false;
    }
  }

  /**
   * Clean up temporary files older than specified age
   */
  async cleanupTempFiles(maxAgeHours = 24): Promise<number> {
    const tempDir = path.join(this.uploadsDir, 'temp');
    let cleanedCount = 0;

    try {
      const files = await fs.readdir(tempDir);
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        logger.info('Cleaned up temporary files', { 
          count: cleanedCount, 
          maxAgeHours 
        });
      }
    } catch (error) {
      logger.error('Failed to cleanup temporary files', { 
        error: (error as Error).message 
      });
    }

    return cleanedCount;
  }

  /**
   * Get storage usage for a user
   */
  async getUserStorageUsage(userId: string): Promise<{ totalSize: number; fileCount: number }> {
    const userDir = path.join(this.uploadsDir, userId);
    let totalSize = 0;
    let fileCount = 0;

    try {
      const files = await fs.readdir(userDir);
      
      for (const file of files) {
        const filePath = path.join(userDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
          fileCount++;
        }
      }
    } catch (error) {
      // User directory doesn't exist or is empty
      logger.debug('User directory not found or empty', { userId });
    }

    return { totalSize, fileCount };
  }
}

// Singleton instance
export const fileStorage = new FileStorageService();