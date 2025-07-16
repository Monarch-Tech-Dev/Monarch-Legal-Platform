import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentMagnifyingGlassIcon, 
  ShieldCheckIcon, 
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="legal-header p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Monarch Legal Platform
              </h1>
              <div className="success-rate-badge animate-pulse">
                89% SUCCESS
              </div>
            </div>
            <p className="text-xl text-gray-700 max-w-3xl font-medium">
              Institutional Protection Through Legal Intelligence Technology
            </p>
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-600">AI Analysis Engine Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-600">Norwegian Legal Framework</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500 premium-glow">
              <ShieldCheckIcon className="h-8 w-8 text-white filter drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link to="/analysis" className="block premium-card p-8 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-start space-x-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500">
                <DocumentMagnifyingGlassIcon className="h-8 w-8 text-white filter drop-shadow-lg" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                  Document Analysis
                </h3>
                <p className="text-gray-600 mt-2 font-medium">
                  AI-powered contradiction detection • Authority verification • Pattern recognition
                </p>
                <div className="flex items-center space-x-2 mt-3">
                  <div className="success-rate-badge text-xs">89% Accuracy</div>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/responses" className="block premium-card p-8 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-start space-x-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500">
                <ShieldCheckIcon className="h-8 w-8 text-white filter drop-shadow-lg" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-emerald-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                  Response Generation
                </h3>
                <p className="text-gray-600 mt-2 font-medium">
                  Evidence-based legal responses • Proven templates • Norwegian legal framework
                </p>
                <div className="flex items-center space-x-2 mt-3">
                  <div className="success-rate-badge text-xs">94% Authority Success</div>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to="/cases" className="block premium-card p-8 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-start space-x-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500">
                <ChartBarIcon className="h-8 w-8 text-white filter drop-shadow-lg" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                  Case Tracking
                </h3>
                <p className="text-gray-600 mt-2 font-medium">
                  Monitor case outcomes • Success analytics • Knowledge building
                </p>
                <div className="flex items-center space-x-2 mt-3">
                  <div className="success-rate-badge text-xs">Legal Intelligence</div>
                  <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="premium-card p-8 text-center success-glow transform hover:scale-105 transition-all duration-500"
        >
          <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-3">
            89%
          </div>
          <div className="text-sm font-bold text-gray-800 mb-1">Success Rate</div>
          <div className="text-xs text-gray-600">Contradiction challenges</div>
          <div className="mt-3 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse" style={{width: '89%'}}></div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-all duration-200"
        >
          <div className="text-3xl lg:text-4xl font-bold text-blue-600">
            3
          </div>
          <div className="text-sm font-medium text-gray-700 mt-2">Analyses Left</div>
          <div className="text-xs text-gray-500 mt-1">This month (Free tier)</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-all duration-200"
        >
          <div className="text-3xl lg:text-4xl font-bold text-gray-600">
            0
          </div>
          <div className="text-sm font-medium text-gray-700 mt-2">Active Cases</div>
          <div className="text-xs text-gray-500 mt-1">Being processed</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-all duration-200"
        >
          <div className="text-3xl lg:text-4xl font-bold text-orange-600">
            94%
          </div>
          <div className="text-sm font-medium text-gray-700 mt-2">Authority Success</div>
          <div className="text-xs text-gray-500 mt-1">Hierarchy challenges</div>
        </motion.div>
      </div>

      {/* Getting Started */}
      <div className="bg-blue-50 rounded-2xl shadow-sm border border-blue-200">
        <div className="px-6 py-5 border-b border-blue-200">
          <h3 className="text-lg font-medium text-gray-900">Get Started with Legal Intelligence</h3>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <DocumentMagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">1. Upload Document</h4>
              <p className="text-sm text-gray-600">Upload legal documents for AI analysis</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">2. AI Analysis</h4>
              <p className="text-sm text-gray-600">Detect contradictions and verify authority</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">3. Generate Response</h4>
              <p className="text-sm text-gray-600">Create evidence-based legal responses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Analysis Modules */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">AI Analysis Modules</h3>
          <p className="text-sm text-gray-500 mt-1">Proven methodology with real-world success rates</p>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                Contradiction Detection
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Settlement contradictions (89% success)</li>
                <li>• Direct logical negations</li>
                <li>• Timeline impossibilities</li>
                <li>• Semantic inconsistencies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="h-2 w-2 bg-blue-500 rounded-full mr-2"></span>
                Authority Verification
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Norwegian hierarchy validation (94% success)</li>
                <li>• Government agency cross-reference</li>
                <li>• Court decision verification</li>
                <li>• Regulatory compliance checking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <span className="h-2 w-2 bg-purple-500 rounded-full mr-2"></span>
                Pattern Recognition
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Manipulation tactics detection</li>
                <li>• Pressure technique identification</li>
                <li>• Deflection pattern analysis</li>
                <li>• Gaslighting recognition</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;