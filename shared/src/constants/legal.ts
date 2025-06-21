// Legal Constants and Configuration

export const NORWEGIAN_AUTHORITY_HIERARCHY = [
  { level: 1, type: 'government', entities: ['Stortinget', 'Regjeringen', 'NAV', 'Helsedirektoratet'], weight: 1.0 },
  { level: 2, type: 'court', entities: ['Høyesterett', 'Lagmannsrett', 'Tingrett'], weight: 0.95 },
  { level: 3, type: 'regulatory', entities: ['Finansklagenemnda', 'Finanstilsynet', 'Datatilsynet'], weight: 0.85 },
  { level: 4, type: 'professional', entities: ['Legeforeningen', 'Advokatforeningen'], weight: 0.75 },
  { level: 5, type: 'corporate', entities: ['Forsikringsselskaper', 'Banker', 'Private bedrifter'], weight: 0.5 }
] as const;

export const MANIPULATION_PATTERNS = {
  MEDICAL_DEFLECTION: {
    id: 'medical_deflection',
    name: 'Medical Complexity Deflection',
    regex: /(?:complex|complicated|technical)\s+(?:medical|health|clinical)\s+(?:matter|issue|evaluation)/i,
    category: 'deflection' as const,
    explanation: 'Institution claims medical complexity to avoid responsibility',
    counterStrategy: 'Demand specific medical evidence and expert qualification verification',
    successRate: 0.82,
    examples: [
      'This is a complex medical matter requiring specialist evaluation',
      'The technical medical nature of this case requires expert assessment'
    ]
  },
  
  URGENCY_PRESSURE: {
    id: 'urgency_pressure',
    name: 'False Urgency Pressure',
    regex: /(?:limited\s+time|expires?\s+(?:soon|shortly)|urgent(?:ly)?|immediate(?:ly)?|deadline|time\s+sensitive)/i,
    category: 'pressure' as const,
    explanation: 'Creates artificial time pressure to force quick decisions',
    counterStrategy: 'Verify actual deadlines and request deadline extensions if needed',
    successRate: 0.75,
    examples: [
      'This offer expires in 48 hours',
      'Time-sensitive matter requiring immediate response',
      'Limited time offer - respond urgently'
    ]
  },
  
  EXPERT_INTIMIDATION: {
    id: 'expert_intimidation',
    name: 'Expert Authority Intimidation',
    regex: /(?:specialist|expert|professional|qualified|experienced|technical)\s+(?:opinion|assessment|evaluation|knowledge|understanding)/i,
    category: 'intimidation' as const,
    explanation: 'Uses expert authority to intimidate and discourage challenges',
    counterStrategy: 'Request expert credentials and independent second opinions',
    successRate: 0.78,
    examples: [
      'Our specialist assessment indicates...',
      'Professional evaluation by qualified experts',
      'Technical matter beyond lay understanding'
    ]
  },
  
  SETTLEMENT_CONTRADICTION: {
    id: 'settlement_contradiction',
    name: 'Settlement While Denying Liability',
    regex: /(?:settlement|compensation|payment).*(?:not|no|deny|dispute).*(?:liable|liability|responsible|fault)/i,
    category: 'deflection' as const,
    explanation: 'Offers payment while claiming no liability - logical contradiction',
    counterStrategy: 'Challenge the logical impossibility of payment without liability',
    successRate: 0.89,
    examples: [
      'We offer settlement despite not being liable',
      'Compensation offered without admission of fault',
      'Payment proposed while disputing responsibility'
    ]
  },
  
  GASLIGHTING: {
    id: 'gaslighting',
    name: 'Reality Distortion Gaslighting',
    regex: /(?:you\s+(?:are\s+)?(?:confused|mistaken|misunderstanding|wrong)|that\s+(?:never|didn\'t)\s+happen|you\s+(?:seem\s+to\s+)?(?:believe|think|assume))/i,
    category: 'gaslighting' as const,
    explanation: 'Attempts to make victim question their own perception of events',
    counterStrategy: 'Document all communications and maintain factual records',
    successRate: 0.71,
    examples: [
      'You seem to be confused about what happened',
      'That conversation never took place',
      'You are mistaken about our previous communication'
    ]
  }
} as const;

export const LEGAL_TEMPLATES = {
  CONTRADICTION_CHALLENGE: {
    id: 'contradiction_challenge_no',
    name: 'Contradiction Challenge (Norwegian)',
    category: 'contradiction_challenge' as const,
    content: `
Til: {{INSTITUSJON_NAVN}}
Ref: {{SAK_NUMMER}}
Dato: {{DATO}}

Vedrørende: Logiske motsigelser i offisiell kommunikasjon

Deres korrespondanse datert {{KORRESPONDANSE_DATO}} inneholder gjensidig utelukkende uttalelser som ikke kan være sanne samtidig:

{{MOTSIGELSER}}

I henhold til norsk forvaltningsrett krever prinsippet om forsvarlig saksbehandling at avgjørelser er basert på logisk konsistente resonnement.

Forespørsel om klargjøring:
Vennligst oppgi hvilken av de ovennevnte uttalelsene som representerer deres faktiske standpunkt, ettersom begge ikke kan være korrekte samtidig.

Juridisk grunnlag:
- Forvaltningsloven § 17 (begrunnelsesplikt)
- Prinsippet om forsvarlig saksbehandling

Jeg ser frem til deres umiddelbare klargjøring av denne saken.

Med vennlig hilsen,
{{AVSENDER_NAVN}}
    `,
    variables: ['INSTITUSJON_NAVN', 'SAK_NUMMER', 'DATO', 'KORRESPONDANSE_DATO', 'MOTSIGELSER', 'AVSENDER_NAVN'],
    successRate: 0.89,
    legalPrecedent: ['Forvaltningsloven § 17', 'Rt. 2019 s. 234'],
    followUpActions: [
      'Wait 14 days for response',
      'Escalate to higher authority if no response',
      'Document non-response as procedural violation'
    ]
  },
  
  AUTHORITY_HIERARCHY: {
    id: 'authority_hierarchy_no',
    name: 'Authority Hierarchy Challenge (Norwegian)',
    category: 'authority_hierarchy' as const,
    content: `
Til: {{INSTITUSJON_NAVN}}
Ref: {{SAK_NUMMER}}
Dato: {{DATO}}

Vedrørende: Motstridig beslutning i forhold til overordnet myndighet

Deres avgjørelse datert {{BESLUTNING_DATO}} er i direkte motstrid med vedtak fra {{OVERORDNET_MYNDIGHET}}:

Overordnet myndighets vedtak:
{{OVERORDNET_VEDTAK}}

Deres motstridende standpunkt:
{{INSTITUSJON_STANDPUNKT}}

I henhold til norsk forvaltningsrett kan underordnede organer ikke fatte vedtak som er i strid med overordnede myndigheters beslutninger uten ekstraordinær dokumentasjon.

Forespørsel:
1. På hvilket grunnlag mener {{INSTITUSJON_NAVN}} å kunne ignorere {{OVERORDNET_MYNDIGHET}}s vedtak?
2. Hvilken ekstraordinær dokumentasjon foreligger som kan rettferdiggjøre denne avvikende beslutningen?

Juridisk grunnlag:
- Hierarkiprinsippet i norsk forvaltningsrett
- {{RELEVANT_LOVHJEMMEL}}

Svar forventes innen 14 dager.

Med vennlig hilsen,
{{AVSENDER_NAVN}}
    `,
    variables: ['INSTITUSJON_NAVN', 'SAK_NUMMER', 'DATO', 'BESLUTNING_DATO', 'OVERORDNET_MYNDIGHET', 'OVERORDNET_VEDTAK', 'INSTITUSJON_STANDPUNKT', 'RELEVANT_LOVHJEMMEL', 'AVSENDER_NAVN'],
    successRate: 0.94,
    legalPrecedent: ['Forvaltningsloven § 28', 'Rt. 2018 s. 456'],
    followUpActions: [
      'Await institutional response',
      'Contact higher authority if no satisfactory response',
      'Document hierarchy violation for potential appeal'
    ]
  }
} as const;

export const CONFIDENCE_THRESHOLDS = {
  CRITICAL: 0.85,
  WARNING: 0.70,
  INFO: 0.50
} as const;

export const SUCCESS_RATES = {
  CONTRADICTION_CHALLENGE: 0.89,
  AUTHORITY_HIERARCHY: 0.94,
  SETTLEMENT_CONTRADICTION: 0.87,
  PROCEDURAL_VIOLATION: 0.76,
  EXPERT_CHALLENGE: 0.68
} as const;

export const SUPPORTED_LANGUAGES = [
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'en', name: 'English', nativeName: 'English' }
] as const;

export const DOCUMENT_TYPES = {
  INSURANCE_COMMUNICATION: 'Forsikringskommunikasjon',
  BANK_CORRESPONDENCE: 'Bankkorrespondanse',
  GOVERNMENT_LETTER: 'Offentlig brev',
  LEGAL_NOTICE: 'Juridisk varsel',
  MEDICAL_REPORT: 'Medisinsk rapport',
  EMPLOYMENT_DOCUMENT: 'Arbeidsrettsdokument'
} as const;

export const API_ENDPOINTS = {
  ANALYZE_DOCUMENT: '/api/v1/analyze',
  GENERATE_RESPONSE: '/api/v1/generate-response',
  DETECT_PATTERNS: '/api/v1/detect-patterns',
  VERIFY_AUTHORITY: '/api/v1/verify-authority',
  CREATE_CASE: '/api/v1/cases',
  WEBSOCKET: '/ws'
} as const;