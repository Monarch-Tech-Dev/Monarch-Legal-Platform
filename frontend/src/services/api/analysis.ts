/**
 * Monarch Legal Platform - Document Analysis API Service
 * Connects frontend to backend contradiction detection engine
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface DocumentAnalysisRequest {
  file?: File;
  text?: string;
  documentType?: 'insurance' | 'government' | 'legal' | 'generic';
  analysisMode?: 'quick' | 'comprehensive' | 'professional';
  userContext?: {
    jurisdiction?: string;
    language?: string;
    priorAuthorities?: string[];
  };
}

export interface AnalysisResult {
  success: boolean;
  data: {
    findings: Finding[];
    confidence: number;
    severity: 'critical' | 'warning' | 'info';
    recommendations: Recommendation[];
    processingTime: number;
    legalProvisions?: LegalProvision[];
    precedents?: LegalPrecedent[];
    meritAssessment?: MeritAssessment;
  };
  timestamp: string;
}

export interface Finding {
  type: string;
  evidence: string[];
  explanation: string;
  confidence: number;
  severity: 'critical' | 'warning' | 'info';
  legalImplication: string;
  legalBacking?: LegalBacking[];
}

export interface LegalBacking {
  law: string;
  section: string;
  title: string;
  url: string;
}

export interface Recommendation {
  strategy: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  successProbability: number;
  description: string;
  requiredActions: string[];
  expectedOutcome: string;
  riskLevel: 'low' | 'medium' | 'high';
  precedentBacking?: {
    caseNumber: string;
    court: string;
    outcome: string;
    successFactors: string[];
    url: string;
  };
}

export interface LegalProvision {
  id: string;
  title: string;
  content: string;
  lawName: string;
  section: string;
  url: string;
  relevanceScore: number;
}

export interface LegalPrecedent {
  id: string;
  caseNumber: string;
  court: string;
  summary: string;
  outcome: 'successful' | 'partial' | 'unsuccessful';
  relevantLaws: string[];
  factPattern: string[];
  successFactors: string[];
  url: string;
  relevanceScore: number;
}

export interface MeritAssessment {
  merit: 'high' | 'medium' | 'low';
  winProbability: number;
  estimatedValue: number;
  outreachRecommendation: string;
}

class AnalysisApiService {
  /**
   * Analyze document for contradictions and legal issues
   */
  async analyzeDocument(request: DocumentAnalysisRequest): Promise<AnalysisResult> {
    try {
      let response: Response;

      if (request.file) {
        // File upload analysis
        const formData = new FormData();
        formData.append('document', request.file);
        
        if (request.documentType) {
          formData.append('documentType', request.documentType);
        }
        
        if (request.analysisMode) {
          formData.append('analysisMode', request.analysisMode);
        }
        
        if (request.userContext) {
          formData.append('userContext', JSON.stringify(request.userContext));
        }

        response = await fetch(`${API_BASE_URL}/api/analysis/document`, {
          method: 'POST',
          body: formData,
          headers: {
            // Don't set Content-Type for FormData - let browser set it with boundary
            'Authorization': this.getAuthHeader(),
          },
        });
      } else if (request.text) {
        // Text analysis using the test endpoint that we know works
        response = await fetch(`${API_BASE_URL}/health/test-contradiction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: request.text
          }),
        });
      } else {
        throw new Error('Either file or text must be provided for analysis');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error?.message || `Analysis failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform the backend response to match our frontend interface
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            findings: result.data.findings || [],
            confidence: result.data.confidence || 0,
            severity: result.data.severity || 'info',
            recommendations: result.data.recommendations || [],
            processingTime: result.data.processingTime || 0,
            legalProvisions: result.data.legalProvisions || [],
            precedents: result.data.precedents || [],
            meritAssessment: result.data.meritAssessment
          },
          timestamp: result.timestamp || new Date().toISOString()
        };
      } else {
        throw new Error(result.error?.message || 'Analysis failed');
      }

    } catch (error) {
      console.error('Document analysis failed:', error);
      throw error;
    }
  }

  /**
   * Quick text analysis for testing
   */
  async analyzeText(text: string): Promise<AnalysisResult> {
    return this.analyzeDocument({ 
      text,
      documentType: 'generic',
      analysisMode: 'quick',
      userContext: {
        jurisdiction: 'NO',
        language: 'no'
      }
    });
  }

  /**
   * Get analysis status for long-running analyses
   */
  async getAnalysisStatus(analysisId: string): Promise<{
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    result?: AnalysisResult;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/status/${analysisId}`, {
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get analysis status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get analysis status:', error);
      throw error;
    }
  }

  /**
   * Get supported document types and analysis modes
   */
  async getCapabilities(): Promise<{
    documentTypes: string[];
    analysisModes: string[];
    supportedLanguages: string[];
    maxFileSize: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/capabilities`, {
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get capabilities: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get capabilities:', error);
      // Return default capabilities
      return {
        documentTypes: ['insurance', 'government', 'legal', 'generic'],
        analysisModes: ['quick', 'comprehensive', 'professional'],
        supportedLanguages: ['no', 'sv', 'da', 'en'],
        maxFileSize: 10 * 1024 * 1024 // 10MB
      };
    }
  }

  /**
   * Get legal provisions for contradiction types
   */
  async getLegalProvisions(contradictionTypes: string[]): Promise<LegalProvision[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/legal-provisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify({ contradictionTypes }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get legal provisions: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Failed to get legal provisions:', error);
      return [];
    }
  }

  /**
   * Get similar precedents for contradiction types
   */
  async getSimilarPrecedents(contradictionTypes: string[], institution?: string): Promise<LegalPrecedent[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/precedents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify({ contradictionTypes, institution }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get precedents: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Failed to get precedents:', error);
      return [];
    }
  }

  /**
   * Generate response template based on analysis
   */
  async generateResponse(analysisId: string, strategy: string, customization?: any): Promise<{
    responseText: string;
    keyArguments: string[];
    supportingEvidence: string[];
    escalationOptions: string[];
    successProbability: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/generate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify({ analysisId, strategy, customization }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate response: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to generate response:', error);
      throw error;
    }
  }

  /**
   * Submit case outcome for learning
   */
  async submitCaseOutcome(
    analysisId: string,
    outcome: 'won' | 'settled' | 'lost',
    details: {
      timeToResolution?: number;
      settlementAmount?: number;
      lessonsLearned?: string[];
      strategiesUsed?: string[];
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis/case-outcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify({ analysisId, outcome, details }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit case outcome: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to submit case outcome:', error);
      throw error;
    }
  }

  private getAuthHeader(): string {
    // Get auth token from localStorage or auth service
    const token = localStorage.getItem('token'); // Fixed: was 'auth_token', should be 'token'
    return token ? `Bearer ${token}` : '';
  }
}

export const analysisApiService = new AnalysisApiService();
export default analysisApiService;