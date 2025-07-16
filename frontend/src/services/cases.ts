import { Case, CaseStats, CaseFilters, CreateCaseRequest, CaseTimelineEvent } from '../types/cases';

// Mock data for demonstration - in production this would connect to backend API
const mockCases: Case[] = [
  {
    id: '1',
    title: 'Settlement Contradiction Challenge',
    description: 'Identified contradictory statements in settlement agreement that violate previous commitments.',
    status: 'active',
    priority: 'high',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    dueDate: new Date('2024-02-15'),
    institution: 'Oslo Municipality',
    institutionType: 'government',
    analysisResults: ['analysis_1'],
    responses: ['response_1'],
    documents: ['doc_1', 'doc_2'],
    tags: ['settlement', 'contradiction', 'urgent'],
    contactInfo: {
      primaryContact: 'Legal Department',
      email: 'legal@oslo.kommune.no',
      phone: '+47 23 48 00 00',
      preferredContactMethod: 'email'
    },
    timeline: [
      {
        id: 't1',
        type: 'created',
        title: 'Case Created',
        description: 'Initial case created from document analysis',
        date: new Date('2024-01-15'),
        status: 'completed'
      },
      {
        id: 't2',
        type: 'analysis',
        title: 'AI Analysis Completed',
        description: 'Detected 3 critical contradictions with 95% confidence',
        date: new Date('2024-01-16'),
        status: 'completed'
      },
      {
        id: 't3',
        type: 'response',
        title: 'Legal Response Generated',
        description: 'Evidence-based response created using Authority Challenge Template',
        date: new Date('2024-01-18'),
        status: 'completed'
      },
      {
        id: 't4',
        type: 'contact',
        title: 'Response Sent',
        description: 'Formal response submitted to Oslo Municipality Legal Department',
        date: new Date('2024-01-20'),
        status: 'in_progress'
      }
    ],
    notes: 'Strong case with clear contradictions. Authority hierarchy properly challenged. Expecting positive outcome based on previous similar cases.'
  },
  {
    id: '2',
    title: 'Authority Hierarchy Verification',
    description: 'Challenging decision made by unauthorized personnel outside their jurisdiction.',
    status: 'resolved',
    priority: 'medium',
    createdAt: new Date('2023-12-10'),
    updatedAt: new Date('2024-01-05'),
    institution: 'Norwegian Tax Administration',
    institutionType: 'government',
    analysisResults: ['analysis_2'],
    responses: ['response_2'],
    documents: ['doc_3'],
    tags: ['authority', 'jurisdiction', 'tax'],
    outcome: {
      result: 'successful',
      description: 'Decision was reversed after proving lack of authority. Tax penalty removed.',
      achievedGoals: ['Penalty removal', 'Authority acknowledgement', 'Process correction'],
      lessonsLearned: ['Authority verification crucial', 'Documentation importance', 'Timely response benefits'],
      finalSuccessRate: 92,
      completedAt: new Date('2024-01-05')
    },
    timeline: [
      {
        id: 't5',
        type: 'created',
        title: 'Case Initiated',
        description: 'Authority challenge case started',
        date: new Date('2023-12-10'),
        status: 'completed'
      },
      {
        id: 't6',
        type: 'outcome',
        title: 'Case Resolved Successfully',
        description: 'Authority verified lack of jurisdiction, decision reversed',
        date: new Date('2024-01-05'),
        status: 'completed'
      }
    ],
    notes: 'Excellent outcome. Authority verification approach worked perfectly. Can be used as precedent for similar cases.'
  },
  {
    id: '3',
    title: 'Healthcare Privacy Violation',
    description: 'Institutional request for medical records without proper legal basis.',
    status: 'pending',
    priority: 'urgent',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
    dueDate: new Date('2024-02-01'),
    institution: 'Regional Health Authority',
    institutionType: 'healthcare',
    analysisResults: ['analysis_3'],
    responses: [],
    documents: ['doc_4'],
    tags: ['privacy', 'healthcare', 'gdpr'],
    timeline: [
      {
        id: 't7',
        type: 'created',
        title: 'Urgent Case Created',
        description: 'Privacy violation detected in healthcare request',
        date: new Date('2024-01-22'),
        status: 'completed'
      },
      {
        id: 't8',
        type: 'analysis',
        title: 'Privacy Analysis Scheduled',
        description: 'GDPR compliance analysis in progress',
        date: new Date('2024-01-23'),
        status: 'scheduled'
      }
    ],
    notes: 'Time-sensitive case. GDPR implications significant. Need immediate response.'
  }
];

