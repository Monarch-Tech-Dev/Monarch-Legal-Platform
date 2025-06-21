// API Request/Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Document Analysis API
export interface AnalyzeDocumentRequest {
  modules: string[];
  options: {
    language?: string;
    jurisdiction?: string;
    documentType?: string;
    aiEnhancement?: boolean;
  };
}

export interface AnalyzeDocumentResponse {
  analysisId: string;
  overallScore: number;
  severity: 'critical' | 'warning' | 'info';
  findings: Finding[];
  recommendations: Recommendation[];
  processingTime: number;
}

// Response Generation API
export interface GenerateResponseRequest {
  analysisId: string;
  strategy: string;
  options: ResponseOptions;
}

export interface GenerateResponseResponse {
  responseId: string;
  primaryResponse: string;
  alternatives: string[];
  successProbability: number;
  followUpActions: string[];
}

// Pattern Detection API
export interface DetectPatternsRequest {
  text: string;
  context?: string;
  patterns?: string[];
}

export interface DetectPatternsResponse {
  patterns: PatternMatch[];
  overallRisk: 'high' | 'medium' | 'low';
  recommendations: string[];
}

// Case Management API
export interface CreateCaseRequest {
  title: string;
  description?: string;
  institutionName?: string;
  caseNumber?: string;
  documentIds?: string[];
}

export interface UpdateCaseRequest {
  title?: string;
  description?: string;
  status?: CaseStatus;
  strategy?: string;
  notes?: string;
}

export interface CaseResponse {
  id: string;
  title: string;
  description?: string;
  status: CaseStatus;
  institutionName?: string;
  caseNumber?: string;
  strategy?: string;
  successProbability?: number;
  documents: DocumentSummary[];
  analyses: AnalysisSummary[];
  responses: ResponseSummary[];
  createdAt: string;
  updatedAt: string;
}

export type CaseStatus = 'active' | 'pending' | 'resolved' | 'closed' | 'escalated';

export interface DocumentSummary {
  id: string;
  filename: string;
  uploadedAt: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface AnalysisSummary {
  id: string;
  overallScore: number;
  severity: 'critical' | 'warning' | 'info';
  findingsCount: number;
  createdAt: string;
}

export interface ResponseSummary {
  id: string;
  strategy: string;
  successProbability: number;
  createdAt: string;
}

// User Management API
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tier: UserTier;
  verified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type UserRole = 'user' | 'lawyer' | 'admin';
export type UserTier = 'free' | 'professional' | 'legal_firm' | 'enterprise';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
}

// WebSocket Event Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  requestId?: string;
}

export interface AnalysisProgressEvent {
  type: 'analysis_progress';
  payload: {
    analysisId: string;
    progress: number;
    currentModule: string;
    status: 'processing' | 'completed' | 'failed';
    results?: Partial<ComprehensiveAnalysis>;
  };
}

export interface RealTimeAnalysisEvent {
  type: 'realtime_analysis';
  payload: {
    text: string;
    findings: Finding[];
    confidence: number;
  };
}

// Import types from analysis.ts
import {
  Finding,
  Recommendation,
  ResponseOptions,
  PatternMatch,
  ComprehensiveAnalysis
} from './analysis';