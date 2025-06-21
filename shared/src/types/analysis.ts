export interface ProcessedDocument {
  id: string;
  originalFile: File;
  extractedText: string;
  metadata: DocumentMetadata;
  structure: DocumentStructure;
  timestamp: Date;
  processingTime: number;
}

export interface DocumentMetadata {
  filename: string;
  fileSize: number;
  mimeType: string;
  pageCount?: number;
  language?: string;
  encoding?: string;
  author?: string;
  createdDate?: Date;
  modifiedDate?: Date;
}

export interface DocumentStructure {
  sections: DocumentSection[];
  entities: LegalEntity[];
  statements: Statement[];
  metadata: Record<string, any>;
}

export interface DocumentSection {
  type: 'header' | 'paragraph' | 'list' | 'table' | 'signature';
  content: string;
  position: TextLocation;
  confidence: number;
}

export interface LegalEntity {
  text: string;
  type: 'institution' | 'person' | 'authority' | 'case_number' | 'date' | 'amount';
  confidence: number;
  span: TextLocation;
  metadata?: Record<string, any>;
}

export interface Statement {
  text: string;
  semanticRole: 'claim' | 'evidence' | 'conclusion' | 'procedure' | 'requirement';
  entities: LegalEntity[];
  span: TextLocation;
  confidence: number;
}

export interface TextLocation {
  start: number;
  end: number;
  line?: number;
  column?: number;
}

export interface AnalysisModule {
  id: string;
  name: string;
  version: string;
  analyze(document: ProcessedDocument): Promise<ModuleResult>;
}

export interface ModuleResult {
  moduleId: string;
  severity: 'critical' | 'warning' | 'info';
  findings: Finding[];
  actionable: boolean;
  recommendations: Recommendation[];
  confidence: number;
  processingTime: number;
}

export interface Finding {
  type: string;
  evidence: string[];
  explanation: string;
  confidence: number;
  location?: TextLocation;
  legalImplication?: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface Recommendation {
  strategy: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  successProbability: number;
  description: string;
  requiredActions: string[];
  expectedOutcome: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ComprehensiveAnalysis {
  documentId: string;
  overallScore: number;
  severity: 'critical' | 'warning' | 'info';
  moduleResults: ModuleResult[];
  criticalIssues: Finding[];
  recommendations: Recommendation[];
  successProbability: number;
  suggestedStrategies: LegalStrategy[];
  timestamp: Date;
  processingTime: number;
}

export interface LegalStrategy {
  id: string;
  name: string;
  description: string;
  successRate: number;
  applicableFindings: string[];
  requiredEvidence: string[];
  estimatedTimeframe: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

// Contradiction Detection Types
export interface Contradiction {
  type: 'direct_negation' | 'settlement_contradiction' | 'timeline_impossible' | 'authority_conflict';
  statements: Statement[];
  explanation: string;
  confidence: number;
  severity: 'critical' | 'warning' | 'info';
  legalImplication: string;
}

export interface ContradictionResult {
  contradictions: Contradiction[];
  overallSeverity: 'critical' | 'warning' | 'info';
  confidence: number;
  recommendations: string[];
}

// Authority Verification Types
export interface AuthorityHierarchy {
  level: number;
  type: 'government' | 'court' | 'regulatory' | 'professional' | 'corporate';
  entities: string[];
  weight: number;
}

export interface AuthorityViolation {
  higherAuthority: AuthorityDecision;
  lowerAuthority: InstitutionClaim;
  evidenceRequired: 'extraordinary' | 'substantial' | 'standard';
  legalPrinciple: string;
  burdenOfProof: 'claimant' | 'institution';
  confidence: number;
}

export interface AuthorityDecision {
  authority: string;
  authorityLevel: number;
  decision: string;
  confidence: number;
  source: string;
  verified: boolean;
}

export interface InstitutionClaim {
  institution: string;
  claim: string;
  contradicts: string;
  confidence: number;
  source: string;
}

// Pattern Detection Types
export interface ManipulationPattern {
  id: string;
  name: string;
  regex: RegExp;
  category: 'deflection' | 'pressure' | 'gaslighting' | 'intimidation' | 'delay_tactic';
  explanation: string;
  counterStrategy: string;
  successRate: number;
  examples: string[];
}

export interface PatternMatch {
  pattern: ManipulationPattern;
  matches: string[];
  confidence: number;
  context: string;
  recommendation: string;
}

// Response Generation Types
export interface ResponseTemplate {
  id: string;
  name: string;
  category: 'contradiction_challenge' | 'authority_hierarchy' | 'procedural_violation' | 'settlement_challenge';
  content: string;
  variables: string[];
  successRate: number;
  legalPrecedent: string[];
  followUpActions: string[];
  jurisdiction: string;
}

export interface ResponseOptions {
  tone: 'professional' | 'formal' | 'assertive' | 'diplomatic';
  formality: 'legal' | 'business' | 'casual';
  includeEvidence: boolean;
  aiEnhancement: boolean;
  customFields: Record<string, string>;
  language: string;
  jurisdiction: string;
}

export interface GeneratedResponse {
  primaryResponse: string;
  alternatives: string[];
  strategy: string;
  templateUsed: string;
  successProbability: number;
  followUpActions: string[];
  legalCitations: string[];
  estimatedImpact: 'high' | 'medium' | 'low';
  riskAssessment: string;
}