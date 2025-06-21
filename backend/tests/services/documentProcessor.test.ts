import DocumentProcessor from '../../src/services/documentProcessor';
import path from 'path';
import fs from 'fs';

describe('DocumentProcessor', () => {
  let processor: DocumentProcessor;

  beforeEach(() => {
    processor = new DocumentProcessor();
  });

  describe('File Validation', () => {
    it('should validate file types correctly', () => {
      const stats = processor.getProcessingStats();
      
      expect(stats.supportedTypes).toContain('application/pdf');
      expect(stats.supportedTypes).toContain('text/plain');
      expect(stats.supportedTypes).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it('should have reasonable max file size', () => {
      const stats = processor.getProcessingStats();
      
      expect(stats.maxFileSize).toBeGreaterThan(0);
      expect(stats.maxFileSize).toBeLessThanOrEqual(10 * 1024 * 1024); // 10MB
    });
  });

  describe('Text Processing', () => {
    it('should process plain text files', async () => {
      // Create a mock file object
      const mockFile: Express.Multer.File = {
        fieldname: 'document',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 100,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('Dette er en test dokument med norsk tekst. Dette dokumentet inneholder motsigelser.'),
        stream: null as any,
        mv: null as any
      };

      const result = await processor.processDocument(mockFile);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('extractedText');
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('structure');
      expect(result.extractedText).toContain('norsk tekst');
      expect(result.metadata.filename).toBe('test.txt');
      expect(result.metadata.mimeType).toBe('text/plain');
    });

    it('should detect Norwegian language', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'document',
        originalname: 'norwegian.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 200,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('Dette er et norsk dokument med mange norske ord som og, i, til, av, for, med, på, er, som, det, ikke, jeg, vi, du.'),
        stream: null as any,
        mv: null as any
      };

      const result = await processor.processDocument(mockFile);

      expect(result.metadata.language).toBe('no');
    });

    it('should extract basic entities from Norwegian text', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'document',
        originalname: 'entities.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 150,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('Saken 202412345 gjelder NAV og 15. januar 2024. Beløpet er 25 000 kr.'),
        stream: null as any,
        mv: null as any
      };

      const result = await processor.processDocument(mockFile);

      expect(result.structure.entities.length).toBeGreaterThan(0);
      
      // Check for case number
      const caseNumber = result.structure.entities.find(e => e.type === 'case_number');
      expect(caseNumber).toBeDefined();
      
      // Check for authority
      const authority = result.structure.entities.find(e => e.type === 'authority');
      expect(authority).toBeDefined();
      expect(authority?.text).toBe('NAV');
      
      // Check for amount
      const amount = result.structure.entities.find(e => e.type === 'amount');
      expect(amount).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error for missing file', async () => {
      await expect(processor.processDocument(null as any)).rejects.toThrow('No file provided');
    });

    it('should throw error for empty file', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'document',
        originalname: 'empty.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 0,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from(''),
        stream: null as any,
        mv: null as any
      };

      await expect(processor.processDocument(mockFile)).rejects.toThrow('empty');
    });

    it('should throw error for unsupported file type', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'document',
        originalname: 'test.xyz',
        encoding: '7bit',
        mimetype: 'application/unsupported',
        size: 100,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('test content'),
        stream: null as any,
        mv: null as any
      };

      await expect(processor.processDocument(mockFile)).rejects.toThrow('Unsupported file type');
    });
  });

  describe('Processing Performance', () => {
    it('should complete processing within reasonable time', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'document',
        originalname: 'performance.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1000,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('Lorem ipsum '.repeat(100) + 'Dette er norsk tekst for testing.'),
        stream: null as any,
        mv: null as any
      };

      const startTime = Date.now();
      const result = await processor.processDocument(mockFile);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
      expect(result.processingTime).toBeLessThan(5000);
      expect(result.processingTime).toBeGreaterThan(0);
    });
  });
});