import {
  UserProfile,
  UserPreferences,
  SubscriptionDetails,
  SecuritySettings,
  APIKeyManagement,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  APIKey
} from '../types/settings';

// Mock data for demonstration - in production this would connect to backend API
const mockUserProfile: UserProfile = {
  id: 'user_001',
  name: 'Test User',
  email: 'demo@example.com',
  role: 'user',
  tier: 'free',
  joinedAt: new Date('2024-01-01'),
  lastActive: new Date(),
  organization: 'Legal Professional',
  title: 'Legal Advisor',
  phone: '+47 123 45 678',
  location: 'Oslo, Norway',
  timezone: 'Europe/Oslo',
  language: 'no'
};

const mockUserPreferences: UserPreferences = {
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    analysisComplete: true,
    caseUpdates: true,
    systemAnnouncements: false,
    securityAlerts: true,
    weeklyReports: true,
    reminderFrequency: 'daily'
  },
  privacy: {
    profileVisibility: 'organization',
    dataRetention: '3years',
    analyticsTracking: true,
    thirdPartySharing: false,
    documentEncryption: true,
    twoFactorAuth: false,
    sessionTimeout: 30
  },
  analysis: {
    defaultAnalysisModules: ['contradiction', 'authority', 'pattern'],
    confidenceThreshold: 75,
    autoGenerateResponses: false,
    saveAnalysisHistory: true,
    preferredResponseStrategy: 'balanced',
    includePrecedents: true,
    enableMLLearning: true
  },
  display: {
    theme: 'light',
    compactMode: false,
    animationsEnabled: true,
    fontSize: 'medium',
    colorblindSupport: false,
    highContrastMode: false,
    dateFormat: 'dd/mm/yyyy',
    currency: 'NOK'
  },
  legal: {
    jurisdiction: 'norway',
    preferredLanguage: 'no',
    institutionFilters: ['government', 'healthcare'],
    defaultTemplates: ['authority_challenge', 'contradiction_challenge'],
    complianceMode: 'standard',
    auditLogging: true,
    digitalSignature: false
  }
};

const mockSubscription: SubscriptionDetails = {
  tier: 'free',
  status: 'active',
  currentPeriodStart: new Date('2024-01-01'),
  currentPeriodEnd: new Date('2024-02-01'),
  cancelAtPeriodEnd: false,
  usage: {
    analysesUsed: 3,
    analysesLimit: 10,
    documentsProcessed: 15,
    storageUsed: 125,
    storageLimit: 1000,
    apiCallsUsed: 45,
    apiCallsLimit: 1000
  },
  billing: {
    currency: 'NOK',
    invoiceEmail: 'billing@monarchlegal.no'
  }
};

const mockSecurity: SecuritySettings = {
  passwordLastChanged: new Date('2024-01-01'),
  loginSessions: [
    {
      id: 'session_1',
      device: 'MacBook Pro',
      browser: 'Chrome 120',
      location: 'Oslo, Norway',
      ipAddress: '192.168.1.100',
      lastActive: new Date(),
      isCurrent: true
    },
    {
      id: 'session_2',
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      location: 'Oslo, Norway',
      ipAddress: '192.168.1.101',
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isCurrent: false
    }
  ],
  securityQuestions: [
    { id: 'q1', question: 'What was your first pet\'s name?', isAnswered: true },
    { id: 'q2', question: 'What city were you born in?', isAnswered: true },
    { id: 'q3', question: 'What was your mother\'s maiden name?', isAnswered: false }
  ],
  backupCodes: [
    'MNRCH-12345',
    'MNRCH-67890',
    'MNRCH-ABCDE'
  ],
  auditLog: [
    {
      id: 'audit_1',
      timestamp: new Date(),
      action: 'LOGIN',
      resource: 'USER_ACCOUNT',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0',
      result: 'success'
    },
    {
      id: 'audit_2',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      action: 'ANALYSIS_CREATE',
      resource: 'DOCUMENT_ANALYSIS',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0',
      result: 'success'
    }
  ]
};

const mockAPIKeys: APIKeyManagement = {
  keys: [
    {
      id: 'key_1',
      name: 'Main API Key',
      key: 'mk_live_****************************abc123',
      permissions: ['analysis:read', 'analysis:create', 'cases:read'],
      createdAt: new Date('2024-01-01'),
      lastUsed: new Date(),
      isActive: true
    }
  ],
  allowedOrigins: ['https://monarchlegal.no', 'https://app.monarchlegal.no'],
  rateLimits: [
    { endpoint: '/api/analyze', limit: 100, window: '1h' },
    { endpoint: '/api/cases', limit: 1000, window: '1d' }
  ]
};

class SettingsService {
  async getUserProfile(): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...mockUserProfile };
  }

  async updateUserProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
    await new Promise(resolve => setTimeout(resolve, 500));
    Object.assign(mockUserProfile, updates);
    return { ...mockUserProfile };
  }

  async getUserPreferences(): Promise<UserPreferences> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { ...mockUserPreferences };
  }

  async updateUserPreferences(updates: UpdatePreferencesRequest): Promise<UserPreferences> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (updates.notifications) {
      Object.assign(mockUserPreferences.notifications, updates.notifications);
    }
    if (updates.privacy) {
      Object.assign(mockUserPreferences.privacy, updates.privacy);
    }
    if (updates.analysis) {
      Object.assign(mockUserPreferences.analysis, updates.analysis);
    }
    if (updates.display) {
      Object.assign(mockUserPreferences.display, updates.display);
    }
    if (updates.legal) {
      Object.assign(mockUserPreferences.legal, updates.legal);
    }
    
    return { ...mockUserPreferences };
  }

  async getSubscriptionDetails(): Promise<SubscriptionDetails> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...mockSubscription };
  }

  async upgradeSubscription(tier: 'professional' | 'enterprise'): Promise<SubscriptionDetails> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    mockSubscription.tier = tier;
    mockSubscription.status = 'active';
    
    // Update limits based on tier
    if (tier === 'professional') {
      mockSubscription.usage.analysesLimit = 100;
      mockSubscription.usage.storageLimit = 10000;
      mockSubscription.usage.apiCallsLimit = 10000;
    } else if (tier === 'enterprise') {
      mockSubscription.usage.analysesLimit = 1000;
      mockSubscription.usage.storageLimit = 100000;
      mockSubscription.usage.apiCallsLimit = 100000;
    }
    
    return { ...mockSubscription };
  }

  async cancelSubscription(): Promise<SubscriptionDetails> {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockSubscription.cancelAtPeriodEnd = true;
    return { ...mockSubscription };
  }

  async getSecuritySettings(): Promise<SecuritySettings> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { ...mockSecurity };
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (request.newPassword !== request.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (request.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    mockSecurity.passwordLastChanged = new Date();
  }

  async enable2FA(): Promise<{ qrCode: string; backupCodes: string[] }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    mockUserPreferences.privacy.twoFactorAuth = true;
    
    return {
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      backupCodes: mockSecurity.backupCodes
    };
  }

  async disable2FA(password: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    if (!password) {
      throw new Error('Password required to disable 2FA');
    }
    mockUserPreferences.privacy.twoFactorAuth = false;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockSecurity.loginSessions.findIndex(s => s.id === sessionId);
    if (index > -1) {
      mockSecurity.loginSessions.splice(index, 1);
    }
  }

  async getAPIKeys(): Promise<APIKeyManagement> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { ...mockAPIKeys };
  }

  async createAPIKey(name: string, permissions: string[]): Promise<APIKey> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newKey: APIKey = {
      id: `key_${Date.now()}`,
      name,
      key: `mk_live_${Math.random().toString(36).substr(2, 40)}`,
      permissions,
      createdAt: new Date(),
      isActive: true
    };
    
    mockAPIKeys.keys.push(newKey);
    return newKey;
  }

  async revokeAPIKey(keyId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const key = mockAPIKeys.keys.find(k => k.id === keyId);
    if (key) {
      key.isActive = false;
    }
  }

  async deleteAccount(request: DeleteAccountRequest): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!request.password) {
      throw new Error('Password required to delete account');
    }
    
    // In real implementation, this would permanently delete the account
    console.log('Account deletion requested:', request);
  }

  async exportData(): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const data = {
      profile: mockUserProfile,
      preferences: mockUserPreferences,
      subscription: mockSubscription,
      security: mockSecurity
    };
    
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }
}

export const settingsService = new SettingsService();
export default settingsService;
