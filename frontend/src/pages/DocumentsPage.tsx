import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  ShareIcon,
  TagIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import {
  Document,
  DocumentFolder,
  DocumentFilters,
  DocumentStats,
  UploadRequest,
  DocumentType,
  DocumentCategory,
  BulkOperation
} from '../types/documents';
import { documentsService } from '../services/documents';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'list' | 'folders';

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [, setFolders] = useState<DocumentFolder[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DocumentFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDocuments();
    loadFolders();
    loadStats();
  }, [filters]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsService.getDocuments({ ...filters, searchQuery });
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to load documents');
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const data = await documentsService.getFolders();
      setFolders(data);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await documentsService.getDocumentStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, searchQuery });
  };

  const handleDocumentSelect = (documentId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.size === documents.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(documents.map(doc => doc.id)));
    }
  };

  const handleBulkOperation = async (operation: BulkOperation) => {
    try {
      const result = await documentsService.bulkOperation(operation);
      if (result.success.length > 0) {
        toast.success(`${operation.operation} completed for ${result.success.length} documents`);
        loadDocuments();
        loadStats();
      }
      if (result.failed.length > 0) {
        toast.error(`Failed to ${operation.operation} ${result.failed.length} documents`);
      }
      setSelectedDocuments(new Set());
    } catch (error) {
      toast.error(`Failed to ${operation.operation} documents`);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await documentsService.deleteDocument(documentId);
      toast.success('Document deleted successfully');
      loadDocuments();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getFileIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return '📄';
      case 'docx':
      case 'doc':
        return '📝';
      case 'txt':
        return '📃';
      case 'jpg':
      case 'png':
      case 'tiff':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    const badges = {
      uploading: 'badge-warning',
      processing: 'badge-warning',
      ready: 'badge-primary',
      analyzed: 'badge-success',
      archived: 'badge-secondary',
      deleted: 'badge-danger',
      error: 'badge-danger'
    };
    return badges[status];
  };

  const getTypeBadge = (type: DocumentType) => {
    const badges = {
      legal_document: 'badge-primary',
      contract: 'badge-success',
      correspondence: 'badge-warning',
      evidence: 'badge-danger',
      report: 'badge-secondary',
      template: 'badge-success',
      other: 'badge-secondary'
    };
    return badges[type];
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && documents.length === 0) {
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
            Document Library
          </h1>
          <p className="mt-2 text-base text-gray-600 max-w-2xl">
            Manage your legal documents, templates, and case files with advanced search and organization.
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
            onClick={() => setShowUpload(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <CloudArrowUpIcon className="h-4 w-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="stats-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card p-6 text-center"
          >
            <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
              {stats.totalDocuments}
            </div>
            <div className="text-sm font-medium text-gray-700">Total Documents</div>
            <div className="text-xs text-gray-500">In your library</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="premium-card p-6 text-center"
          >
            <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">
              {formatFileSize(stats.totalSize)}
            </div>
            <div className="text-sm font-medium text-gray-700">Storage Used</div>
            <div className="text-xs text-gray-500">{stats.storageUsed}% of plan</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-6 text-center"
          >
            <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
              {stats.analysisCount}
            </div>
            <div className="text-sm font-medium text-gray-700">Analyzed</div>
            <div className="text-xs text-gray-500">AI processed</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="premium-card p-6 text-center"
          >
            <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">
              {stats.recentUploads}
            </div>
            <div className="text-sm font-medium text-gray-700">Recent</div>
            <div className="text-xs text-gray-500">Last 7 days</div>
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
                placeholder="Search documents by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200"
              >
                <div>
                  <label className="label">Document Type</label>
                  <select 
                    className="input"
                    value={filters.type?.[0] || ''}
                    onChange={(e) => setFilters({...filters, type: e.target.value ? [e.target.value as DocumentType] : undefined})}
                  >
                    <option value="">All Types</option>
                    <option value="legal_document">Legal Document</option>
                    <option value="contract">Contract</option>
                    <option value="correspondence">Correspondence</option>
                    <option value="evidence">Evidence</option>
                    <option value="report">Report</option>
                    <option value="template">Template</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Status</label>
                  <select 
                    className="input"
                    value={filters.status?.[0] || ''}
                    onChange={(e) => setFilters({...filters, status: e.target.value ? [e.target.value as Document['status']] : undefined})}
                  >
                    <option value="">All Statuses</option>
                    <option value="ready">Ready</option>
                    <option value="analyzed">Analyzed</option>
                    <option value="processing">Processing</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Category</label>
                  <select 
                    className="input"
                    value={filters.category?.[0] || ''}
                    onChange={(e) => setFilters({...filters, category: e.target.value ? [e.target.value as DocumentCategory] : undefined})}
                  >
                    <option value="">All Categories</option>
                    <option value="incoming">Incoming</option>
                    <option value="outgoing">Outgoing</option>
                    <option value="internal">Internal</option>
                    <option value="legal_template">Legal Template</option>
                    <option value="evidence">Evidence</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Has Analysis</label>
                  <select 
                    className="input"
                    value={filters.hasAnalysis?.toString() || ''}
                    onChange={(e) => setFilters({...filters, hasAnalysis: e.target.value === '' ? undefined : e.target.value === 'true'})}
                  >
                    <option value="">All Documents</option>
                    <option value="true">With Analysis</option>
                    <option value="false">Without Analysis</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* View Controls and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {(['grid', 'list', 'folders'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Select All */}
          <button
            onClick={handleSelectAll}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {selectedDocuments.size === documents.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedDocuments.size > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedDocuments.size} selected
            </span>
            <button
              onClick={() => handleBulkOperation({ operation: 'delete', documentIds: Array.from(selectedDocuments) })}
              className="btn-danger flex items-center space-x-1 text-sm"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={() => handleBulkOperation({ operation: 'tag', documentIds: Array.from(selectedDocuments), params: { tags: ['bulk-tagged'] } })}
              className="btn-secondary flex items-center space-x-1 text-sm"
            >
              <TagIcon className="h-4 w-4" />
              <span>Tag</span>
            </button>
          </div>
        )}
      </div>

      {/* Documents Grid/List */}
      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="card text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || Object.keys(filters).length > 0 
                ? 'Try adjusting your search or filters'
                : 'Start by uploading your first legal document'}
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary"
            >
              Upload Your First Document
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="documents-grid">
            {documents.map((document, index) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`premium-card p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 ${
                  selectedDocuments.has(document.id) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleDocumentSelect(document.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{getFileIcon(document.format)}</div>
                  <div className="flex items-center space-x-1">
                    {document.isEncrypted && <span className="text-xs">🔒</span>}
                    <input
                      type="checkbox"
                      checked={selectedDocuments.has(document.id)}
                      onChange={() => handleDocumentSelect(document.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                
                <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                  {document.name}
                </h3>
                
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`badge ${getStatusBadge(document.status)} text-xs`}>
                    {document.status.toUpperCase()}
                  </span>
                  <span className={`badge ${getTypeBadge(document.type)} text-xs`}>
                    {document.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Size: {formatFileSize(document.size)}</div>
                  <div>Uploaded: {document.uploadedAt.toLocaleDateString()}</div>
                  {document.analysisResults && document.analysisResults.length > 0 && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckIcon className="h-3 w-3" />
                      <span>AI Analyzed</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  {document.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                  {document.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{document.tags.length - 3} more</span>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 mt-4" onClick={(e) => e.stopPropagation()}>
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                    <ShareIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(document.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            {documents.map((document, index) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`premium-card p-4 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                  selectedDocuments.has(document.id) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleDocumentSelect(document.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.has(document.id)}
                      onChange={() => handleDocumentSelect(document.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="text-2xl">{getFileIcon(document.format)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {document.name}
                        </h3>
                        {document.isEncrypted && <span className="text-xs">🔒</span>}
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {document.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{formatFileSize(document.size)}</span>
                        <span>{document.uploadedAt.toLocaleDateString()}</span>
                        <span className={`badge ${getStatusBadge(document.status)} text-xs`}>
                          {document.status}
                        </span>
                        {document.analysisResults && document.analysisResults.length > 0 && (
                          <span className="flex items-center space-x-1 text-green-600">
                            <CheckIcon className="h-3 w-3" />
                            <span>Analyzed</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={() => {
          setShowUpload(false);
          loadDocuments();
          loadStats();
        }}
      />
    </div>
  );
};

// Upload Modal Component
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Omit<UploadRequest, 'file'>>({
    type: 'legal_document',
    category: 'incoming',
    description: '',
    tags: [],
    encrypt: false
  });
  const [tagInput, setTagInput] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploading(true);
      const request: UploadRequest = { ...formData, file };
      await documentsService.uploadDocument(request);
      toast.success('Document uploaded successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to upload document');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [formData, onSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
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
          <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="card-body space-y-6">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
              ${isDragActive ? 'border-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 scale-[1.02]' : 'border-gray-300 hover:border-primary-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100'}
              ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="space-y-4">
                <LoadingSpinner size="lg" className="mx-auto" />
                <p className="text-lg font-semibold text-gray-900">Uploading Document...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {isDragActive ? 'Drop the file here' : 'Upload Document'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Drag and drop a file here, or click to select
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  {['PDF', 'DOCX', 'DOC', 'TXT', 'JPG', 'PNG'].map(format => (
                    <span key={format} className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 font-medium">
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Document Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Document Type</label>
              <select
                className="input w-full"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as DocumentType})}
              >
                <option value="legal_document">Legal Document</option>
                <option value="contract">Contract</option>
                <option value="correspondence">Correspondence</option>
                <option value="evidence">Evidence</option>
                <option value="report">Report</option>
                <option value="template">Template</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="label">Category</label>
              <select
                className="input w-full"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as DocumentCategory})}
              >
                <option value="incoming">Incoming</option>
                <option value="outgoing">Outgoing</option>
                <option value="internal">Internal</option>
                <option value="legal_template">Legal Template</option>
                <option value="evidence">Evidence</option>
                <option value="correspondence">Correspondence</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              rows={3}
              className="input w-full"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of the document and its purpose"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="input flex-1"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags to organize your document"
              />
              <button
                type="button"
                onClick={addTag}
                className="btn-secondary"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Security Options */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="encrypt"
              checked={formData.encrypt}
              onChange={(e) => setFormData({...formData, encrypt: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="encrypt" className="text-sm font-medium text-gray-900">
              Encrypt document for additional security
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
              className="btn-primary flex items-center space-x-2"
              disabled={uploading}
            >
              {uploading && <LoadingSpinner size="sm" />}
              <span>Select File</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentsPage;