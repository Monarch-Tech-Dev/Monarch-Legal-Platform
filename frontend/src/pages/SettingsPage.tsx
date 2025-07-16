import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  CogIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  KeyIcon,
  BellIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import {
  UserProfile,
  UserPreferences,
  SubscriptionDetails,
  type SecuritySettings as SecuritySettingsType,
  APIKeyManagement,
  UpdateProfileRequest,
  ChangePasswordRequest
} from '../types/settings';
import { settingsService } from '../services/settings';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'preferences' | 'security' | 'subscription' | 'api' | 'data';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [security, setSecurity] = useState<SecuritySettingsType | null>(null);
  const [apiKeys, setApiKeys] = useState<APIKeyManagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [profileData, preferencesData, subscriptionData, securityData, apiData] = await Promise.all([
        settingsService.getUserProfile(),
        settingsService.getUserPreferences(),
        settingsService.getSubscriptionDetails(),
        settingsService.getSecuritySettings(),
        settingsService.getAPIKeys()
      ]);
      
      setProfile(profileData);
      setPreferences(preferencesData);
      setSubscription(subscriptionData);
      setSecurity(securityData);
      setApiKeys(apiData);
    } catch (error) {
      toast.error('Failed to load settings');
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, name: 'Profile', icon: UserIcon },
    { id: 'preferences' as SettingsTab, name: 'Preferences', icon: CogIcon },
    { id: 'security' as SettingsTab, name: 'Security', icon: ShieldCheckIcon },
    { id: 'subscription' as SettingsTab, name: 'Subscription', icon: CreditCardIcon },
    { id: 'api' as SettingsTab, name: 'API Keys', icon: KeyIcon },
    { id: 'data' as SettingsTab, name: 'Data & Privacy', icon: EyeSlashIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="mt-2 text-base text-gray-600 max-w-2xl">
          Manage your account preferences, security settings, and subscription details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && profile && (
                <ProfileSettings profile={profile} setProfile={setProfile} saving={saving} setSaving={setSaving} />
              )}
              {activeTab === 'preferences' && preferences && (
                <PreferencesSettings preferences={preferences} setPreferences={setPreferences} saving={saving} setSaving={setSaving} />
              )}
              {activeTab === 'security' && security && (
                <SecuritySettingsComponent security={security} setSecurity={setSecurity} />
              )}
              {activeTab === 'subscription' && subscription && (
                <SubscriptionSettings subscription={subscription} setSubscription={setSubscription} />
              )}
              {activeTab === 'api' && apiKeys && (
                <APISettings apiKeys={apiKeys} setApiKeys={setApiKeys} />
              )}
              {activeTab === 'data' && profile && (
                <DataPrivacySettings profile={profile} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component
interface ProfileSettingsProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, setProfile, saving, setSaving }) => {
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: profile.name,
    email: profile.email,
    organization: profile.organization || '',
    title: profile.title || '',
    phone: profile.phone || '',
    location: profile.location || '',
    timezone: profile.timezone,
    language: profile.language
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedProfile = await settingsService.updateUserProfile(formData);
      setProfile(updatedProfile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-elevated">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          <p className="text-sm text-gray-600">Update your personal information and contact details.</p>
        </div>
        
        <div className="card-body space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
              <p className="text-sm text-gray-600">{profile.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`badge ${profile.tier === 'free' ? 'badge-secondary' : profile.tier === 'professional' ? 'badge-primary' : 'badge-success'}`}>
                  {profile.tier.toUpperCase()} TIER
                </span>
                <div className="success-rate-badge text-xs">89% Success</div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input w-full"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input w-full"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div>
              <label className="label">Organization</label>
              <input
                type="text"
                className="input w-full"
                value={formData.organization || ''}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Company or organization name"
              />
            </div>
            
            <div>
              <label className="label">Job Title</label>
              <input
                type="text"
                className="input w-full"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Your role or position"
              />
            </div>
            
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                className="input w-full"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+47 123 45 678"
              />
            </div>
            
            <div>
              <label className="label">Location</label>
              <input
                type="text"
                className="input w-full"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
            
            <div>
              <label className="label">Timezone</label>
              <select
                className="input w-full"
                value={formData.timezone || ''}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                <option value="Europe/Oslo">Europe/Oslo (GMT+1)</option>
                <option value="Europe/Stockholm">Europe/Stockholm (GMT+1)</option>
                <option value="Europe/Copenhagen">Europe/Copenhagen (GMT+1)</option>
                <option value="UTC">UTC (GMT+0)</option>
              </select>
            </div>
            
            <div>
              <label className="label">Language</label>
              <select
                className="input w-full"
                value={formData.language || ''}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="no">Norsk (Norwegian)</option>
                <option value="en">English</option>
                <option value="sv">Svenska (Swedish)</option>
                <option value="da">Dansk (Danish)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="btn-primary flex items-center space-x-2"
              disabled={saving}
            >
              {saving && <LoadingSpinner size="sm" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Preferences Settings Component
interface PreferencesSettingsProps {
  preferences: UserPreferences;
  setPreferences: (preferences: UserPreferences) => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;
}

const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({ preferences, setPreferences, saving, setSaving }) => {
  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedPreferences = await settingsService.updateUserPreferences(preferences);
      setPreferences(updatedPreferences);
      toast.success('Preferences updated successfully');
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="card-elevated">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
        </div>
        
        <div className="card-body space-y-4">
          {Object.entries(preferences.notifications).map(([key, value]) => {
            if (key === 'reminderFrequency') {
              return (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Reminder Frequency</label>
                    <p className="text-sm text-gray-600">How often to send case reminders</p>
                  </div>
                  <select
                    className="input"
                    value={value as string}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, reminderFrequency: e.target.value as any }
                    })}
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              );
            }
            
            return (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                </div>
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    notifications: { ...preferences.notifications, [key]: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Analysis Settings */}
      <div className="card-elevated">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">Analysis Settings</h3>
          </div>
        </div>
        
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Confidence Threshold</label>
              <p className="text-sm text-gray-600">Minimum confidence level for analysis results</p>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={preferences.analysis.confidenceThreshold}
              onChange={(e) => setPreferences({
                ...preferences,
                analysis: { ...preferences.analysis, confidenceThreshold: parseInt(e.target.value) }
              })}
              className="w-32"
            />
            <span className="text-sm font-medium text-gray-900">{preferences.analysis.confidenceThreshold}%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Response Strategy</label>
              <p className="text-sm text-gray-600">Default approach for legal responses</p>
            </div>
            <select
              className="input"
              value={preferences.analysis.preferredResponseStrategy}
              onChange={(e) => setPreferences({
                ...preferences,
                analysis: { ...preferences.analysis, preferredResponseStrategy: e.target.value as any }
              })}
            >
              <option value="conservative">Conservative</option>
              <option value="balanced">Balanced</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="btn-primary flex items-center space-x-2"
          disabled={saving}
        >
          {saving && <LoadingSpinner size="sm" />}
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  );
};

// Security Settings Component
interface SecuritySettingsProps {
  security: SecuritySettingsType;
  setSecurity: (security: SecuritySettingsType) => void;
}

const SecuritySettingsComponent: React.FC<SecuritySettingsProps> = ({ security, setSecurity }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChangePassword = async () => {
    try {
      await settingsService.changePassword(passwordForm);
      toast.success('Password changed successfully');
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await settingsService.revokeSession(sessionId);
      setSecurity({
        ...security,
        loginSessions: security.loginSessions.filter(s => s.id !== sessionId)
      });
      toast.success('Session revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  return (
    <div className="space-y-6">
      {/* Password */}
      <div className="card-elevated">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Password & Authentication</h3>
        </div>
        
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Password</label>
              <p className="text-sm text-gray-600">
                Last changed: {security.passwordLastChanged.toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="btn-secondary"
            >
              Change Password
            </button>
          </div>

          {showChangePassword && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-gray-200"
            >
              <input
                type="password"
                placeholder="Current password"
                className="input w-full"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
              <input
                type="password"
                placeholder="New password"
                className="input w-full"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="input w-full"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
              <div className="flex space-x-3">
                <button onClick={handleChangePassword} className="btn-primary">
                  Update Password
                </button>
                <button onClick={() => setShowChangePassword(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="card-elevated">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
          <p className="text-sm text-gray-600">Manage your active login sessions</p>
        </div>
        
        <div className="card-body space-y-4">
          {security.loginSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                {session.device.includes('iPhone') || session.device.includes('Mobile') ? (
                  <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400" />
                ) : (
                  <ComputerDesktopIcon className="h-6 w-6 text-gray-400" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{session.device}</h4>
                    {session.isCurrent && (
                      <span className="badge badge-success text-xs">Current</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {session.browser} • {session.location} • {session.lastActive.toLocaleDateString()}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Subscription Settings Component
interface SubscriptionSettingsProps {
  subscription: SubscriptionDetails;
  setSubscription: (subscription: SubscriptionDetails) => void;
}

const SubscriptionSettings: React.FC<SubscriptionSettingsProps> = ({ subscription, setSubscription }) => {
  const handleUpgrade = async (tier: 'professional' | 'enterprise') => {
    try {
      const updated = await settingsService.upgradeSubscription(tier);
      setSubscription(updated);
      toast.success(`Upgraded to ${tier} plan!`);
    } catch (error) {
      toast.error('Failed to upgrade subscription');
    }
  };

  const usagePercentage = (subscription.usage.analysesUsed / subscription.usage.analysesLimit) * 100;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="card-elevated">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
            <span className={`badge ${subscription.tier === 'free' ? 'badge-secondary' : subscription.tier === 'professional' ? 'badge-primary' : 'badge-success'}`}>
              {subscription.tier.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="card-body space-y-6">
          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Analyses Used</div>
              <div className="text-2xl font-bold text-gray-900">
                {subscription.usage.analysesUsed} / {subscription.usage.analysesLimit}
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Storage Used</div>
              <div className="text-2xl font-bold text-gray-900">
                {subscription.usage.storageUsed} MB / {subscription.usage.storageLimit} MB
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(subscription.usage.storageUsed / subscription.usage.storageLimit) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">API Calls</div>
              <div className="text-2xl font-bold text-gray-900">
                {subscription.usage.apiCallsUsed} / {subscription.usage.apiCallsLimit}
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(subscription.usage.apiCallsUsed / subscription.usage.apiCallsLimit) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {subscription.tier === 'free' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Upgrade for More Features</h4>
              <p className="text-sm text-blue-800 mb-4">
                Get unlimited analyses, priority support, and advanced features with a premium plan.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleUpgrade('professional')}
                  className="btn-primary"
                >
                  Upgrade to Professional
                </button>
                <button
                  onClick={() => handleUpgrade('enterprise')}
                  className="btn-secondary"
                >
                  Enterprise Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// API Settings Component
interface APISettingsProps {
  apiKeys: APIKeyManagement;
  setApiKeys: (apiKeys: APIKeyManagement) => void;
}

const APISettings: React.FC<APISettingsProps> = ({ apiKeys, setApiKeys }) => {
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const handleCreateKey = async () => {
    try {
      const newKey = await settingsService.createAPIKey(newKeyName, ['analysis:read', 'analysis:create']);
      setApiKeys({
        ...apiKeys,
        keys: [...apiKeys.keys, newKey]
      });
      setShowCreateKey(false);
      setNewKeyName('');
      toast.success('API key created successfully');
    } catch (error) {
      toast.error('Failed to create API key');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await settingsService.revokeAPIKey(keyId);
      setApiKeys({
        ...apiKeys,
        keys: apiKeys.keys.map(key => key.id === keyId ? { ...key, isActive: false } : key)
      });
      toast.success('API key revoked');
    } catch (error) {
      toast.error('Failed to revoke API key');
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-elevated">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
            <button
              onClick={() => setShowCreateKey(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Key</span>
            </button>
          </div>
        </div>
        
        <div className="card-body space-y-4">
          {apiKeys.keys.map((key) => (
            <div key={key.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{key.name}</h4>
                  <span className={`badge ${key.isActive ? 'badge-success' : 'badge-secondary'}`}>
                    {key.isActive ? 'Active' : 'Revoked'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-mono">{key.key}</p>
                <p className="text-xs text-gray-500">
                  Created: {key.createdAt.toLocaleDateString()}
                  {key.lastUsed && ` • Last used: ${key.lastUsed.toLocaleDateString()}`}
                </p>
              </div>
              {key.isActive && (
                <button
                  onClick={() => handleRevokeKey(key.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}

          {showCreateKey && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border border-gray-200 rounded-lg space-y-4"
            >
              <input
                type="text"
                placeholder="API key name"
                className="input w-full"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <div className="flex space-x-3">
                <button onClick={handleCreateKey} className="btn-primary">
                  Create Key
                </button>
                <button onClick={() => setShowCreateKey(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Data Privacy Settings Component
interface DataPrivacySettingsProps {
  profile: UserProfile;
}

const DataPrivacySettings: React.FC<DataPrivacySettingsProps> = ({ profile }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleExportData = async () => {
    try {
      const data = await settingsService.exportData();
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monarch-legal-data-${profile.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await settingsService.deleteAccount({
        password: deletePassword,
        reason: 'User requested deletion'
      });
      toast.success('Account deletion requested');
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <div className="card-elevated">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Data Export</h3>
          <p className="text-sm text-gray-600">Download a copy of your personal data</p>
        </div>
        
        <div className="card-body">
          <button
            onClick={handleExportData}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export My Data</span>
          </button>
        </div>
      </div>

      {/* Delete Account */}
      <div className="card-elevated border-red-200">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-medium text-red-900">Delete Account</h3>
          </div>
          <p className="text-sm text-red-600">Permanently delete your account and all associated data</p>
        </div>
        
        <div className="card-body">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger flex items-center space-x-2"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete Account</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  This action cannot be undone. All your data, cases, and analyses will be permanently deleted.
                </p>
              </div>
              <input
                type="password"
                placeholder="Enter your password to confirm"
                className="input w-full"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteAccount}
                  className="btn-danger"
                  disabled={!deletePassword}
                >
                  Confirm Deletion
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;