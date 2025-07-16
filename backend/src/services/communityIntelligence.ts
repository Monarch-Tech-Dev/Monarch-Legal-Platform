/**
 * Monarch Legal Platform - Community Intelligence Network
 * Collective pattern sharing and collaborative case analysis
 */

import { logger } from '../utils/logger';
import { legalDatabaseService } from './legalDatabase';

export interface CommunityPattern {
  id: string;
  name: string;
  description: string;
  patternType: 'contradiction' | 'authority_violation' | 'manipulation' | 'procedural_error';
  detectionRules: DetectionRule[];
  linguisticMarkers: LinguisticMarker[];
  jurisdiction: string[];
  successRate: number;
  timesUsed: number;
  timesSuccessful: number;
  contributorId: string; // Anonymous contributor ID
  createdAt: Date;
  lastUpdated: Date;
  communityRating: number;
  verificationStatus: 'pending' | 'verified' | 'disputed' | 'deprecated';
  tags: string[];
  relatedCases: string[];
  institutionTargets: string[];
  counterStrategies: string[];
}

export interface DetectionRule {
  ruleType: 'regex' | 'semantic' | 'logical' | 'structural';
  pattern: string;
  confidence: number;
  context: string[];
  negativeMarkers: string[];
}

export interface LinguisticMarker {
  language: string;
  markers: string[];
  negationPatterns: string[];
  contextualClues: string[];
}

export interface CommunityContribution {
  id: string;
  contributorId: string;
  contributionType: 'pattern' | 'case_outcome' | 'strategy' | 'improvement';
  content: any;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  reviewComments: string[];
  creditsAwarded: number;
  impactScore: number;
  submittedAt: Date;
}

export interface CollaborativeAnalysis {
  documentId: string;
  primaryAnalysis: any;
  communityInsights: CommunityInsight[];
  collaborativeRating: number;
  consensusPatterns: string[];
  disputedFindings: DisputedFinding[];
  improvedSuccessProbability: number;
}

export interface CommunityInsight {
  contributorId: string;
  insightType: 'additional_pattern' | 'strategy_improvement' | 'precedent_reference' | 'success_tip';
  content: string;
  supportingEvidence: string[];
  communityVotes: number;
  expertVerification: boolean;
}

export interface DisputedFinding {
  findingId: string;
  originalConfidence: number;
  communityConfidence: number;
  disputeReasons: string[];
  alternativeInterpretations: string[];
}

export interface InstitutionalBehaviorPattern {
  institutionId: string;
  institutionName: string;
  patternType: string;
  frequency: number;
  successfulChallenges: number;
  totalChallenges: number;
  averageResponseTime: number;
  escalationTriggers: string[];
  weaknessIndicators: string[];
  optimalStrategies: string[];
  communityNotes: string[];
}

export class CommunityIntelligenceService {
  private patterns: Map<string, CommunityPattern> = new Map();
  private contributions: Map<string, CommunityContribution> = new Map();
  private institutionalBehaviors: Map<string, InstitutionalBehaviorPattern> = new Map();
  private collaborativeAnalyses: Map<string, CollaborativeAnalysis> = new Map();

  constructor() {
    this.initializeCommunityDatabase();
  }

  /**
   * Submit a new pattern discovered by community member
   */
  async submitCommunityPattern(
    pattern: Partial<CommunityPattern>,
    contributorId: string
  ): Promise<{ success: boolean; patternId?: string; message: string }> {
    try {
      // Validate pattern quality
      const validation = await this.validatePatternQuality(pattern);
      if (!validation.isValid) {
        return {
          success: false,
          message: `Pattern validation failed: ${validation.issues.join(', ')}`
        };
      }

      // Check for duplicates
      const isDuplicate = await this.checkPatternDuplicate(pattern);
      if (isDuplicate.exists) {
        return {
          success: false,
          message: `Similar pattern already exists: ${isDuplicate.existingPatternId}`
        };
      }

      // Create new pattern
      const newPattern: CommunityPattern = {
        id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: pattern.name || 'Community Pattern',
        description: pattern.description || '',
        patternType: pattern.patternType || 'contradiction',
        detectionRules: pattern.detectionRules || [],
        linguisticMarkers: pattern.linguisticMarkers || [],
        jurisdiction: pattern.jurisdiction || ['NO'],
        successRate: 0.5, // Default until validated
        timesUsed: 0,
        timesSuccessful: 0,
        contributorId: this.anonymizeContributor(contributorId),
        createdAt: new Date(),
        lastUpdated: new Date(),
        communityRating: 0,
        verificationStatus: 'pending',
        tags: pattern.tags || [],
        relatedCases: [],
        institutionTargets: pattern.institutionTargets || [],
        counterStrategies: pattern.counterStrategies || []
      };

      // Submit for community review
      await this.submitForCommunityReview(newPattern);

      // Reward contributor
      await this.rewardContributor(contributorId, this.calculateContributionValue(newPattern));

      this.patterns.set(newPattern.id, newPattern);

      logger.info('Community pattern submitted', {
        patternId: newPattern.id,
        contributorId: this.anonymizeContributor(contributorId),
        patternType: newPattern.patternType
      });

      return {
        success: true,
        patternId: newPattern.id,
        message: 'Pattern submitted successfully and is under community review'
      };

    } catch (error) {
      logger.error('Error submitting community pattern', {
        error: (error as Error).message,
        contributorId: this.anonymizeContributor(contributorId)
      });
      return {
        success: false,
        message: 'Internal error processing pattern submission'
      };
    }
  }

  /**
   * Enhance document analysis with community intelligence
   */
  async enhanceWithCommunityIntelligence(
    documentAnalysis: any,
    documentText: string
  ): Promise<CollaborativeAnalysis> {
    try {
      const communityInsights: CommunityInsight[] = [];
      const consensusPatterns: string[] = [];
      
      // Apply community patterns
      const communityPatterns = await this.findApplicablePatterns(
        documentText,
        documentAnalysis.contradictions || []
      );

      for (const pattern of communityPatterns) {
        // Check if pattern applies to this document
        const applicationResult = await this.applyPatternToDocument(
          pattern,
          documentText,
          documentAnalysis
        );

        if (applicationResult.applies) {
          consensusPatterns.push(pattern.id);
          
          // Add community insight
          communityInsights.push({
            contributorId: 'community_pattern',
            insightType: 'additional_pattern',
            content: `Community identified pattern: ${pattern.name}`,
            supportingEvidence: applicationResult.evidence,
            communityVotes: Math.floor(pattern.communityRating * 10),
            expertVerification: pattern.verificationStatus === 'verified'
          });
        }
      }

      // Find related institutional behavior patterns
      const institutionalPatterns = await this.findInstitutionalBehaviorPatterns(
        documentAnalysis
      );

      for (const instPattern of institutionalPatterns) {
        communityInsights.push({
          contributorId: 'institutional_intelligence',
          insightType: 'strategy_improvement',
          content: `Based on ${instPattern.totalChallenges} community cases, optimal strategy: ${instPattern.optimalStrategies[0]}`,
          supportingEvidence: instPattern.communityNotes,
          communityVotes: instPattern.successfulChallenges,
          expertVerification: true
        });
      }

      // Calculate improved success probability
      const improvedSuccessProbability = await this.calculateCommunityEnhancedSuccess(
        documentAnalysis.successProbability || 0.5,
        communityPatterns,
        institutionalPatterns
      );

      const collaborativeAnalysis: CollaborativeAnalysis = {
        documentId: documentAnalysis.documentId || `doc_${Date.now()}`,
        primaryAnalysis: documentAnalysis,
        communityInsights,
        collaborativeRating: this.calculateCollaborativeRating(communityInsights),
        consensusPatterns,
        disputedFindings: [], // Would be populated by community feedback
        improvedSuccessProbability
      };

      this.collaborativeAnalyses.set(collaborativeAnalysis.documentId, collaborativeAnalysis);

      return collaborativeAnalysis;

    } catch (error) {
      logger.error('Error enhancing with community intelligence', {
        error: (error as Error).message
      });
      
      // Return basic collaborative analysis on error
      return {
        documentId: documentAnalysis.documentId || `doc_${Date.now()}`,
        primaryAnalysis: documentAnalysis,
        communityInsights: [],
        collaborativeRating: 0,
        consensusPatterns: [],
        disputedFindings: [],
        improvedSuccessProbability: documentAnalysis.successProbability || 0.5
      };
    }
  }

  /**
   * Learn from community case outcomes
   */
  async learnFromCommunityOutcome(
    caseId: string,
    outcome: 'won' | 'settled' | 'lost',
    contributorId: string,
    details: {
      patternsUsed: string[];
      strategiesEmployed: string[];
      timeToResolution: number;
      settlementAmount?: number;
      lessonsLearned: string[];
      institutionResponse: string;
    }
  ): Promise<void> {
    try {
      // Update pattern success rates
      for (const patternId of details.patternsUsed) {
        await this.updatePatternSuccessRate(patternId, outcome === 'won' || outcome === 'settled');
      }

      // Update institutional behavior patterns
      await this.updateInstitutionalBehavior(
        details.institutionResponse,
        details.strategiesEmployed,
        outcome,
        details.timeToResolution
      );

      // Reward contributor for sharing outcome
      await this.rewardContributor(contributorId, this.calculateOutcomeShareValue(outcome, details));

      // Add to community learning database
      await this.addToCommunityLearningDatabase({
        caseId,
        outcome,
        contributorId: this.anonymizeContributor(contributorId),
        patternsUsed: details.patternsUsed,
        strategiesEmployed: details.strategiesEmployed,
        timeToResolution: details.timeToResolution,
        settlementAmount: details.settlementAmount,
        lessonsLearned: details.lessonsLearned,
        institutionResponse: details.institutionResponse,
        timestamp: new Date()
      });

      logger.info('Community outcome learned', {
        caseId,
        outcome,
        patternsUsed: details.patternsUsed.length,
        contributorId: this.anonymizeContributor(contributorId)
      });

    } catch (error) {
      logger.error('Error learning from community outcome', {
        error: (error as Error).message,
        caseId
      });
    }
  }

  /**
   * Get community insights for specific institution
   */
  async getInstitutionalIntelligence(institutionName: string): Promise<{
    behaviorPattern: InstitutionalBehaviorPattern | null;
    communityRecommendations: string[];
    successfulStrategies: Array<{ strategy: string; successRate: number; }>;
    recentTrends: string[];
  }> {
    try {
      const behaviorPattern = this.institutionalBehaviors.get(institutionName);
      
      if (!behaviorPattern) {
        return {
          behaviorPattern: null,
          communityRecommendations: ['No community data available for this institution'],
          successfulStrategies: [],
          recentTrends: []
        };
      }

      const successfulStrategies = behaviorPattern.optimalStrategies.map(strategy => ({
        strategy,
        successRate: behaviorPattern.successfulChallenges / behaviorPattern.totalChallenges
      }));

      return {
        behaviorPattern,
        communityRecommendations: behaviorPattern.communityNotes,
        successfulStrategies,
        recentTrends: await this.getRecentTrends(institutionName)
      };

    } catch (error) {
      logger.error('Error getting institutional intelligence', {
        error: (error as Error).message,
        institutionName
      });
      
      return {
        behaviorPattern: null,
        communityRecommendations: [],
        successfulStrategies: [],
        recentTrends: []
      };
    }
  }

  /**
   * Enable collaborative real-time document analysis
   */
  async startCollaborativeAnalysis(
    documentId: string,
    initiatorId: string
  ): Promise<{ sessionId: string; collaborators: string[]; }> {
    const sessionId = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize collaborative session
    // This would integrate with WebSocket for real-time collaboration
    
    logger.info('Collaborative analysis session started', {
      sessionId,
      documentId,
      initiatorId: this.anonymizeContributor(initiatorId)
    });

    return {
      sessionId,
      collaborators: [this.anonymizeContributor(initiatorId)]
    };
  }

  /**
   * Private helper methods
   */

  private async validatePatternQuality(pattern: Partial<CommunityPattern>): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    if (!pattern.name || pattern.name.length < 5) {
      issues.push('Pattern name must be at least 5 characters');
    }

    if (!pattern.description || pattern.description.length < 20) {
      issues.push('Pattern description must be at least 20 characters');
    }

    if (!pattern.detectionRules || pattern.detectionRules.length === 0) {
      issues.push('Pattern must have at least one detection rule');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  private async checkPatternDuplicate(pattern: Partial<CommunityPattern>): Promise<{
    exists: boolean;
    existingPatternId?: string;
  }> {
    // Check for similar patterns using semantic similarity
    // This would use embeddings to find semantically similar patterns
    
    for (const [patternId, existingPattern] of this.patterns.entries()) {
      if (existingPattern.name === pattern.name) {
        return { exists: true, existingPatternId: patternId };
      }
    }

    return { exists: false };
  }

  private anonymizeContributor(contributorId: string): string {
    // Create anonymous but consistent ID for contributor
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(contributorId).digest('hex').substring(0, 16);
  }

  private async submitForCommunityReview(pattern: CommunityPattern): Promise<void> {
    // Submit pattern for community peer review
    // This would trigger notifications to expert reviewers
    
    const contribution: CommunityContribution = {
      id: `contrib_${Date.now()}`,
      contributorId: pattern.contributorId,
      contributionType: 'pattern',
      content: pattern,
      status: 'under_review',
      reviewComments: [],
      creditsAwarded: 0,
      impactScore: 0,
      submittedAt: new Date()
    };

    this.contributions.set(contribution.id, contribution);
  }

  private async rewardContributor(contributorId: string, value: number): Promise<void> {
    // Award community credits to contributor
    // This would update the contributor's reputation and credits
    
    logger.info('Contributor rewarded', {
      contributorId: this.anonymizeContributor(contributorId),
      creditsAwarded: value
    });
  }

  private calculateContributionValue(pattern: CommunityPattern): number {
    // Calculate value of contribution based on complexity and potential impact
    let value = 10; // Base value

    value += pattern.detectionRules.length * 5;
    value += pattern.linguisticMarkers.length * 3;
    value += pattern.jurisdiction.length * 2;

    return value;
  }

  private async findApplicablePatterns(
    documentText: string,
    existingContradictions: any[]
  ): Promise<CommunityPattern[]> {
    const applicablePatterns: CommunityPattern[] = [];

    for (const pattern of this.patterns.values()) {
      if (pattern.verificationStatus === 'verified' || pattern.verificationStatus === 'pending') {
        // Check if pattern detection rules match the document
        const matches = await this.testPatternMatch(pattern, documentText);
        if (matches) {
          applicablePatterns.push(pattern);
        }
      }
    }

    return applicablePatterns.filter(p => p.successRate > 0.6); // Only include reliable patterns
  }

  private async testPatternMatch(pattern: CommunityPattern, documentText: string): Promise<boolean> {
    const textLower = documentText.toLowerCase();

    for (const rule of pattern.detectionRules) {
      if (rule.ruleType === 'regex') {
        const regex = new RegExp(rule.pattern, 'gi');
        if (regex.test(documentText)) {
          return true;
        }
      } else if (rule.ruleType === 'semantic') {
        // Simple keyword matching for now (would use embeddings in production)
        if (textLower.includes(rule.pattern.toLowerCase())) {
          return true;
        }
      }
    }

    return false;
  }

  private async applyPatternToDocument(
    pattern: CommunityPattern,
    documentText: string,
    analysis: any
  ): Promise<{ applies: boolean; evidence: string[]; }> {
    const evidence: string[] = [];
    
    // Test pattern against document
    const matches = await this.testPatternMatch(pattern, documentText);
    
    if (matches) {
      // Extract evidence
      for (const rule of pattern.detectionRules) {
        if (rule.ruleType === 'regex') {
          const regex = new RegExp(rule.pattern, 'gi');
          const match = documentText.match(regex);
          if (match) {
            evidence.push(...match);
          }
        }
      }
    }

    return { applies: matches, evidence };
  }

  private async findInstitutionalBehaviorPatterns(
    analysis: any
  ): Promise<InstitutionalBehaviorPattern[]> {
    const patterns: InstitutionalBehaviorPattern[] = [];

    // Extract institution name from analysis (would be more sophisticated)
    const institutionName = this.extractInstitutionName(analysis);
    
    if (institutionName && this.institutionalBehaviors.has(institutionName)) {
      const pattern = this.institutionalBehaviors.get(institutionName);
      if (pattern) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  private extractInstitutionName(analysis: any): string | null {
    // Extract institution name from analysis
    // This would be more sophisticated in production
    if (analysis.institutionName) {
      return analysis.institutionName;
    }
    return null;
  }

  private async calculateCommunityEnhancedSuccess(
    baseSuccessRate: number,
    patterns: CommunityPattern[],
    institutionalPatterns: InstitutionalBehaviorPattern[]
  ): Promise<number> {
    let enhancedRate = baseSuccessRate;

    // Boost from community patterns
    for (const pattern of patterns) {
      enhancedRate += (pattern.successRate - 0.5) * 0.1; // 10% weight per pattern
    }

    // Boost from institutional intelligence
    for (const instPattern of institutionalPatterns) {
      const instSuccessRate = instPattern.successfulChallenges / instPattern.totalChallenges;
      enhancedRate += (instSuccessRate - 0.5) * 0.15; // 15% weight for institutional data
    }

    return Math.min(0.98, Math.max(0.1, enhancedRate)); // Cap between 10% and 98%
  }

  private calculateCollaborativeRating(insights: CommunityInsight[]): number {
    if (insights.length === 0) return 0;

    const totalVotes = insights.reduce((sum, insight) => sum + insight.communityVotes, 0);
    const verifiedInsights = insights.filter(i => i.expertVerification).length;

    return Math.min(10, (totalVotes / insights.length) + (verifiedInsights * 2));
  }

  private async updatePatternSuccessRate(patternId: string, wasSuccessful: boolean): Promise<void> {
    const pattern = this.patterns.get(patternId);
    if (pattern) {
      pattern.timesUsed++;
      if (wasSuccessful) {
        pattern.timesSuccessful++;
      }
      
      pattern.successRate = pattern.timesSuccessful / pattern.timesUsed;
      pattern.lastUpdated = new Date();
      
      this.patterns.set(patternId, pattern);
    }
  }

  private async updateInstitutionalBehavior(
    institutionResponse: string,
    strategiesUsed: string[],
    outcome: string,
    timeToResolution: number
  ): Promise<void> {
    // Update institutional behavior patterns based on case outcome
    // This would analyze response patterns and update the institutional intelligence
  }

  private calculateOutcomeShareValue(
    outcome: string,
    details: any
  ): number {
    let value = 20; // Base value for sharing outcome

    if (outcome === 'won') value += 30;
    else if (outcome === 'settled') value += 20;
    
    value += details.lessonsLearned.length * 5;
    
    return value;
  }

  private async addToCommunityLearningDatabase(data: any): Promise<void> {
    // Add case outcome to community learning database
    // This would update the machine learning models
  }

  private async getRecentTrends(institutionName: string): Promise<string[]> {
    // Get recent trends for institution behavior
    return [
      'Increased response time to challenges',
      'More frequent use of settlement offers',
      'Improved documentation quality'
    ];
  }

  private initializeCommunityDatabase(): void {
    // Initialize with some example community patterns
    const examplePattern: CommunityPattern = {
      id: 'community_pattern_001',
      name: 'Settlement Without Liability Acknowledgment',
      description: 'Institution offers financial settlement while explicitly denying any legal liability or wrongdoing',
      patternType: 'contradiction',
      detectionRules: [
        {
          ruleType: 'regex',
          pattern: '(tilby|tilbyr|tilbud|oppgjør).*(?!.*ansvar)',
          confidence: 0.89,
          context: ['financial_offer', 'liability_denial'],
          negativeMarkers: ['ansvarlig', 'skyld']
        }
      ],
      linguisticMarkers: [
        {
          language: 'no',
          markers: ['tilbyr oppgjør', 'ikke ansvarlig', 'uten skylderkjennelse'],
          negationPatterns: ['ikke', 'uten', 'ingen'],
          contextualClues: ['forsikring', 'erstatning', 'krav']
        }
      ],
      jurisdiction: ['NO', 'SE', 'DK'],
      successRate: 0.89,
      timesUsed: 127,
      timesSuccessful: 113,
      contributorId: 'community_verified',
      createdAt: new Date('2023-01-15'),
      lastUpdated: new Date(),
      communityRating: 9.2,
      verificationStatus: 'verified',
      tags: ['settlement', 'liability', 'contradiction', 'insurance'],
      relatedCases: ['case_001', 'case_045', 'case_089'],
      institutionTargets: ['insurance_companies', 'corporate_defendants'],
      counterStrategies: [
        'Highlight logical inconsistency between settlement offer and liability denial',
        'Request clarification on legal basis for payment if no liability exists',
        'Use settlement offer as evidence of uncertainty in denial'
      ]
    };

    this.patterns.set(examplePattern.id, examplePattern);

    // Initialize institutional behavior pattern
    const dnbPattern: InstitutionalBehaviorPattern = {
      institutionId: 'dnb_insurance',
      institutionName: 'DNB Livsforsikring',
      patternType: 'settlement_contradiction',
      frequency: 0.73,
      successfulChallenges: 89,
      totalChallenges: 127,
      averageResponseTime: 21, // days
      escalationTriggers: ['legal_representation_mentioned', 'media_involvement_threat'],
      weaknessIndicators: ['settlement_offers', 'procedural_delays', 'inconsistent_documentation'],
      optimalStrategies: [
        'Document logical contradictions immediately',
        'Request written clarification of settlement rationale',
        'Escalate to Finansklagenemnda with contradiction evidence'
      ],
      communityNotes: [
        'Responds faster when legal representation is mentioned',
        'Often offers higher settlements when contradictions are clearly documented',
        'Tends to avoid Finansklagenemnda escalation'
      ]
    };

    this.institutionalBehaviors.set(dnbPattern.institutionId, dnbPattern);
  }
}

export const communityIntelligenceService = new CommunityIntelligenceService();