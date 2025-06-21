import ContradictionDetector from '../../src/analyzers/contradictionDetector';
import { ProcessedDocument } from '@shared/types/analysis';

describe('ContradictionDetector', () => {
  let detector: ContradictionDetector;

  beforeEach(() => {
    detector = new ContradictionDetector();
  });

  const createMockDocument = (text: string): ProcessedDocument => ({
    id: 'test-doc-1',
    originalFile: null as any,
    extractedText: text,
    metadata: {
      filename: 'test.txt',
      fileSize: text.length,
      mimeType: 'text/plain',
      language: 'no'
    },
    structure: {
      sections: [],
      entities: [],
      statements: [],
      metadata: {}
    },
    timestamp: new Date(),
    processingTime: 0
  });

  describe('Settlement Contradiction Detection', () => {
    it('should detect settlement contradiction with high confidence', async () => {
      const text = `
        Vi tilbyr et oppgjør på 25 000 kroner for å avslutte denne saken.
        Vi benekter ethvert ansvar for de påståtte skadene i denne saken.
      `;
      
      const document = createMockDocument(text);
      const result = await detector.analyze(document);

      expect(result.findings).toHaveLength(1);
      expect(result.findings[0].type).toBe('settlement_contradiction');
      expect(result.findings[0].confidence).toBeGreaterThan(0.8);
      expect(result.findings[0].severity).toBe('critical');
    });

    it('should not detect contradiction when no settlement is offered', async () => {
      const text = `
        Vi benekter ethvert ansvar for de påståtte skadene i denne saken.
        Saken er avsluttet fra vår side.
      `;
      
      const document = createMockDocument(text);
      const result = await detector.analyze(document);

      expect(result.findings).toHaveLength(0);
    });

    it('should not detect contradiction when liability is accepted', async () => {
      const text = `
        Vi tilbyr et oppgjør på 25 000 kroner for å avslutte denne saken.
        Vi anerkjenner vårt ansvar i denne saken.
      `;
      
      const document = createMockDocument(text);
      const result = await detector.analyze(document);

      expect(result.findings).toHaveLength(0);
    });
  });

  describe('Direct Negation Detection', () => {
    it('should detect direct contradictory statements', async () => {
      const text = `
        Dokumentet ble mottatt den 15. januar.
        Vi har ikke mottatt noe dokument fra deg.
      `;
      
      const document = createMockDocument(text);
      const result = await detector.analyze(document);

      expect(result.findings.length).toBeGreaterThan(0);
      expect(result.findings.some(f => f.type === 'direct_negation')).toBe(true);
    });
  });

  describe('Module Result Structure', () => {
    it('should return properly structured module result', async () => {
      const text = 'Vi tilbyr oppgjør men har ikke ansvar.';
      const document = createMockDocument(text);
      
      const result = await detector.analyze(document);

      expect(result).toHaveProperty('moduleId', 'contradiction-detection');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('findings');
      expect(result).toHaveProperty('actionable');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('processingTime');
      
      expect(Array.isArray(result.findings)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(typeof result.confidence).toBe('number');
      expect(typeof result.processingTime).toBe('number');
    });

    it('should generate recommendations for found contradictions', async () => {
      const text = `
        Vi tilbyr et oppgjør på 50 000 kroner.
        Vi benekter ethvert ansvar for hendelsen.
      `;
      
      const document = createMockDocument(text);
      const result = await detector.analyze(document);

      expect(result.findings.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.actionable).toBe(true);
      
      const recommendation = result.recommendations[0];
      expect(recommendation).toHaveProperty('strategy');
      expect(recommendation).toHaveProperty('successProbability');
      expect(recommendation).toHaveProperty('requiredActions');
      expect(Array.isArray(recommendation.requiredActions)).toBe(true);
    });
  });

  describe('Confidence Calculation', () => {
    it('should calculate higher confidence for clear contradictions', async () => {
      const clearContradiction = `
        Vi tilbyr 100 000 kroner i oppgjør.
        Vi har ikke ansvar for denne saken.
      `;
      
      const document = createMockDocument(clearContradiction);
      const result = await detector.analyze(document);

      if (result.findings.length > 0) {
        expect(result.findings[0].confidence).toBeGreaterThan(0.8);
      }
    });

    it('should return zero confidence when no contradictions found', async () => {
      const text = 'Dette er et vanlig dokument uten motsigelser.';
      const document = createMockDocument(text);
      
      const result = await detector.analyze(document);

      expect(result.confidence).toBe(0);
      expect(result.findings).toHaveLength(0);
    });
  });
});