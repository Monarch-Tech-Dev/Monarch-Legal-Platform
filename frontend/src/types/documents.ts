export interface Document {
  id: string;
  name: string;
  originalName: string;
  type: DocumentType;
  format: DocumentFormat;
  size: number; // bytes
  uploadedAt: Date;
  lastModified: Date;
  status: DocumentStatus;
  tags: string[];
  description?: string;
  category: DocumentCategory;
  isEncrypted: boolean;
  uploadedBy: string;
  version: number;
  parentId?: string; // for document versions
  url?: string;
  thumbnailUrl?: string;
  metadata: DocumentMetadata;
  analysisResults?: string[]; // Array of analysis IDs
  relatedCases?: string[]; // Array of case IDs
  permissions: DocumentPermissions;
  retention: RetentionPolicy;
}

export type DocumentType = 
  | 'legal_document' 
  | 'contract' 
  | 'correspondence' 
  | 'evidence' 
  | 'report' 
  | 'template' 
  | 'other';

export type DocumentFormat = 
  | 'pdf' 
  | 'docx' 
  | 'doc' 
  | 'txt' 
  | 'rtf' 
  | 'html' 
  | 'xml' 
  | 'jpg' 
  | 'png' 
  | 'tiff';

export type DocumentStatus = 
  | 'uploading' 
  | 'processing' 
  | 'ready' 
  | 'analyzed' 
  | 'archived' 
  | 'deleted' 
  | 'error';

export type DocumentCategory = 
  | 'incoming' 
  | 'outgoing' 
  | 'internal' 
  | 'legal_template' 
  | 'evidence' 
  | 'correspondence' 
  | 'contract' 
  | 'analysis_result';

export interface DocumentMetadata {
  pageCount?: number;
  wordCount?: number;
  language?: string;
  author?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  subject?: string;
  keywords?: string[];
  extractedText?: string;
  ocrConfidence?: number;
  digitalSignature?: boolean;
  passwordProtected?: boolean;
}

export interface DocumentPermissions {
  owner: string;
  viewers: string[];
  editors: string[];
  isPublic: boolean;
  shareUrl?: string;
  expiresAt?: Date;
}

export interface RetentionPolicy {
  retainUntil?: Date;
  autoDelete: boolean;
  legalHold: boolean;
  reason?: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  documentsCount: number;
  size: number;
  isShared: boolean;
  permissions: DocumentPermissions;
  tags: string[];
}

export interface DocumentFilters {
  type?: DocumentType[];
  format?: DocumentFormat[];
  status?: DocumentStatus[];
  category?: DocumentCategory[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number; // bytes
    max: number; // bytes
  };
  searchQuery?: string;
  folderId?: string;
  hasAnalysis?: boolean;
  isEncrypted?: boolean;
}

export interface DocumentStats {
  totalDocuments: number;
  totalSize: number; // bytes
  byType: Record<DocumentType, number>;
  byStatus: Record<DocumentStatus, number>;
  byCategory: Record<DocumentCategory, number>;
  recentUploads: number; // last 7 days
  averageProcessingTime: number; // minutes
  storageUsed: number; // percentage
  analysisCount: number;
}

export interface UploadRequest {
  file: File;
  type: DocumentType;
  category: DocumentCategory;
  description?: string;
  tags: string[];
  folderId?: string;
  encrypt: boolean;
}

export interface UploadProgress {
  documentId: string;
  progress: number; // 0-100
  stage: 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  message: string;
  error?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  name: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  changes: string;
  isActive: boolean;
}

export interface DocumentShare {
  id: string;
  documentId: string;
  sharedWith: string;
  permissions: 'view' | 'edit' | 'download';
  expiresAt?: Date;
  createdAt: Date;
  accessCount: number;
  lastAccessed?: Date;
}

export interface BulkOperation {
  operation: 'move' | 'copy' | 'delete' | 'tag' | 'analyze' | 'export';
  documentIds: string[];
  params?: Record<string, any>;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: DocumentType;
  category: DocumentCategory;
  content: string;
  variables: TemplateVariable[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usage: number;
  rating: number;
  tags: string[];
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // for select type
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface SearchResult {
  document: Document;
  relevance: number;
  highlights: SearchHighlight[];
  snippet: string;
}

export interface SearchHighlight {
  field: string;
  value: string;
  start: number;
  end: number;
}

export interface DocumentActivity {
  id: string;
  documentId: string;
  action: 'uploaded' | 'viewed' | 'edited' | 'shared' | 'analyzed' | 'downloaded' | 'deleted';
  userId: string;
  userName: string;
  timestamp: Date;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface DocumentComparison {
  id: string;
  document1Id: string;
  document2Id: string;
  similarities: number; // percentage
  differences: ComparisonDifference[];
  createdAt: Date;
}

export interface ComparisonDifference {
  type: 'added' | 'removed' | 'modified';
  section: string;
  oldValue?: string;
  newValue?: string;
  context: string;
}
