import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Case, CaseStats, CaseFilters, CreateCaseRequest } from '../types/cases';
import { casesService } from '../services/cases';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<CaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [filters, setFilters] = useState<CaseFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCases();
    loadStats();
  }, [filters]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await casesService.getCases({ ...filters, searchQuery });
      setCases(data);
    } catch (error) {
      toast.error('Failed to load cases');
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await casesService.getCaseStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, searchQuery });
  };

  const getStatusIcon = (status: Case['status']) => {
    switch (status) {
      case 'active':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'closed':
        return <XMarkIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: Case['priority']) => {
    const badges = {
      low: 'badge-secondary',
      medium: 'badge-primary',
      high: 'badge-warning',
      urgent: 'badge-danger'
    };
    return badges[priority];
  };

  const getStatusBadge = (status: Case['status']) => {
    const badges = {
      active: 'badge-primary',
      pending: 'badge-warning',
      resolved: 'badge-success',
      closed: 'badge-secondary'
    };
    return badges[status];
  };

  if (loading && cases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Legal Cases
          </h1>
          <p className="mt-2 text-base text-gray-600 max-w-2xl">
            Track your legal challenges and monitor success outcomes with institutional authorities.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center space-x-2"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Case</span>
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card p-6 text-center success-glow transform hover:scale-105 transition-all duration-500"
          >
            <div className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">
              {Math.round(stats.successRate)}%
            </div>
            <div className="text-sm font-bold text-gray-800 mb-1">Success Rate</div>
            <div className="text-xs text-gray-600">Legal challenges won</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="premium-card p-6 text-center"
          >
            <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
              {stats.activeCases}
            </div>
            <div className="text-sm font-medium text-gray-700">Active Cases</div>
            <div className="text-xs text-gray-500">In progress</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-6 text-center"
          >
            <div className="text-3xl lg:text-4xl font-bold text-gray-600 mb-2">
              {stats.resolvedCases}
            </div>
            <div className="text-sm font-medium text-gray-700">Resolved</div>
            <div className="text-xs text-gray-500">Completed cases</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="premium-card p-6 text-center"
          >
            <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">
              {stats.averageResolutionTime}
            </div>
            <div className="text-sm font-medium text-gray-700">Avg Days</div>
            <div className="text-xs text-gray-500">To resolution</div>
          </motion.div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card-elevated">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex gap-4 items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search cases by title, institution, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
              >
                <div>
                  <label className="label">Status</label>
                  <select 
                    className="input"
                    value={filters.status?.[0] || ''}
                    onChange={(e) => setFilters({...filters, status: e.target.value ? [e.target.value as Case['status']] : undefined})}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select 
                    className="input"
                    value={filters.priority?.[0] || ''}
                    onChange={(e) => setFilters({...filters, priority: e.target.value ? [e.target.value as Case['priority']] : undefined})}
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="label">Institution Type</label>
                  <select 
                    className="input"
                    value={filters.institutionType?.[0] || ''}
                    onChange={(e) => setFilters({...filters, institutionType: e.target.value ? [e.target.value as Case['institutionType']] : undefined})}
                  >
                    <option value="">All Types</option>
                    <option value="government">Government</option>
                    <option value="corporate">Corporate</option>
                    <option value="legal">Legal</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="financial">Financial</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {cases.length === 0 ? (
          <div className="card text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Cases Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || Object.keys(filters).length > 0 
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first legal case to track institutional challenges'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Case
            </button>
          </div>
        ) : (
          cases.map((case_, index) => (
            <motion.div
              key={case_.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="premium-card p-6 cursor-pointer hover:shadow-2xl transition-all duration-300"
              onClick={() => setSelectedCase(case_)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(case_.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{case_.title}</h3>
                    <span className={`badge ${getStatusBadge(case_.status)}`}>
                      {case_.status.toUpperCase()}
                    </span>
                    <span className={`badge ${getPriorityBadge(case_.priority)}`}>
                      {case_.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{case_.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <DocumentTextIcon className="h-4 w-4" />
                      <span>{case_.institution}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>Updated {case_.updatedAt.toLocaleDateString()}</span>
                    </div>
                    {case_.outcome && (
                      <div className="flex items-center space-x-1">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                          {case_.outcome.finalSuccessRate}% Success
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-3">
                    {case_.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  {case_.dueDate && (
                    <div className="text-xs text-gray-500 text-right">
                      Due: {case_.dueDate.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Case Modal */}
      <CreateCaseModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadCases();
          loadStats();
        }}
      />

      {/* Case Detail Modal */}
      <CaseDetailModal 
        case={selectedCase}
        onClose={() => setSelectedCase(null)}
        onUpdate={loadCases}
      />
    </div>
  );
};

// Create Case Modal Component
interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCaseModal: React.FC<CreateCaseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateCaseRequest>({
    title: '',
    description: '',
    institution: '',
    institutionType: 'government',
    priority: 'medium',
    tags: [],
    dueDate: undefined
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await casesService.createCase(formData);
      toast.success('Case created successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create case');
      console.error('Error creating case:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-content premium-card max-w-2xl w-full"
      >
        <div className="card-header flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Create New Case</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="card-body space-y-6">
          <div>
            <label className="label">Case Title</label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Brief description of the legal challenge"
            />
          </div>
          
          <div>
            <label className="label">Description</label>
            <textarea
              required
              rows={4}
              className="input w-full"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed description of the issue and desired outcome"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Institution</label>
              <input
                type="text"
                required
                className="input w-full"
                value={formData.institution}
                onChange={(e) => setFormData({...formData, institution: e.target.value})}
                placeholder="Organization or agency name"
              />
            </div>
            
            <div>
              <label className="label">Institution Type</label>
              <select
                required
                className="input w-full"
                value={formData.institutionType}
                onChange={(e) => setFormData({...formData, institutionType: e.target.value as Case['institutionType']})}
              >
                <option value="government">Government</option>
                <option value="corporate">Corporate</option>
                <option value="legal">Legal</option>
                <option value="healthcare">Healthcare</option>
                <option value="financial">Financial</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select
                className="input w-full"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as Case['priority']})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label className="label">Due Date (Optional)</label>
              <input
                type="date"
                className="input w-full"
                value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value ? new Date(e.target.value) : undefined})}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading && <LoadingSpinner size="sm" />}
              <span>Create Case</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Case Detail Modal Component
interface CaseDetailModalProps {
  case: Case | null;
  onClose: () => void;
  onUpdate: () => void;
}

const CaseDetailModal: React.FC<CaseDetailModalProps> = ({ case: selectedCase, onClose }) => {
  if (!selectedCase) return null;

  return (
    <div className="modal-overlay flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-content premium-card max-w-4xl w-full"
      >
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{selectedCase.title}</h2>
            <p className="text-sm text-gray-600">{selectedCase.institution}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="card-body space-y-6">
          {/* Case Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Status</div>
              <div className="mt-1 flex items-center space-x-2">
                {selectedCase.status === 'resolved' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <ClockIcon className="h-5 w-5 text-blue-500" />
                )}
                <span className="font-medium capitalize">{selectedCase.status}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Priority</div>
              <div className="mt-1">
                <span className={`badge ${selectedCase.priority === 'urgent' ? 'badge-danger' : selectedCase.priority === 'high' ? 'badge-warning' : 'badge-primary'}`}>
                  {selectedCase.priority.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Created</div>
              <div className="mt-1 font-medium">{selectedCase.createdAt.toLocaleDateString()}</div>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700">{selectedCase.description}</p>
          </div>
          
          {/* Timeline */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              {selectedCase.timeline.map((event) => (
                <div key={event.id} className="flex items-start space-x-3">
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    event.status === 'completed' ? 'bg-green-500' : 
                    event.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <span className="text-xs text-gray-500">{event.date.toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Outcome */}
          {selectedCase.outcome && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-lg font-medium text-green-900 mb-2">Case Outcome</h3>
              <p className="text-green-800 mb-3">{selectedCase.outcome.description}</p>
              <div className="text-sm text-green-700">
                <strong>Success Rate:</strong> {selectedCase.outcome.finalSuccessRate}%
              </div>
              <div className="mt-2">
                <strong className="text-sm text-green-700">Achieved Goals:</strong>
                <ul className="list-disc list-inside text-sm text-green-600 mt-1">
                  {selectedCase.outcome.achievedGoals.map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Tags */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {selectedCase.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          {/* Notes */}
          {selectedCase.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{selectedCase.notes}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CasesPage;