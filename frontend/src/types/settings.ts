export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'premium' | 'admin';
  tier: 'free' | 'professional' | 'enterprise';
  joinedAt: Date;
  lastActive: Date;
  organization?: string;
  title?: string;
  phone?: string;
  location?: string;
  timezone: string;
  language: string;
}

export interface UserPreferences {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  analysis: AnalysisSettings;
  display: DisplaySettings;
  legal: LegalSettings;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  analysisComplete: boolean;
  caseUpdates: boolean;
  systemAnnouncements: boolean;
  securityAlerts: boolean;
  weeklyReports: boolean;
  reminderFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'organization' | 'private';
  dataRetention: '1year' | '3years' | '5years' | 'indefinite';
  analyticsTracking: boolean;
  thirdPartySharing: boolean;
  documentEncryption: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number; // minutes
}

export interface AnalysisSettings {
  defaultAnalysisModules: string[];
  confidenceThreshold: number; // 0-100
  autoGenerateResponses: boolean;
  saveAnalysisHistory: boolean;
  preferredResponseStrategy: 'conservative' | 'balanced' | 'aggressive';
  includePrecedents: boolean;
  enableMLLearning: boolean;
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  animationsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorblindSupport: boolean;
  highContrastMode: boolean;
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  currency: 'NOK' | 'SEK' | 'DKK' | 'EUR' | 'USD';
}

export interface LegalSettings {
  jurisdiction: 'norway' | 'sweden' | 'denmark' | 'international';
  preferredLanguage: 'no' | 'sv' | 'da' | 'en';
  institutionFilters: string[];
  defaultTemplates: string[];
  complianceMode: 'standard' | 'strict' | 'minimal';
  auditLogging: boolean;
  digitalSignature: boolean;
}

export interface APIKeyManagement {
  keys: APIKey[];
  allowedOrigins: string[];
  rateLimits: RateLimit[];
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface RateLimit {
  endpoint: string;
  limit: number;
  window: string; // '1h', '1d', etc.
}

export interface SubscriptionDetails {
  tier: 'free' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  usage: UsageStats;
  billing: BillingInfo;
}

export interface UsageStats {
  analysesUsed: number;
  analysesLimit: number;
  documentsProcessed: number;
  storageUsed: number; // MB
  storageLimit: number; // MB
  apiCallsUsed: number;
  apiCallsLimit: number;
}

export interface BillingInfo {
  paymentMethod?: PaymentMethod;
  billingAddress?: Address;
  invoiceEmail?: string;
  taxId?: string;
  currency: string;
  nextPaymentAmount?: number;
  nextPaymentDate?: Date;
}

export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'invoice';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface SecuritySettings {
  passwordLastChanged: Date;
  loginSessions: LoginSession[];
  securityQuestions: SecurityQuestion[];
  backupCodes: string[];
  auditLog: AuditLogEntry[];
}

export interface LoginSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: Date;
  isCurrent: boolean;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  isAnswered: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure';
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  organization?: string;
  title?: string;
  phone?: string;
  location?: string;
  timezone?: string;
  language?: string;
}

export interface UpdatePreferencesRequest {
  notifications?: Partial<NotificationSettings>;
  privacy?: Partial<PrivacySettings>;
  analysis?: Partial<AnalysisSettings>;
  display?: Partial<DisplaySettings>;
  legal?: Partial<LegalSettings>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
  feedback?: string;
}