class CasesService {
  async getCases(filters?: CaseFilters): Promise<Case[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredCases = [...mockCases];
    
    if (filters) {
      if (filters.status?.length) {
        filteredCases = filteredCases.filter(case_ => filters.status!.includes(case_.status));
      }
      
      if (filters.priority?.length) {
        filteredCases = filteredCases.filter(case_ => filters.priority!.includes(case_.priority));
      }
      
      if (filters.institutionType?.length) {
        filteredCases = filteredCases.filter(case_ => filters.institutionType!.includes(case_.institutionType));
      }
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredCases = filteredCases.filter(case_ => 
          case_.title.toLowerCase().includes(query) ||
          case_.description.toLowerCase().includes(query) ||
          case_.institution.toLowerCase().includes(query)
        );
      }
      
      if (filters.tags?.length) {
        filteredCases = filteredCases.filter(case_ => 
          filters.tags!.some(tag => case_.tags.includes(tag))
        );
      }
    }
    
    return filteredCases.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  
  async getCaseById(id: string): Promise<Case | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCases.find(case_ => case_.id === id) || null;
  }
  
  async createCase(request: CreateCaseRequest): Promise<Case> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCase: Case = {
      id: `case_${Date.now()}`,
      title: request.title,
      description: request.description,
      status: 'active',
      priority: request.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: request.dueDate,
      institution: request.institution,
      institutionType: request.institutionType,
      analysisResults: request.analysisId ? [request.analysisId] : [],
      responses: request.responseId ? [request.responseId] : [],
      documents: [],
      tags: request.tags,
      contactInfo: request.contactInfo,
      timeline: [
        {
          id: `t_${Date.now()}`,
          type: 'created',
          title: 'Case Created',
          description: 'New case created and assigned',
          date: new Date(),
          status: 'completed'
        }
      ],
      notes: ''
    };
    
    mockCases.unshift(newCase);
    return newCase;
  }
  
  async updateCase(id: string, updates: Partial<Case>): Promise<Case> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockCases.findIndex(case_ => case_.id === id);
    if (index === -1) {
      throw new Error('Case not found');
    }
    
    mockCases[index] = {
      ...mockCases[index],
      ...updates,
      updatedAt: new Date()
    };
    
    return mockCases[index];
  }
  
  async getCaseStats(): Promise<CaseStats> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const totalCases = mockCases.length;
    const activeCases = mockCases.filter(c => c.status === 'active').length;
    const resolvedCases = mockCases.filter(c => c.status === 'resolved').length;
    const successfulCases = mockCases.filter(c => c.outcome?.result === 'successful').length;
    
    const institutionBreakdown = mockCases.reduce((acc, case_) => {
      acc[case_.institutionType] = (acc[case_.institutionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalCases,
      activeCases,
      resolvedCases,
      successRate: resolvedCases > 0 ? (successfulCases / resolvedCases) * 100 : 0,
      averageResolutionTime: 21, // Mock data
      institutionBreakdown,
      monthlyStats: [
        { month: 'January', year: 2024, casesCreated: 2, casesResolved: 1, successRate: 100 },
        { month: 'December', year: 2023, casesCreated: 1, casesResolved: 1, successRate: 92 }
      ]
    };
  }
  
  async addTimelineEvent(caseId: string, event: Omit<CaseTimelineEvent, 'id' | 'date'>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const case_ = mockCases.find(c => c.id === caseId);
    if (!case_) {
      throw new Error('Case not found');
    }
    
    const newEvent: CaseTimelineEvent = {
      ...event,
      id: `t_${Date.now()}`,
      date: new Date()
    };
    
    case_.timeline.push(newEvent);
    case_.updatedAt = new Date();
  }
}

export const casesService = new CasesService();
export default casesService;
