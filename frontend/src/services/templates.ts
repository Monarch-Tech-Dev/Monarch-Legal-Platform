import { ResponseTemplate, GeneratedResponse, TemplateVariable, RESPONSE_TEMPLATES } from '../types/templates';

export class TemplateService {
  static getTemplates(): ResponseTemplate[] {
    return RESPONSE_TEMPLATES;
  }

  static getTemplateById(id: string): ResponseTemplate | undefined {
    return RESPONSE_TEMPLATES.find(template => template.id === id);
  }

  static getTemplatesByCategory(category: ResponseTemplate['category']): ResponseTemplate[] {
    return RESPONSE_TEMPLATES.filter(template => template.category === category);
  }

  static generateResponse(
    templateId: string, 
    variables: Record<string, string>
  ): GeneratedResponse | null {
    const template = this.getTemplateById(templateId);
    if (!template) return null;

    // Replace template variables with actual values
    let content = template.content;
    const templateVariables: TemplateVariable[] = [];

    template.variables.forEach(variableName => {
      const value = variables[variableName] || `[${variableName}]`;
      const regex = new RegExp(`{{${variableName}}}`, 'g');
      content = content.replace(regex, value);
      
      templateVariables.push({
        name: variableName,
        value: value,
        required: true
      });
    });

    return {
      templateId: template.id,
      content,
      variables: templateVariables,
      successProbability: template.successRate,
      strategy: template.category,
      followUpActions: template.followUpActions,
      legalCitations: template.legalPrecedent,
      generatedAt: new Date()
    };
  }

  static validateRequiredVariables(templateId: string, variables: Record<string, string>): string[] {
    const template = this.getTemplateById(templateId);
    if (!template) return ['Template not found'];

    const missingVariables: string[] = [];
    template.variables.forEach(variableName => {
      if (!variables[variableName] || variables[variableName].trim() === '') {
        missingVariables.push(variableName);
      }
    });

    return missingVariables;
  }

  static previewTemplate(templateId: string): string {
    const template = this.getTemplateById(templateId);
    if (!template) return '';

    // Show template with placeholder values for preview
    let preview = template.content;
    template.variables.forEach(variableName => {
      const placeholder = this.getPlaceholderValue(variableName);
      const regex = new RegExp(`{{${variableName}}}`, 'g');
      preview = preview.replace(regex, placeholder);
    });

    return preview;
  }

  private static getPlaceholderValue(variableName: string): string {
    const placeholders: Record<string, string> = {
      'INSTITUTION_NAME': 'DNB Livsforsikring AS',
      'CASE_NUMBER': '202504176',
      'DATE': new Date().toLocaleDateString('no-NO'),
      'SENDER_NAME': '[Your Name]',
      'CONTRADICTIONS': '1. "Ingen fysisk hendelse fant sted"\n2. "Sammenstøtet resulterte i skade"',
      'HIGHER_AUTHORITY': 'NAV',
      'AUTHORITY_LEVEL': '1',
      'HIGHER_AUTHORITY_DECISION': 'Godkjent uføretrygd basert på dokumentert arbeidsevnenedsettelse',
      'LOWER_AUTHORITY': 'Forsikringsselskap',
      'LOWER_AUTHORITY_LEVEL': '5',
      'SETTLEMENT_AMOUNT': 'NOK 25.000',
      'LIABILITY_DENIAL': 'intet erstatningsansvar foreligger'
    };

    return placeholders[variableName] || `[${variableName}]`;
  }
}