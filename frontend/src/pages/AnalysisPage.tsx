import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon, ExclamationTriangleIcon, CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import LoadingSpinner from '../components/LoadingSpinner';
import { casesService } from '../services/cases';
import { CreateCaseRequest } from '../types/cases';
import { analysisApiService, AnalysisResult } from '../services/api/analysis';

// Use the AnalysisResult interface from the API service

const AnalysisPage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [creatingCase, setCreatingCase] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showTextAnalysis, setShowTextAnalysis] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analysisApiService.analyzeDocument({
        file,
        documentType: 'legal',
        analysisMode: 'comprehensive',
        userContext: {
          jurisdiction: 'NO',
          language: 'no'
        }
      });

      if (result.success) {
        setAnalysisResult(result);
        toast.success('Analysis completed successfully!');
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Handle specific error types with helpful messages
      const errorMessage = (error as Error).message || 'Analysis failed';
      
      if (errorMessage.includes('PDF contains no extractable text') || errorMessage.includes('NO_TEXT_CONTENT') || errorMessage.includes('SCANNED_PDF_ERROR') || errorMessage.includes('scanned document')) {
        toast.error('This PDF appears to be scanned. Please try converting it to text-based PDF or use a DOCX/TXT file instead.', {
          duration: 6000
        });
      } else if (errorMessage.includes('Unsupported file type')) {
        toast.error('Unsupported file type. Please use PDF, DOCX, or TXT files only.');
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        toast.error('Too many requests. Please wait a moment before trying again.');
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analysisApiService.analyzeText(textInput);
      
      if (result.success) {
        setAnalysisResult(result);
        toast.success('Text analysis completed successfully!');
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Text analysis error:', error);
      toast.error((error as Error).message || 'Text analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const handleCreateCase = async () => {
    if (!analysisResult) return;

    try {
      setCreatingCase(true);
      
      // Generate case data from analysis results
      const caseData: CreateCaseRequest = {
        title: `Legal Challenge - Analysis Report ${analysisResult.timestamp.slice(0, 8)}`,
        description: `Case created from document analysis showing ${analysisResult.data.findings.length} ${analysisResult.data.findings.length === 1 ? 'issue' : 'issues'} with ${analysisResult.data.severity} severity level. Overall confidence: ${Math.round(analysisResult.data.confidence * 100)}%`,
        institution: '', // User will need to fill this
        institutionType: 'government', // Default, user can change
        priority: analysisResult.data.severity === 'critical' ? 'urgent' : analysisResult.data.severity === 'warning' ? 'high' : 'medium',
        tags: [
          'analysis-generated',
          `severity-${analysisResult.data.severity}`,
          ...analysisResult.data.findings.map(f => f.type.replace('_', '-'))
        ],
        analysisId: analysisResult.timestamp
      };

      await casesService.createCase(caseData);
      toast.success('Case created successfully! Redirecting to Cases page...');
      
      // Navigate to cases page after a short delay
      setTimeout(() => {
        navigate('/cases');
      }, 1500);
    } catch (error) {
      console.error('Error creating case:', error);
      toast.error('Failed to create case. Please try again.');
    } finally {
      setCreatingCase(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Document Analysis
        </h1>
        <p className="mt-2 text-base text-gray-600 max-w-2xl">
          Upload a legal document to detect contradictions and analyze institutional communications with 89% accuracy.
        </p>
      </div>

      {/* Analysis Options */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setShowTextAnalysis(false)}
          className={`btn ${!showTextAnalysis ? 'btn-primary' : 'btn-secondary'}`}
        >
          File Upload
        </button>
        <button
          onClick={() => setShowTextAnalysis(true)}
          className={`btn ${showTextAnalysis ? 'btn-primary' : 'btn-secondary'}`}
        >
          Text Analysis
        </button>
      </div>

      {/* Upload Area */}
      {!showTextAnalysis ? (
        <div className="card-elevated">
          <div className="card-body">
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300
              ${isDragActive ? 'border-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 scale-[1.02]' : 'border-gray-300 hover:border-primary-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100'}
              ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}
            `}
          >
            <input {...getInputProps()} />
            
            {isAnalyzing ? (
              <div className="space-y-6">
                <div className="relative">
                  <LoadingSpinner size="lg" className="mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-900">Analyzing Document</p>
                  <p className="text-base text-gray-600 mt-2">
                    Processing your document for contradictions and legal issues...
                  </p>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <DocumentArrowUpIcon className="mx-auto h-16 w-16 text-gray-400 group-hover:text-primary-500 transition-colors duration-300" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                    {isDragActive ? 'Drop the file here' : 'Upload Document'}
                  </p>
                  <p className="text-base text-gray-600 mt-2">
                    Drag and drop a file here, or click to select
                  </p>
                  <div className="mt-4 inline-flex items-center space-x-2 text-sm text-gray-500">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                      PDF
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                      DOCX
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
                      TXT
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum file size: 10MB • Text-based PDFs only (not scanned images)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      ) : (
        /* Text Analysis Area */
        <div className="card-elevated">
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your legal document text here for analysis:
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Vi avslår kravet om yrkesskadeerstatning. Vi understreker at vi ikke er ansvarlig for noen av de påståtte skadene. Selv om vi ikke anerkjenner noen rettslig forpliktelse i denne saken, tilbyr vi deg likevel et oppgjør på kr 50.000 for å unngå videre tvist."
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={isAnalyzing}
                />
              </div>
              <div className="text-center">
                <button
                  onClick={handleTextAnalysis}
                  disabled={isAnalyzing || !textInput.trim()}
                  className="btn-primary px-8 py-3 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    'Analyze Text'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div className="card-header flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Analysis Overview</h3>
              <button
                onClick={handleCreateCase}
                disabled={creatingCase}
                className="btn-primary flex items-center space-x-2"
              >
                {creatingCase ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating Case...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    <span>Create Case</span>
                  </>
                )}
              </button>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(analysisResult.data.confidence * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence Score</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center">
                    <span className={`badge ${getSeverityBadge(analysisResult.data.severity)}`}>
                      {analysisResult.data.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Severity Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {analysisResult.data.findings.length}
                  </div>
                  <div className="text-sm text-gray-600">Issues Found</div>
                </div>
              </div>
            </div>
          </div>

          {/* Findings */}
          {analysisResult.data.findings.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Contradictions & Issues</h3>
              </div>
              <div className="card-body space-y-4">
                {analysisResult.data.findings.map((finding, index) => (
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
          {analysisResult.data.recommendations.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Recommended Actions</h3>
              </div>
              <div className="card-body space-y-4">
                {analysisResult.data.recommendations.map((recommendation, index) => (
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
            Analysis completed in {analysisResult.data.processingTime}ms
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnalysisPage;