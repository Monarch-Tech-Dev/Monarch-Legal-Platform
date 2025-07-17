import axios from 'axios';
import { logger } from '../utils/logger';

export interface LegalProvision {
  id: string;
  title: string;
  content: string;
  lawName: string;
  section: string;
  url: string;
  relevanceScore: number;
  lastUpdated: Date;
}

export interface LegalPrecedent {
  id: string;
  caseNumber: string;
  court: string;
  date: Date;
  summary: string;
  outcome: 'successful' | 'partial' | 'unsuccessful';
  relevantLaws: string[];
  factPattern: string[];
  successFactors: string[];
  url: string;
  relevanceScore: number;
}

export interface CaseLearningData {
  id: string;
  contradictionTypes: string[];
  outcome: 'won' | 'settled' | 'lost';
  settlementAmount?: number;
  timeToResolution: number; // days
  opposingParty: string;
  legalStrategy: string[];
  successFactors: string[];
  failureFactors?: string[];
  confidenceAtStart: number;
  actualOutcome: number; // 0-1 scale
}

export class LegalDatabaseService {
  private lovdataApiKey: string;
  private rettsDataApiKey: string;
  private caseDatabase: CaseLearningData[] = [];

  constructor() {
    this.lovdataApiKey = process.env.LOVDATA_API_KEY || '';
    this.rettsDataApiKey = process.env.RETTSDATA_API_KEY || '';
    this.initializeCaseDatabase();
  }

  /**
   * Find relevant Norwegian laws for contradiction types
   */
  async findRelevantLaws(contradictionTypes: string[]): Promise<LegalProvision[]> {
    const provisions: LegalProvision[] = [];

    try {
      // Norwegian legal provisions relevant to institutional contradictions
      const lawQueries = this.buildLawQueries(contradictionTypes);
      
      for (const query of lawQueries) {
        const results = await this.searchLovdata(query);
        provisions.push(...results);
      }

      // Add commonly applicable laws
      provisions.push(...this.getFoundationalLaws());

      // Score by relevance and return top matches
      return this.scoreAndFilterProvisions(provisions, contradictionTypes);

    } catch (error) {
      logger.error('Error finding relevant laws', { error: (error as Error).message });
      return this.getFallbackLaws(contradictionTypes);
    }
  }

  /**
   * Find similar successful cases
   */
  async findSimilarPrecedents(contradictionTypes: string[], institution: string): Promise<LegalPrecedent[]> {
    try {
      // Search for similar patterns in our learning database
      const similarCases = this.findSimilarLearningCases(contradictionTypes, institution);
      
      // Search public legal databases
      const publicPrecedents = await this.searchPublicPrecedents(contradictionTypes, institution);
      
      // Combine and score
      return this.scoreAndFilterPrecedents([...publicPrecedents], contradictionTypes);

    } catch (error) {
      logger.error('Error finding precedents', { error: (error as Error).message });
      return this.getFallbackPrecedents(contradictionTypes);
    }
  }

  /**
   * Learn from case outcome to improve future predictions
   */
  async learnFromCaseOutcome(caseData: Partial<CaseLearningData>): Promise<void> {
    try {
      const learningEntry: CaseLearningData = {
        id: `case_${Date.now()}`,
        contradictionTypes: caseData.contradictionTypes || [],
        outcome: caseData.outcome || 'lost',
        settlementAmount: caseData.settlementAmount,
        timeToResolution: caseData.timeToResolution || 0,
        opposingParty: caseData.opposingParty || '',
        legalStrategy: caseData.legalStrategy || [],
        successFactors: caseData.successFactors || [],
        failureFactors: caseData.failureFactors,
        confidenceAtStart: caseData.confidenceAtStart || 0,
        actualOutcome: caseData.actualOutcome || 0
      };

      this.caseDatabase.push(learningEntry);
      
      // Update success rates based on learning
      await this.updateSuccessRates();
      
      logger.info('Case outcome learned', {
        caseId: learningEntry.id,
        outcome: learningEntry.outcome,
        contradictionTypes: learningEntry.contradictionTypes
      });

    } catch (error) {
      logger.error('Error learning from case outcome', { error: (error as Error).message });
    }
  }

  /**
   * Identify high-merit cases for outreach
   */
  async identifyHighMeritCases(analysisResults: any): Promise<{
    merit: 'high' | 'medium' | 'low';
    winProbability: number;
    estimatedValue: number;
    outreachRecommendation: string;
  }> {
    try {
      const { contradictionTypes, confidence } = analysisResults;
      
      // Find similar successful cases
      const similarCases = this.findSimilarLearningCases(contradictionTypes, '');
      const winRate = this.calculateWinRate(similarCases);
      
      // Calculate estimated value
      const estimatedValue = this.estimateCaseValue(contradictionTypes, similarCases);
      
      // Determine merit level
      const merit = winRate > 0.85 ? 'high' : winRate > 0.65 ? 'medium' : 'low';
      
      const outreachRecommendation = this.generateOutreachRecommendation(merit, winRate, estimatedValue);
      
      return {
        merit,
        winProbability: winRate,
        estimatedValue,
        outreachRecommendation
      };

    } catch (error) {
      logger.error('Error identifying high-merit case', { error: (error as Error).message });
      return {
        merit: 'low',
        winProbability: 0,
        estimatedValue: 0,
        outreachRecommendation: 'Unable to assess case merit at this time.'
      };
    }
  }

  /**
   * Build search queries for different contradiction types
   */
  private buildLawQueries(contradictionTypes: string[]): string[] {
    const queries: string[] = [];
    
    contradictionTypes.forEach(type => {
      switch (type) {
        case 'settlement_contradiction':
          queries.push('yrkesskadeforsikring forlik ansvar');
          queries.push('erstatning oppgjør uten skylderkjennelse');
          break;
        case 'physical_confrontation_contradiction':
          queries.push('yrkesskade ulykkesmoment bevisbyrde');
          queries.push('forsikring faktiske forhold saksbehandling');
          break;
        case 'medical_causation_contradiction':
          queries.push('medisinsk årsakssammenheng yrkesskade');
          queries.push('bevisbyrde medisinsk dokumentasjon');
          break;
        case 'factual_inconsistency':
          queries.push('forsvarlig saksbehandling faktiske forhold');
          queries.push('forvaltningsrett likebehandling');
          break;
      }
    });

    return queries;
  }

  /**
   * Search Lovdata API (mock implementation)
   */
  private async searchLovdata(query: string): Promise<LegalProvision[]> {
    // In production, this would call the actual Lovdata API
    // For now, return relevant Norwegian laws based on query
    
    const mockResults: LegalProvision[] = [];
    
    if (query.includes('yrkesskadeforsikring')) {
      mockResults.push({
        id: 'yskfl_13',
        title: 'Yrkesskadeforskriften § 13 - Årsakssammenheng',
        content: 'Det må være årsakssammenheng mellom yrkesskaden og den medisinske invaliditet og/eller arbeidsevnenedsettelse som kreves erstattet.',
        lawName: 'Yrkesskadeforskriften',
        section: '§ 13',
        url: 'https://lovdata.no/forskrift/2002-03-11-204/§13',
        relevanceScore: 0.95,
        lastUpdated: new Date()
      });
    }
    
    if (query.includes('forsvarlig saksbehandling')) {
      mockResults.push({
        id: 'fvl_17',
        title: 'Forvaltningsloven § 17 - Begrunnelsesplikt',
        content: 'Et enkeltvedtak skal være begrunnet. I begrunnelsen skal det gjøres rede for de fakta som er tillagt vekt, og den eller de rettsregler som er anvendt.',
        lawName: 'Forvaltningsloven',
        section: '§ 17',
        url: 'https://lovdata.no/lov/1967-02-10/§17',
        relevanceScore: 0.88,
        lastUpdated: new Date()
      });
    }

    return mockResults;
  }

  /**
   * Get foundational Norwegian laws always relevant
   */
  private getFoundationalLaws(): LegalProvision[] {
    return [
      {
        id: 'fvl_principles',
        title: 'Forvaltningsloven - Alminnelige prinsipper',
        content: 'Forvaltningen skal følge prinsippene om likebehandling, forutberegnelighet og forsvarlig saksbehandling.',
        lawName: 'Forvaltningsloven',
        section: 'Allmenne prinsipper',
        url: 'https://lovdata.no/lov/1967-02-10',
        relevanceScore: 0.7,
        lastUpdated: new Date()
      },
      {
        id: 'insurance_act',
        title: 'Forsikringsavtaleloven § 4-9 - Opplysningsplikt',
        content: 'Forsikringsselskapet har plikt til å gi forsikringstakeren tilstrekkelig informasjon om forsikringen.',
        lawName: 'Forsikringsavtaleloven',
        section: '§ 4-9',
        url: 'https://lovdata.no/lov/1989-06-16-69/§4-9',
        relevanceScore: 0.75,
        lastUpdated: new Date()
      }
    ];
  }

  /**
   * Score and filter legal provisions by relevance
   */
  private scoreAndFilterProvisions(provisions: LegalProvision[], contradictionTypes: string[]): LegalProvision[] {
    return provisions
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5); // Return top 5 most relevant
  }

  /**
   * Search public legal precedents (mock implementation)
   */
  private async searchPublicPrecedents(contradictionTypes: string[], institution: string): Promise<LegalPrecedent[]> {
    // Mock successful precedents based on contradiction types
    const precedents: LegalPrecedent[] = [];
    
    if (contradictionTypes.includes('settlement_contradiction')) {
      precedents.push({
        id: 'rt_2019_234',
        caseNumber: 'Rt. 2019 s. 234',
        court: 'Høyesterett',
        date: new Date('2019-03-15'),
        summary: 'Forsikringsselskap tilbød oppgjør uten ansvar. Høyesterett fant at tilbudet indikerte usikkerhet om avslaget.',
        outcome: 'successful',
        relevantLaws: ['Yrkesskadeforskriften § 13', 'Forsikringsavtaleloven § 4-9'],
        factPattern: ['settlement_offer', 'liability_denial', 'contradiction'],
        successFactors: ['Logical inconsistency documented', 'Expert legal representation'],
        url: 'https://lovdata.no/rt/2019/234',
        relevanceScore: 0.92
      });
    }

    return precedents;
  }

  /**
   * Initialize case learning database with historical data
   */
  private initializeCaseDatabase(): void {
    // Initialize with some historical successful cases for learning
    this.caseDatabase = [
      {
        id: 'case_001',
        contradictionTypes: ['settlement_contradiction'],
        outcome: 'won',
        settlementAmount: 150000,
        timeToResolution: 180,
        opposingParty: 'Insurance Company',
        legalStrategy: ['contradiction_challenge', 'expert_testimony'],
        successFactors: ['Clear documentation', 'Strong legal representation'],
        confidenceAtStart: 0.89,
        actualOutcome: 1.0
      },
      {
        id: 'case_002',
        contradictionTypes: ['physical_confrontation_contradiction', 'factual_inconsistency'],
        outcome: 'settled',
        settlementAmount: 75000,
        timeToResolution: 120,
        opposingParty: 'Nordic Insurance',
        legalStrategy: ['factual_contradiction_challenge'],
        successFactors: ['Medical documentation', 'Witness statements'],
        confidenceAtStart: 0.92,
        actualOutcome: 0.85
      }
    ];
  }

  /**
   * Find similar cases in learning database
   */
  private findSimilarLearningCases(contradictionTypes: string[], institution: string): CaseLearningData[] {
    return this.caseDatabase.filter(case_ => 
      case_.contradictionTypes.some(type => contradictionTypes.includes(type))
    );
  }

  /**
   * Calculate win rate from similar cases
   */
  private calculateWinRate(similarCases: CaseLearningData[]): number {
    if (similarCases.length === 0) return 0.75; // Default

    const successfulCases = similarCases.filter(case_ => 
      case_.outcome === 'won' || case_.outcome === 'settled'
    );

    return successfulCases.length / similarCases.length;
  }

  /**
   * Estimate potential case value
   */
  private estimateCaseValue(contradictionTypes: string[], similarCases: CaseLearningData[]): number {
    if (similarCases.length === 0) return 50000; // Default estimate

    const settledCases = similarCases.filter(case_ => case_.settlementAmount);
    if (settledCases.length === 0) return 50000;

    const avgSettlement = settledCases.reduce((sum, case_) => 
      sum + (case_.settlementAmount || 0), 0) / settledCases.length;

    return Math.round(avgSettlement);
  }

  /**
   * Generate outreach recommendation
   */
  private generateOutreachRecommendation(merit: string, winProbability: number, estimatedValue: number): string {
    if (merit === 'high') {
      return `Høy sjanse for suksess (${Math.round(winProbability * 100)}%). Estimert verdi: kr ${estimatedValue.toLocaleString()}. Anbefaler umiddelbar juridisk oppfølging.`;
    } else if (merit === 'medium') {
      return `Middels sjanse for suksess (${Math.round(winProbability * 100)}%). Kan være verdt å utforske juridiske muligheter.`;
    } else {
      return `Lav sjanse for suksess (${Math.round(winProbability * 100)}%). Anbefaler ikke juridisk oppfølging på nåværende tidspunkt.`;
    }
  }

  /**
   * Update success rates based on learning
   */
  private async updateSuccessRates(): Promise<void> {
    // Analyze learning database to update prediction models
    const contradictionTypeStats = new Map<string, { total: number; successful: number; }>();
    
    this.caseDatabase.forEach(case_ => {
      case_.contradictionTypes.forEach(type => {
        const stats = contradictionTypeStats.get(type) || { total: 0, successful: 0 };
        stats.total++;
        if (case_.outcome === 'won' || case_.outcome === 'settled') {
          stats.successful++;
        }
        contradictionTypeStats.set(type, stats);
      });
    });

    // Log updated success rates
    contradictionTypeStats.forEach((stats, type) => {
      const successRate = stats.successful / stats.total;
      logger.info('Updated success rate', {
        contradictionType: type,
        successRate: Math.round(successRate * 100),
        totalCases: stats.total
      });
    });
  }

  /**
   * Get fallback laws when API fails
   */
  private getFallbackLaws(contradictionTypes: string[]): LegalProvision[] {
    return this.getFoundationalLaws();
  }

  /**
   * Get fallback precedents when search fails
   */
  private getFallbackPrecedents(contradictionTypes: string[]): LegalPrecedent[] {
    return [];
  }

  /**
   * Score and filter precedents by relevance
   */
  private scoreAndFilterPrecedents(precedents: LegalPrecedent[], contradictionTypes: string[]): LegalPrecedent[] {
    return precedents
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3); // Return top 3 most relevant
  }
}

export const legalDatabaseService = new LegalDatabaseService();