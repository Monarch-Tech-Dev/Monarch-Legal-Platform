// Export all types and interfaces
export * from './types/analysis';
export * from './types/api';
export * from './interfaces/plugin';
export * from './constants/legal';

// Re-export commonly used types from their correct modules
export type {
  ProcessedDocument,
  ComprehensiveAnalysis,
  Finding,
  Recommendation
} from './types/analysis';

export type {
  ApiResponse,
  User,
  CaseResponse,
  AnalyzeDocumentRequest,
  AnalyzeDocumentResponse,
  GenerateResponseRequest,
  GenerateResponseResponse
} from './types/api';