export interface ResponseTemplate {
  id: string;
  name: string;
  category: 'contradiction_challenge' | 'authority_hierarchy' | 'settlement_contradiction' | 'procedural_violation';
  content: string; // Template with {{VARIABLES}}
  variables: string[];
  successRate: number;
  legalPrecedent: string[];
  followUpActions: string[];
  description: string;
}

export interface TemplateVariable {
  name: string;
  value: string;
  required: boolean;
}

export interface GeneratedResponse {
  templateId: string;
  content: string;
  variables: TemplateVariable[];
  successProbability: number;
  strategy: string;
  followUpActions: string[];
  legalCitations: string[];
  generatedAt: Date;
}

export const RESPONSE_TEMPLATES: ResponseTemplate[] = [
  {
    id: 'contradiction_challenge_v2',
    name: 'Contradiction Challenge (Proven Method)',
    category: 'contradiction_challenge',
    description: 'Challenge logically contradictory statements in institutional communications',
    content: `Til: {{INSTITUTION_NAME}}
Vedr: Logiske motsigelser i offisiell kommunikasjon - Sak {{CASE_NUMBER}}

Deres korrespondanse datert {{DATE}} inneholder gjensidig utelukkende uttalelser som ikke kan være sanne samtidig:

{{CONTRADICTIONS}}

Forespørsel om klargjøring:
Vennligst klargjør hvilken uttalelse som representerer deres faktiske standpunkt, da begge ikke kan være sanne samtidig iht. logiske prinsipper.

Juridisk grunnlag:
Avgjørelser basert på motstridende resonnement mangler logisk fundament og prosessuell gyldighet under norsk forvaltningsrett (Forvaltningsloven § 17).

Med vennlig hilsen,
{{SENDER_NAME}}`,
    variables: ['INSTITUTION_NAME', 'CASE_NUMBER', 'DATE', 'CONTRADICTIONS', 'SENDER_NAME'],
    successRate: 0.89,
    legalPrecedent: ['Forvaltningsloven § 17', 'God forvaltningsskikk'],
    followUpActions: [
      'Await clarification response within 3 weeks',
      'Document any admission or position change',
      'Escalate if contradictions remain unresolved'
    ]
  },
  {
    id: 'authority_hierarchy_v3',
    name: 'Authority Hierarchy Challenge',
    category: 'authority_hierarchy',
    description: 'Challenge lower authorities contradicting higher authorities',
    content: `Til: {{INSTITUTION_NAME}}
Vedr: Hierarkisk autoritetsmyndighet - Sak {{CASE_NUMBER}}

{{HIGHER_AUTHORITY}} (nivå {{AUTHORITY_LEVEL}}) har fastslått:
{{HIGHER_AUTHORITY_DECISION}}

Deres posisjon som {{LOWER_AUTHORITY}} (nivå {{LOWER_AUTHORITY_LEVEL}}) motsier denne høyere myndighet.

Forespørsel:
Vennligst fremlegge ekstraordinære bevis som rettferdiggjør motsigelse av høyere autoritet, eller korrigere deres posisjon i samsvar med etablert hierarki.

Juridisk prinsipp:
Lavere myndigheter kan ikke overstyre høyere myndigheter uten ekstraordinær bevisbyrde under norsk rettssystem.

Med vennlig hilsen,
{{SENDER_NAME}}`,
    variables: ['INSTITUTION_NAME', 'CASE_NUMBER', 'HIGHER_AUTHORITY', 'AUTHORITY_LEVEL', 'HIGHER_AUTHORITY_DECISION', 'LOWER_AUTHORITY', 'LOWER_AUTHORITY_LEVEL', 'SENDER_NAME'],
    successRate: 0.94,
    legalPrecedent: ['Forvaltningsloven § 28', 'Tvisteloven § 21-4'],
    followUpActions: [
      'Request evidence supporting contradiction of higher authority',
      'Document lack of extraordinary evidence if not provided',
      'Cite specific authority hierarchy violations'
    ]
  },
  {
    id: 'settlement_logic_challenge',
    name: 'Settlement Contradiction Logic',
    category: 'settlement_contradiction',
    description: 'Challenge the logic of offering settlement while denying liability',
    content: `Til: {{INSTITUTION_NAME}}
Vedr: Logisk inkonsekvens i forlikstilbud - Sak {{CASE_NUMBER}}

Deres tilbud om {{SETTLEMENT_AMOUNT}} samtidig som dere hevder {{LIABILITY_DENIAL}} skaper en logisk motsigelse.

Logisk analyse:
- Hvis ingen ansvar foreligger, skal ingen betaling tilbys
- Betalingsvillighet indikerer usikkerhet i avslåningsposisjon
- Forlikstilbud undergraver påstanden om manglende ansvar

Forespørsel:
Vennligst klargjør denne logiske inkonsekvensen og revidere enten ansvarsvurdering eller betalingstilbud.

Juridisk implikasjon:
Tilbud om betaling mens ansvar benektes indikerer svakhet i saksgrunnlag og kan tolkes som innrømmelse av usikkerhet.

Med vennlig hilsen,
{{SENDER_NAME}}`,
    variables: ['INSTITUTION_NAME', 'CASE_NUMBER', 'SETTLEMENT_AMOUNT', 'LIABILITY_DENIAL', 'SENDER_NAME'],
    successRate: 0.87,
    legalPrecedent: ['Tvisteloven § 21-4', 'Avtalerett generelt'],
    followUpActions: [
      'Document settlement offer as evidence of liability uncertainty',
      'Request revised liability assessment',
      'Prepare for potential increased settlement negotiation'
    ]
  }
];