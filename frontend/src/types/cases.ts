export interface Case {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  institution: string;
  institutionType: 'government' | 'corporate' | 'legal' | 'healthcare' | 'financial' | 'other';
  analysisResults: string[]; // Array of analysis IDs
  responses: string[]; // Array of response IDs
  documents: string[]; // Array of document IDs
  outcome?: CaseOutcome;
  successRate?: number;
  tags: string[];
  assignedTo?: string;
  contactInfo?: ContactInfo;
  timeline: CaseTimelineEvent[];
  notes: string;
}

export interface CaseOutcome {
  result: 'successful' | 'partial' | 'unsuccessful' | 'ongoing';
  description: string;
  achievedGoals: string[];
  lessonsLearned: string[];
  finalSuccessRate: number;
  completedAt: Date;
}

export interface ContactInfo {
  primaryContact: string;
  email?: string;
  phone?: string;
  address?: string;
  preferredContactMethod: 'email' | 'phone' | 'mail';
}

export interface CaseTimelineEvent {
  id: string;
  type: 'created' | 'analysis' | 'response' | 'contact' | 'update' | 'outcome';
  title: string;
  description: string;
  date: Date;
  status: 'completed' | 'in_progress' | 'scheduled';
  attachments?: string[];
}

export interface CaseStats {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  successRate: number;
  averageResolutionTime: number; // in days
  institutionBreakdown: Record<string, number>;
  monthlyStats: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  year: number;
  casesCreated: number;
  casesResolved: number;
  successRate: number;
}

export interface CaseFilters {
  status?: Case['status'][];
  priority?: Case['priority'][];
  institution?: string;
  institutionType?: Case['institutionType'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  searchQuery?: string;
}

export interface CreateCaseRequest {
  title: string;
  description: string;
  institution: string;
  institutionType: Case['institutionType'];
  priority: Case['priority'];
  dueDate?: Date;
  tags: string[];
  contactInfo?: ContactInfo;
  analysisId?: string; // If creating from analysis
  responseId?: string; // If creating from response
}
