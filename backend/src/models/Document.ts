// Document interfaces for internal storage

export interface DocumentRecord {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  extractedText: string;
  metadata: {
    language: string;
    jurisdiction: string;
    pages?: number;
    wordCount?: number;
    [key: string]: any;
  };
  analysisIds: string[];
  tags: string[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  documentId: string | null; // null for text-only analysis
  type: 'document' | 'text';
  modules: string[];
  options: Record<string, any>;
  results: {
    overallScore: number;
    severity: 'critical' | 'warning' | 'info';
    findings: any[];
    recommendations: any[];
    processingTime: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface CaseRecord {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  documentIds: string[];
  analysisIds: string[];
  notes: string;
  tags: string[];
  assignedTo?: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage (placeholder for database)
export class DocumentStorage {
  private documents: Map<string, DocumentRecord> = new Map();
  private analyses: Map<string, AnalysisRecord> = new Map();
  private cases: Map<string, CaseRecord> = new Map();

  // Document operations
  async saveDocument(document: Omit<DocumentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentRecord> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const documentRecord: DocumentRecord = {
      ...document,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.documents.set(id, documentRecord);
    return documentRecord;
  }

  async getDocument(id: string, userId: string): Promise<DocumentRecord | null> {
    const document = this.documents.get(id);
    if (!document || document.userId !== userId || document.isDeleted) {
      return null;
    }
    return document;
  }

  async getUserDocuments(userId: string, limit = 50, offset = 0): Promise<DocumentRecord[]> {
    const userDocs = Array.from(this.documents.values())
      .filter(doc => doc.userId === userId && !doc.isDeleted)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
    
    return userDocs;
  }

  async deleteDocument(id: string, userId: string): Promise<boolean> {
    const document = this.documents.get(id);
    if (!document || document.userId !== userId) {
      return false;
    }
    
    document.isDeleted = true;
    document.updatedAt = new Date();
    return true;
  }

  // Analysis operations
  async saveAnalysis(analysis: Omit<AnalysisRecord, 'id' | 'createdAt'>): Promise<AnalysisRecord> {
    const id = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const analysisRecord: AnalysisRecord = {
      ...analysis,
      id,
      createdAt: now
    };

    this.analyses.set(id, analysisRecord);
    return analysisRecord;
  }

  async getAnalysis(id: string, userId: string): Promise<AnalysisRecord | null> {
    const analysis = this.analyses.get(id);
    if (!analysis || analysis.userId !== userId) {
      return null;
    }
    return analysis;
  }

  async getUserAnalyses(userId: string, limit = 50, offset = 0): Promise<AnalysisRecord[]> {
    const userAnalyses = Array.from(this.analyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
    
    return userAnalyses;
  }

  async updateAnalysisStatus(id: string, status: AnalysisRecord['status'], error?: string): Promise<boolean> {
    const analysis = this.analyses.get(id);
    if (!analysis) {
      return false;
    }
    
    analysis.status = status;
    if (error) analysis.error = error;
    if (status === 'completed' || status === 'failed') {
      analysis.completedAt = new Date();
    }
    
    return true;
  }

  // Case operations
  async saveCase(caseData: Omit<CaseRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseRecord> {
    const id = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const caseRecord: CaseRecord = {
      ...caseData,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.cases.set(id, caseRecord);
    return caseRecord;
  }

  async getCase(id: string, userId: string): Promise<CaseRecord | null> {
    const caseRecord = this.cases.get(id);
    if (!caseRecord || caseRecord.userId !== userId) {
      return null;
    }
    return caseRecord;
  }

  async getUserCases(userId: string, status?: string, limit = 50, offset = 0): Promise<CaseRecord[]> {
    let userCases = Array.from(this.cases.values())
      .filter(caseRecord => caseRecord.userId === userId);
    
    if (status) {
      userCases = userCases.filter(caseRecord => caseRecord.status === status);
    }
    
    return userCases
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(offset, offset + limit);
  }

  async updateCase(id: string, userId: string, updates: Partial<CaseRecord>): Promise<CaseRecord | null> {
    const caseRecord = this.cases.get(id);
    if (!caseRecord || caseRecord.userId !== userId) {
      return null;
    }
    
    Object.assign(caseRecord, updates, { updatedAt: new Date() });
    return caseRecord;
  }

  // Utility methods
  async getUserStats(userId: string) {
    const documents = await this.getUserDocuments(userId);
    const analyses = await this.getUserAnalyses(userId);
    const cases = await this.getUserCases(userId);
    
    return {
      totalDocuments: documents.length,
      totalAnalyses: analyses.length,
      totalCases: cases.length,
      activeCases: cases.filter(c => ['active', 'pending'].includes(c.status)).length,
      recentActivity: [
        ...analyses.slice(0, 5).map(a => ({ activityType: 'analysis', ...a })),
        ...cases.slice(0, 5).map(c => ({ activityType: 'case', ...c }))
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10)
    };
  }
}

// Singleton instance
export const documentStorage = new DocumentStorage();