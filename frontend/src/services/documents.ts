import {
  Document,
  DocumentFolder,
  DocumentFilters,
  DocumentStats,
  UploadRequest,
  UploadProgress,
  DocumentVersion,
  BulkOperation,
  SearchResult,
  DocumentActivity
} from '../types/documents';

// Mock data for demonstration - in production this would connect to backend API
const mockDocuments: Document[] = [
  {
    id: 'doc_001',
    name: 'Settlement Agreement Analysis',
    originalName: 'settlement_agreement_oslo_municipality.pdf',
    type: 'legal_document',
    format: 'pdf',
    size: 2456789, // ~2.5MB
    uploadedAt: new Date('2024-01-15'),
    lastModified: new Date('2024-01-20'),
    status: 'analyzed',
    tags: ['settlement', 'oslo', 'contradiction', 'high-priority'],
    description: 'Settlement agreement with Oslo Municipality - contains critical contradictions',
    category: 'incoming',
    isEncrypted: true,
    uploadedBy: 'user_001',
    version: 1,
    metadata: {
      pageCount: 15,
      wordCount: 3245,
      language: 'no',
      author: 'Legal Department',
      createdDate: new Date('2024-01-10'),
      subject: 'Settlement Agreement - Case #2024-001',
      keywords: ['settlement', 'compensation', 'agreement'],
      ocrConfidence: 98,
      digitalSignature: true
    },
    analysisResults: ['analysis_001'],
    relatedCases: ['case_001'],
    permissions: {
      owner: 'user_001',
      viewers: ['user_002'],
      editors: [],
      isPublic: false
    },
    retention: {
      retainUntil: new Date('2027-01-15'),
      autoDelete: false,
      legalHold: true,
      reason: 'Active legal case'
    }
  },
  {
    id: 'doc_002',
    name: 'NAV Decision Letter',
    originalName: 'nav_decision_2024_001.pdf',
    type: 'correspondence',
    format: 'pdf',
    size: 1234567, // ~1.2MB
    uploadedAt: new Date('2023-12-10'),
    lastModified: new Date('2024-01-05'),
    status: 'analyzed',
    tags: ['nav', 'authority', 'decision', 'resolved'],
    description: 'NAV decision letter - authority hierarchy violation detected and resolved',
    category: 'incoming',
    isEncrypted: false,
    uploadedBy: 'user_001',
    version: 1,
    metadata: {
      pageCount: 3,
      wordCount: 856,
      language: 'no',
      author: 'NAV',
      createdDate: new Date('2023-12-05'),
      subject: 'Decision - Case #NAV-2023-12345',
      keywords: ['decision', 'benefits', 'rejection'],
      ocrConfidence: 95
    },
    analysisResults: ['analysis_002'],
    relatedCases: ['case_002'],
    permissions: {
      owner: 'user_001',
      viewers: [],
      editors: [],
      isPublic: false
    },
    retention: {
      retainUntil: new Date('2026-12-10'),
      autoDelete: false,
      legalHold: false
    }
  },
  {
    id: 'doc_003',
    name: 'Healthcare Privacy Request',
    originalName: 'health_authority_data_request.docx',
    type: 'correspondence',
    format: 'docx',
    size: 567890, // ~568KB
    uploadedAt: new Date('2024-01-22'),
    lastModified: new Date('2024-01-22'),
    status: 'ready',
    tags: ['healthcare', 'privacy', 'gdpr', 'urgent'],
    description: 'Healthcare authority requesting medical records without proper legal basis',
    category: 'incoming',
    isEncrypted: true,
    uploadedBy: 'user_001',
    version: 1,
    metadata: {
      pageCount: 2,
      wordCount: 445,
      language: 'no',
      author: 'Regional Health Authority',
      createdDate: new Date('2024-01-20'),
      subject: 'Request for Medical Records',
      keywords: ['medical', 'records', 'request'],
      ocrConfidence: 99
    },
    relatedCases: ['case_003'],
    permissions: {
      owner: 'user_001',
      viewers: [],
      editors: [],
      isPublic: false
    },
    retention: {
      retainUntil: new Date('2029-01-22'),
      autoDelete: false,
      legalHold: true,
      reason: 'GDPR investigation'
    }
  },
  {
    id: 'doc_004',
    name: 'Legal Response Template - Authority Challenge',
    originalName: 'authority_challenge_template.docx',
    type: 'template',
    format: 'docx',
    size: 123456, // ~123KB
    uploadedAt: new Date('2024-01-01'),
    lastModified: new Date('2024-01-18'),
    status: 'ready',
    tags: ['template', 'authority', 'challenge', 'proven'],
    description: 'Proven legal response template for authority hierarchy challenges - 94% success rate',
    category: 'legal_template',
    isEncrypted: false,
    uploadedBy: 'system',
    version: 3,
    metadata: {
      pageCount: 4,
      wordCount: 1200,
      language: 'no',
      author: 'Monarch Legal AI',
      subject: 'Authority Challenge Template',
      keywords: ['template', 'authority', 'hierarchy', 'challenge']
    },
    permissions: {
      owner: 'system',
      viewers: ['user_001'],
      editors: [],
      isPublic: true
    },
    retention: {
      autoDelete: false,
      legalHold: false
    }
  }
];

const mockFolders: DocumentFolder[] = [
  {
    id: 'folder_001',
    name: 'Active Cases',
    description: 'Documents related to currently active legal cases',
    path: '/active-cases',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-22'),
    documentsCount: 8,
    size: 15000000, // 15MB
    isShared: false,
    permissions: {
      owner: 'user_001',
      viewers: [],
      editors: [],
      isPublic: false
    },
    tags: ['active', 'cases']
  },
  {
    id: 'folder_002',
    name: 'Templates',
    description: 'Legal document templates and response templates',
    path: '/templates',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-18'),
    documentsCount: 5,
    size: 2000000, // 2MB
    isShared: true,
    permissions: {
      owner: 'system',
      viewers: ['user_001'],
      editors: [],
      isPublic: true
    },
    tags: ['templates', 'public']
  },
  {
    id: 'folder_003',
    name: 'Resolved Cases',
    description: 'Archived documents from successfully resolved cases',
    path: '/resolved-cases',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-05'),
    documentsCount: 25,
    size: 45000000, // 45MB
    isShared: false,
    permissions: {
      owner: 'user_001',
      viewers: [],
      editors: [],
      isPublic: false
    },
    tags: ['resolved', 'archived']
  }
];

const mockStats: DocumentStats = {
  totalDocuments: 38,
  totalSize: 62000000, // 62MB
  byType: {
    legal_document: 15,
    contract: 8,
    correspondence: 10,
    evidence: 3,
    report: 1,
    template: 5,
    other: 2
  },
  byStatus: {
    uploading: 0,
    processing: 1,
    ready: 12,
    analyzed: 20,
    archived: 5,
    deleted: 0,
    error: 0
  },
  byCategory: {
    incoming: 20,
    outgoing: 8,
    internal: 5,
    legal_template: 5,
    evidence: 3,
    correspondence: 10,
    contract: 8,
    analysis_result: 2
  },
  recentUploads: 3,
  averageProcessingTime: 5.2,
  storageUsed: 62, // percentage
  analysisCount: 25
};

class DocumentsService {
  async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredDocs = [...mockDocuments];
    
    if (filters) {
      if (filters.type?.length) {
        filteredDocs = filteredDocs.filter(doc => filters.type!.includes(doc.type));
      }
      
      if (filters.status?.length) {
        filteredDocs = filteredDocs.filter(doc => filters.status!.includes(doc.status));
      }
      
      if (filters.category?.length) {
        filteredDocs = filteredDocs.filter(doc => filters.category!.includes(doc.category));
      }
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredDocs = filteredDocs.filter(doc => 
          doc.name.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          doc.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      if (filters.tags?.length) {
        filteredDocs = filteredDocs.filter(doc => 
          filters.tags!.some(tag => doc.tags.includes(tag))
        );
      }
      
      if (filters.dateRange) {
        filteredDocs = filteredDocs.filter(doc => 
          doc.uploadedAt >= filters.dateRange!.start &&
          doc.uploadedAt <= filters.dateRange!.end
        );
      }
      
      if (filters.hasAnalysis !== undefined) {
        filteredDocs = filteredDocs.filter(doc => 
          filters.hasAnalysis ? (doc.analysisResults?.length || 0) > 0 : (doc.analysisResults?.length || 0) === 0
        );
      }
    }
    
    return filteredDocs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }
  
  async getDocumentById(id: string): Promise<Document | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockDocuments.find(doc => doc.id === id) || null;
  }
  
  async getFolders(): Promise<DocumentFolder[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockFolders];
  }
  
  async getDocumentStats(): Promise<DocumentStats> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return { ...mockStats };
  }
  
  async uploadDocument(request: UploadRequest): Promise<{ documentId: string; uploadUrl: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const documentId = `doc_${Date.now()}`;
    const uploadUrl = `https://upload.monarchlegal.no/documents/${documentId}`;
    
    // Create new document entry
    const newDocument: Document = {
      id: documentId,
      name: request.file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      originalName: request.file.name,
      type: request.type,
      format: request.file.name.split('.').pop()?.toLowerCase() as any || 'pdf',
      size: request.file.size,
      uploadedAt: new Date(),
      lastModified: new Date(),
      status: 'processing',
      tags: request.tags,
      description: request.description,
      category: request.category,
      isEncrypted: request.encrypt,
      uploadedBy: 'user_001',
      version: 1,
      metadata: {
        language: 'no',
        ocrConfidence: 0
      },
      permissions: {
        owner: 'user_001',
        viewers: [],
        editors: [],
        isPublic: false
      },
      retention: {
        autoDelete: false,
        legalHold: false
      }
    };
    
    mockDocuments.unshift(newDocument);
    
    return { documentId, uploadUrl };
  }
  
  async getUploadProgress(documentId: string): Promise<UploadProgress> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate upload progress
    const progress = Math.min(95, Math.random() * 100);
    const stages: UploadProgress['stage'][] = ['uploading', 'processing', 'analyzing', 'complete'];
    const stage = stages[Math.floor(progress / 25)] || 'uploading';
    
    return {
      documentId,
      progress,
      stage,
      message: this.getProgressMessage(stage, progress)
    };
  }
  
  private getProgressMessage(stage: UploadProgress['stage'], progress: number): string {
    switch (stage) {
      case 'uploading':
        return `Uploading document... ${Math.round(progress)}%`;
      case 'processing':
        return 'Processing document and extracting text...';
      case 'analyzing':
        return 'Running AI analysis for contradictions...';
      case 'complete':
        return 'Document ready for use';
      default:
        return 'Processing...';
    }
  }
  
  async deleteDocument(documentId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockDocuments.findIndex(doc => doc.id === documentId);
    if (index > -1) {
      mockDocuments[index].status = 'deleted';
    }
  }
  
  async bulkOperation(operation: BulkOperation): Promise<{ success: string[]; failed: string[] }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const success: string[] = [];
    const failed: string[] = [];
    
    for (const docId of operation.documentIds) {
      try {
        switch (operation.operation) {
          case 'delete':
            await this.deleteDocument(docId);
            success.push(docId);
            break;
          case 'tag':
            const doc = mockDocuments.find(d => d.id === docId);
            if (doc && operation.params?.tags) {
              doc.tags.push(...operation.params.tags);
              success.push(docId);
            } else {
              failed.push(docId);
            }
            break;
          default:
            success.push(docId);
        }
      } catch (error) {
        failed.push(docId);
      }
    }
    
    return { success, failed };
  }
  
  async searchDocuments(query: string): Promise<SearchResult[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase();
    
    for (const doc of mockDocuments) {
      let relevance = 0;
      const highlights: any[] = [];
      
      if (doc.name.toLowerCase().includes(searchTerm)) {
        relevance += 10;
        highlights.push({ field: 'name', value: doc.name, start: 0, end: doc.name.length });
      }
      
      if (doc.description?.toLowerCase().includes(searchTerm)) {
        relevance += 8;
        highlights.push({ field: 'description', value: doc.description, start: 0, end: doc.description.length });
      }
      
      if (doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
        relevance += 5;
      }
      
      if (relevance > 0) {
        results.push({
          document: doc,
          relevance,
          highlights,
          snippet: doc.description || doc.name
        });
      }
    }
    
    return results.sort((a, b) => b.relevance - a.relevance);
  }
  
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock versions for documents
    return [
      {
        id: 'v1',
        documentId,
        version: 1,
        name: 'Original version',
        size: 1234567,
        uploadedAt: new Date('2024-01-15'),
        uploadedBy: 'user_001',
        changes: 'Initial upload',
        isActive: true
      }
    ];
  }
  
  async createFolder(name: string, description?: string, parentId?: string): Promise<DocumentFolder> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newFolder: DocumentFolder = {
      id: `folder_${Date.now()}`,
      name,
      description,
      parentId,
      path: parentId ? `/parent/${name}` : `/${name}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      documentsCount: 0,
      size: 0,
      isShared: false,
      permissions: {
        owner: 'user_001',
        viewers: [],
        editors: [],
        isPublic: false
      },
      tags: []
    };
    
    mockFolders.push(newFolder);
    return newFolder;
  }
  
  async getDocumentActivity(documentId: string): Promise<DocumentActivity[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      {
        id: 'activity_1',
        documentId,
        action: 'uploaded',
        userId: 'user_001',
        userName: 'Test User',
        timestamp: new Date('2024-01-15'),
        details: 'Document uploaded and processed'
      },
      {
        id: 'activity_2',
        documentId,
        action: 'analyzed',
        userId: 'system',
        userName: 'Monarch Legal AI',
        timestamp: new Date('2024-01-16'),
        details: 'AI analysis completed - 3 contradictions found'
      }
    ];
  }
}

export const documentsService = new DocumentsService();
export default documentsService;
