import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { ProcessedDocument, DocumentMetadata, DocumentStructure, LegalEntity, Statement } from '@monarch/shared';
import { logger, logError } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

export interface ProcessingOptions {
  extractMetadata?: boolean;
  performNLP?: boolean;
  language?: string;
  jurisdiction?: string;
}

export class DocumentProcessor {
  private supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'text/plain'
  ];

  private maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

  /**
   * Process uploaded document and extract text, metadata, and structure
   */
  async processDocument(
    file: Express.Multer.File,
    options: ProcessingOptions = {}
  ): Promise<ProcessedDocument> {
    const startTime = Date.now();
    
    try {
      // Validate file
      this.validateFile(file);
      
      logger.info(`Processing document: ${file.originalname}`, {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      });

      // Extract text based on file type
      const extractedText = await this.extractText(file);
      
      // Extract metadata
      const metadata = await this.extractMetadata(file, options);
      
      // Analyze document structure
      const structure = await this.analyzeStructure(extractedText, options);
      
      const processingTime = Date.now() - startTime;
      
      const processedDocument: ProcessedDocument = {
        id: this.generateDocumentId(),
        originalFile: file as any, // Type assertion for compatibility
        extractedText,
        metadata,
        structure,
        timestamp: new Date(),
        processingTime
      };

      logger.info(`Document processed successfully`, {
        documentId: processedDocument.id,
        textLength: extractedText.length,
        processingTime
      });

      return processedDocument;

    } catch (error) {
      logError(error as Error, 'Document Processing');
      throw new CustomError(
        `Failed to process document: ${(error as Error).message}`,
        400,
        'DOCUMENT_PROCESSING_ERROR'
      );
    }
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new CustomError('No file provided', 400, 'NO_FILE');
    }

    if (file.size > this.maxFileSize) {
      throw new CustomError(
        `File size exceeds maximum allowed size of ${this.maxFileSize} bytes`,
        400,
        'FILE_TOO_LARGE'
      );
    }

    if (!this.supportedTypes.includes(file.mimetype)) {
      throw new CustomError(
        `Unsupported file type: ${file.mimetype}. Supported types: ${this.supportedTypes.join(', ')}`,
        400,
        'UNSUPPORTED_FILE_TYPE'
      );
    }
  }

  /**
   * Extract text from different file types
   */
  private async extractText(file: Express.Multer.File): Promise<string> {
    switch (file.mimetype) {
      case 'application/pdf':
        return this.extractTextFromPDF(file);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.extractTextFromDocx(file);
      
      case 'application/msword':
        throw new CustomError('Legacy .doc files not supported. Please convert to .docx', 400);
      
      case 'text/plain':
        return this.extractTextFromPlainText(file);
      
      default:
        throw new CustomError(`Text extraction not implemented for ${file.mimetype}`, 400);
    }
  }

  /**
   * Extract text from PDF
   */
  private async extractTextFromPDF(file: Express.Multer.File): Promise<string> {
    try {
      const buffer = file.buffer || fs.readFileSync(file.path);
      const data = await pdfParse(buffer);
      
      if (!data.text || data.text.trim().length === 0) {
        throw new CustomError('PDF contains no extractable text', 400, 'NO_TEXT_CONTENT');
      }
      
      return this.cleanExtractedText(data.text);
    } catch (error) {
      throw new CustomError(`Failed to extract text from PDF: ${(error as Error).message}`, 400);
    }
  }

  /**
   * Extract text from DOCX
   */
  private async extractTextFromDocx(file: Express.Multer.File): Promise<string> {
    try {
      const buffer = file.buffer || fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer });
      
      if (!result.value || result.value.trim().length === 0) {
        throw new CustomError('DOCX contains no extractable text', 400, 'NO_TEXT_CONTENT');
      }
      
      if (result.messages.length > 0) {
        logger.warn('DOCX extraction warnings', { messages: result.messages });
      }
      
      return this.cleanExtractedText(result.value);
    } catch (error) {
      throw new CustomError(`Failed to extract text from DOCX: ${(error as Error).message}`, 400);
    }
  }

  /**
   * Extract text from plain text file
   */
  private async extractTextFromPlainText(file: Express.Multer.File): Promise<string> {
    try {
      const buffer = file.buffer || fs.readFileSync(file.path);
      const text = buffer.toString('utf-8');
      
      if (!text || text.trim().length === 0) {
        throw new CustomError('Text file is empty', 400, 'NO_TEXT_CONTENT');
      }
      
      return this.cleanExtractedText(text);
    } catch (error) {
      throw new CustomError(`Failed to extract text from plain text file: ${(error as Error).message}`, 400);
    }
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive empty lines
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Trim
      .trim();
  }

  /**
   * Extract document metadata
   */
  private async extractMetadata(
    file: Express.Multer.File,
    options: ProcessingOptions
  ): Promise<DocumentMetadata> {
    const metadata: DocumentMetadata = {
      filename: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      encoding: 'utf-8'
    };

    // Add PDF-specific metadata
    if (file.mimetype === 'application/pdf') {
      try {
        const buffer = file.buffer || fs.readFileSync(file.path);
        const pdfData = await pdfParse(buffer);
        
        metadata.pageCount = pdfData.numpages;
        metadata.author = pdfData.info?.Author;
        metadata.createdDate = pdfData.info?.CreationDate ? new Date(pdfData.info.CreationDate) : undefined;
        metadata.modifiedDate = pdfData.info?.ModDate ? new Date(pdfData.info.ModDate) : undefined;
      } catch (error) {
        logger.warn('Failed to extract PDF metadata', { error: (error as Error).message });
      }
    }

    // Detect language if not provided
    if (!options.language) {
      metadata.language = await this.detectLanguage(file);
    } else {
      metadata.language = options.language;
    }

    return metadata;
  }

  /**
   * Analyze document structure and extract entities
   */
  private async analyzeStructure(
    text: string,
    options: ProcessingOptions
  ): Promise<DocumentStructure> {
    const structure: DocumentStructure = {
      sections: [],
      entities: [],
      statements: [],
      metadata: {}
    };

    // Basic section detection (headers, paragraphs)
    structure.sections = this.extractSections(text);
    
    // Extract legal entities (basic regex-based for now)
    structure.entities = this.extractBasicEntities(text);
    
    // Extract statements
    structure.statements = this.extractStatements(text);

    return structure;
  }

  /**
   * Extract document sections
   */
  private extractSections(text: string): any[] {
    const sections: any[] = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.length === 0) continue;
      
      // Detect headers (simple heuristic)
      if (this.isHeader(line)) {
        sections.push({
          type: 'header',
          content: line,
          position: { start: text.indexOf(line), end: text.indexOf(line) + line.length },
          confidence: 0.8
        });
      } else {
        sections.push({
          type: 'paragraph',
          content: line,
          position: { start: text.indexOf(line), end: text.indexOf(line) + line.length },
          confidence: 0.9
        });
      }
    }
    
    return sections;
  }

  /**
   * Simple header detection
   */
  private isHeader(line: string): boolean {
    // Headers are typically short, may contain numbers, and are often in caps
    return (
      line.length < 100 &&
      (line.toUpperCase() === line || // All caps
       /^\d+\./.test(line) || // Starts with number
       /^[A-Z][^.]*$/.test(line)) // Starts with capital, no periods
    );
  }

  /**
   * Extract basic legal entities using regex patterns
   */
  private extractBasicEntities(text: string): LegalEntity[] {
    const entities: LegalEntity[] = [];
    
    // Norwegian legal entity patterns
    const patterns = [
      {
        regex: /\b\d{4,6}\b/g,
        type: 'case_number' as const,
        confidence: 0.7
      },
      {
        regex: /\b\d{1,2}\.\s*(?:januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember)\s*\d{4}\b/gi,
        type: 'date' as const,
        confidence: 0.9
      },
      {
        regex: /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g,
        type: 'date' as const,
        confidence: 0.8
      },
      {
        regex: /(?:kr|NOK)\s*\d+(?:[.,]\d{3})*(?:[.,]\d{2})?|\d+(?:[.,]\d{3})*(?:[.,]\d{2})?\s*(?:kr|NOK)/gi,
        type: 'amount' as const,
        confidence: 0.85
      },
      {
        regex: /\b[A-ZÆØÅ][a-zæøå]+\s+AS\b|\b[A-ZÆØÅ]+\s+AS\b/g,
        type: 'institution' as const,
        confidence: 0.8
      },
      {
        regex: /\bNAV\b|\bFinanstilsynet\b|\bFinansklagenemnda\b/g,
        type: 'authority' as const,
        confidence: 0.95
      }
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        entities.push({
          text: match[0],
          type: pattern.type,
          confidence: pattern.confidence,
          span: {
            start: match.index,
            end: match.index + match[0].length
          }
        });
      }
    });

    return entities;
  }

  /**
   * Extract logical statements from text
   */
  private extractStatements(text: string): Statement[] {
    const statements: Statement[] = [];
    
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.length === 0) return;
      
      const semanticRole = this.classifyStatement(trimmed);
      const position = text.indexOf(trimmed);
      
      statements.push({
        text: trimmed,
        semanticRole,
        entities: [], // Will be populated by NLP analysis
        span: {
          start: position,
          end: position + trimmed.length
        },
        confidence: 0.7
      });
    });

    return statements;
  }

  /**
   * Classify statement semantic role
   */
  private classifyStatement(statement: string): 'claim' | 'evidence' | 'conclusion' | 'procedure' | 'requirement' {
    const lower = statement.toLowerCase();
    
    if (lower.includes('derfor') || lower.includes('konklusjon')) {
      return 'conclusion';
    }
    if (lower.includes('krav') || lower.includes('må') || lower.includes('skal')) {
      return 'requirement';
    }
    if (lower.includes('vedlagt') || lower.includes('dokumentasjon')) {
      return 'evidence';
    }
    if (lower.includes('prosedyre') || lower.includes('fremgangsmåte')) {
      return 'procedure';
    }
    
    return 'claim';
  }

  /**
   * Simple language detection
   */
  private async detectLanguage(file: Express.Multer.File): Promise<string> {
    // Simple Norwegian detection based on common words
    try {
      const buffer = file.buffer || fs.readFileSync(file.path);
      const sample = buffer.toString('utf-8', 0, 1000).toLowerCase();
      
      const norwegianWords = ['og', 'i', 'til', 'av', 'for', 'med', 'på', 'er', 'som', 'det', 'ikke', 'jeg', 'vi', 'du'];
      const norwegianCount = norwegianWords.reduce((count, word) => {
        return count + (sample.split(word).length - 1);
      }, 0);
      
      if (norwegianCount > 5) {
        return 'no';
      }
      
      return 'en'; // Default to English
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Generate unique document ID
   */
  private generateDocumentId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get processing statistics
   */
  getProcessingStats() {
    return {
      supportedTypes: this.supportedTypes,
      maxFileSize: this.maxFileSize,
      version: '1.0.0'
    };
  }
}

export default DocumentProcessor;