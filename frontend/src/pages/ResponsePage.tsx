import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  ClipboardDocumentIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { TemplateService } from '../services/templates';
import { ResponseTemplate, GeneratedResponse } from '../types/templates';

const ResponsePage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ResponseTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generatedResponse, setGeneratedResponse] = useState<GeneratedResponse | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const templates = TemplateService.getTemplates();

  const handleTemplateSelect = (template: ResponseTemplate) => {
    setSelectedTemplate(template);
    setGeneratedResponse(null);
    setShowPreview(false);
    
    // Initialize variables
    const initialVariables: Record<string, string> = {};
    template.variables.forEach(variable => {
      initialVariables[variable] = '';
    });
    setVariables(initialVariables);
  };

  const handleVariableChange = (variableName: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [variableName]: value
    }));
  };

  const handlePreviewTemplate = () => {
    if (!selectedTemplate) return;
    setShowPreview(true);
  };

  const handleGenerateResponse = () => {
    if (!selectedTemplate) return;

    const missingVariables = TemplateService.validateRequiredVariables(selectedTemplate.id, variables);
    if (missingVariables.length > 0) {
      alert(`Please fill in all required variables: ${missingVariables.join(', ')}`);
      return;
    }

    const response = TemplateService.generateResponse(selectedTemplate.id, variables);
    if (response) {
      setGeneratedResponse(response);
    }
  };

  const copyToClipboard = () => {
    if (generatedResponse) {
      navigator.clipboard.writeText(generatedResponse.content);
      alert('Response copied to clipboard!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Legal Response Generator
        </h1>
        <p className="text-lg text-gray-600">
          Generate evidence-based legal responses using proven templates with documented success rates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Template Selection */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Response Template</h2>
            <div className="space-y-3">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-start space-x-3">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {(template.successRate * 100).toFixed(0)}% success rate
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {template.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Variable Input */}
          {selectedTemplate && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Fill Template Variables</h2>
              <div className="space-y-4">
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {variable.replace(/_/g, ' ')} *
                    </label>
                    <input
                      type="text"
                      value={variables[variable] || ''}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      className="input w-full"
                      placeholder={`Enter ${variable.replace(/_/g, ' ').toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handlePreviewTemplate}
                  className="btn-secondary flex-1"
                >
                  Preview Template
                </button>
                <button
                  onClick={handleGenerateResponse}
                  className="btn-primary flex-1"
                >
                  Generate Response
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview/Generated Response */}
        <div className="space-y-6">
          {selectedTemplate && (showPreview || generatedResponse) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {generatedResponse ? 'Generated Response' : 'Template Preview'}
                </h2>
                {generatedResponse && (
                  <button
                    onClick={copyToClipboard}
                    className="btn-secondary text-sm"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                    Copy
                  </button>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap border">
                {generatedResponse 
                  ? generatedResponse.content 
                  : TemplateService.previewTemplate(selectedTemplate.id)
                }
              </div>

              {generatedResponse && (
                <div className="mt-6 space-y-4">
                  {/* Success Probability */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">
                        Success Probability: {(generatedResponse.successProbability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Based on proven methodology with real-world case outcomes
                    </p>
                  </div>

                  {/* Legal Citations */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Legal Basis</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {generatedResponse.legalCitations.map((citation, index) => (
                        <li key={index}>• {citation}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Follow-up Actions */}
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-2">Next Steps</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {generatedResponse.followUpActions.map((action, index) => (
                        <li key={index}>• {action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedTemplate && (
            <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Template</h3>
              <p className="text-gray-600">
                Choose a proven legal response template to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsePage;