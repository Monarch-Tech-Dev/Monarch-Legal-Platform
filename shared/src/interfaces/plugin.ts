import { ProcessedDocument, ModuleResult, Finding, Recommendation, AnalysisModule, PatternMatch, Statement } from '../types/analysis';

export interface MonarchPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  category: PluginCategory;
  dependencies?: string[];
  
  initialize(platform: MonarchPlatform): Promise<void>;
  cleanup?(): Promise<void>;
}

export type PluginCategory = 'analysis' | 'integration' | 'utility' | 'reporting';

export interface AnalysisPlugin extends MonarchPlugin {
  category: 'analysis';
  analyze(document: ProcessedDocument): Promise<ModuleResult>;
  getCapabilities(): AnalysisCapability[];
}

export interface IntegrationPlugin extends MonarchPlugin {
  category: 'integration';
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

export interface AnalysisCapability {
  id: string;
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  confidence: number;
}

export interface MonarchPlatform {
  registerModule(module: AnalysisModule): void;
  unregisterModule(moduleId: string): void;
  getModule(moduleId: string): AnalysisModule | undefined;
  listModules(): AnalysisModule[];
  
  // Plugin lifecycle
  loadPlugin(plugin: MonarchPlugin): Promise<void>;
  unloadPlugin(pluginId: string): Promise<void>;
  getPlugin(pluginId: string): MonarchPlugin | undefined;
  listPlugins(): MonarchPlugin[];
  
  // Configuration
  getConfig(key: string): any;
  setConfig(key: string, value: any): void;
  
  // Events
  on(event: string, listener: Function): void;
  off(event: string, listener: Function): void;
  emit(event: string, ...args: any[]): void;
  
  // Logging
  log(level: LogLevel, message: string, context?: any): void;
}

// AnalysisModule is defined in types/analysis.ts to avoid duplication

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  category: PluginCategory;
  dependencies: Record<string, string>;
  entry: string;
  configuration: Record<string, any>;
}

export interface PluginManifest {
  config: PluginConfig;
  capabilities: AnalysisCapability[];
  supportedLanguages: string[];
  supportedJurisdictions: string[];
  requiredPermissions: string[];
}

// Plugin Development SDK
export interface PluginSDK {
  // Pattern matching utilities
  patternMatcher: {
    extract(text: string, patterns: RegExp[]): PatternMatch[];
    findAll(text: string, pattern: RegExp): Match[];
    validate(text: string, rules: ValidationRule[]): ValidationResult[];
  };
  
  // Confidence calculation
  confidenceCalculator: {
    calculate(evidence: Evidence[]): number;
    combine(confidences: number[]): number;
    adjust(baseConfidence: number, factors: ConfidenceFactor[]): number;
  };
  
  // Explanation generation
  explanationGenerator: {
    generate(finding: Finding): string;
    generateFromTemplate(template: string, variables: Record<string, any>): string;
    localize(text: string, language: string): string;
  };
  
  // NLP utilities
  nlp: {
    extractEntities(text: string): Entity[];
    analyzeSentiment(text: string): SentimentAnalysis;
    detectLanguage(text: string): LanguageDetection;
    tokenize(text: string): Token[];
    parseStatements(text: string): Statement[];
  };
  
  // Legal utilities
  legal: {
    verifyAuthority(claim: string, jurisdiction: string): Promise<AuthorityVerification>;
    findPrecedents(query: string, jurisdiction: string): Promise<LegalPrecedent[]>;
    validateCitation(citation: string): CitationValidation;
  };
}

// PatternMatch is defined in types/analysis.ts to avoid duplication

export interface Match {
  text: string;
  position: { start: number; end: number };
  groups: string[];
}

export interface ValidationRule {
  id: string;
  pattern: RegExp;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  rule: ValidationRule;
  passed: boolean;
  matches: Match[];
  message: string;
}

export interface Evidence {
  type: 'textual' | 'structural' | 'metadata' | 'external';
  content: string;
  confidence: number;
  source: string;
  weight: number;
}

export interface ConfidenceFactor {
  factor: string;
  impact: number;
  explanation: string;
}

export interface Entity {
  text: string;
  type: string;
  confidence: number;
  position: { start: number; end: number };
  metadata: Record<string, any>;
}

export interface SentimentAnalysis {
  polarity: number;
  subjectivity: number;
  confidence: number;
  emotions: Record<string, number>;
}

export interface LanguageDetection {
  language: string;
  confidence: number;
  alternatives: Array<{ language: string; confidence: number }>;
}

export interface Token {
  text: string;
  lemma: string;
  pos: string;
  tag: string;
  dep: string;
  isAlpha: boolean;
  isStop: boolean;
  position: { start: number; end: number };
}

// Statement is defined in types/analysis.ts to avoid duplication

export interface AuthorityVerification {
  verified: boolean;
  authority: string;
  confidence: number;
  source: string;
  lastChecked: Date;
}

export interface LegalPrecedent {
  citation: string;
  title: string;
  court: string;
  date: Date;
  summary: string;
  relevance: number;
  jurisdiction: string;
}

export interface CitationValidation {
  valid: boolean;
  normalized: string;
  court: string;
  date: Date;
  errors: string[];
}