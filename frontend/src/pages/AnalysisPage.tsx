import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import LoadingSpinner from '../components/LoadingSpinner';

interface AnalysisResult {
  analysisId: string;
  overallScore: number;
  severity: 'critical' | 'warning' | 'info';
  findings: Array<{
    type: string;
    evidence: string[];
    explanation: string;
    confidence: number;
    severity: 'critical' | 'warning' | 'info';
    legalImplication?: string;
  }>;
  recommendations: Array<{
    strategy: string;
    priority: string;
    successProbability: number;
    description: string;
    requiredActions: string[];
  }>;
  processingTime: number;
}

const AnalysisPage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('modules', JSON.stringify(['contradiction']));
      formData.append('options', JSON.stringify({ language: 'no', jurisdiction: 'norway' }));

      const response = await fetch('/api/analysis/document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      if (data.success) {
        setAnalysisResult(data.data);
        toast.success('Analysis completed successfully!');
      } else {
        throw new Error(data.error?.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error((error as Error).message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: isAnalyzing
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ExclamationTriangleIcon className="h-5 w-5 text-danger-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'badge-danger';
      case 'warning':
        return 'badge-warning';
      default:
        return 'badge-success';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Analysis</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload a legal document to detect contradictions and analyze institutional communications
        </p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="card-body">
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center hover:border-primary-400 transition-colors
              ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300'}
              ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <input {...getInputProps()} />
            
            {isAnalyzing ? (
              <div className="space-y-4">
                <LoadingSpinner size="lg" className="mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Analyzing Document</p>
                  <p className="text-sm text-gray-600">Processing your document for contradictions and legal issues...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop the file here' : 'Upload Document'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Drag and drop a file here, or click to select
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports PDF, DOCX, and TXT files (max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Overview */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Analysis Overview</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(analysisResult.overallScore * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence Score</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center">
                    <span className={`badge ${getSeverityBadge(analysisResult.severity)}`}>
                      {analysisResult.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Severity Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {analysisResult.findings.length}
                  </div>
                  <div className="text-sm text-gray-600">Issues Found</div>
                </div>
              </div>
            </div>
          </div>

          {/* Findings */}
          {analysisResult.findings.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Contradictions & Issues</h3>
              </div>
              <div className="card-body space-y-4">
                {analysisResult.findings.map((finding, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(finding.severity)}
                        <h4 className="font-medium text-gray-900">
                          {finding.type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <span className={`badge ${getSeverityBadge(finding.severity)}`}>
                          {Math.round(finding.confidence * 100)}% confident
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700">{finding.explanation}</p>
                    
                    {finding.legalImplication && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Legal Implication:</strong> {finding.legalImplication}
                        </p>
                      </div>
                    )}
                    
                    {finding.evidence.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Evidence:</h5>
                        <div className="space-y-2">
                          {finding.evidence.map((evidence, evidenceIndex) => (
                            <div
                              key={evidenceIndex}
                              className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-700 font-mono"
                            >
                              "{evidence}"
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysisResult.recommendations.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Recommended Actions</h3>
              </div>
              <div className="card-body space-y-4">
                {analysisResult.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-gray-900">
                        {recommendation.strategy.replace('_', ' ').toUpperCase()}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="badge-success">
                          {Math.round(recommendation.successProbability * 100)}% success rate
                        </span>
                        <span className={`badge ${
                          recommendation.priority === 'immediate' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {recommendation.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700">{recommendation.description}</p>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Required Actions:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {recommendation.requiredActions.map((action, actionIndex) => (
                          <li key={actionIndex}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Info */}
          <div className="text-center text-sm text-gray-500">
            Analysis completed in {analysisResult.processingTime}ms
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnalysisPage;