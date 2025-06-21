import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentMagnifyingGlassIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your legal protection platform
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            to="/analysis"
            className="card hover:shadow-md transition-shadow group"
          >
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                  <DocumentMagnifyingGlassIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Analyze Document</h3>
                  <p className="text-sm text-gray-600">
                    Upload and analyze legal documents for contradictions
                  </p>
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
          <Link
            to="/cases"
            className="card hover:shadow-md transition-shadow group"
          >
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 bg-success-100 rounded-lg group-hover:bg-success-200 transition-colors">
                  <ShieldCheckIcon className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">My Cases</h3>
                  <p className="text-sm text-gray-600">
                    Manage your legal cases and track progress
                  </p>
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
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 bg-warning-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-warning-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">
                    View success rates and insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-gray-900">89%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-xs text-gray-500 mt-1">Contradiction challenges</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-600">Analyses Left</div>
            <div className="text-xs text-gray-500 mt-1">This month (Free tier)</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Active Cases</div>
            <div className="text-xs text-gray-500 mt-1">Being processed</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-gray-900">94%</div>
            <div className="text-sm text-gray-600">Authority Success</div>
            <div className="text-xs text-gray-500 mt-1">Hierarchy challenges</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="card-body">
          <div className="text-center py-8 text-gray-500">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p>No recent activity</p>
            <p className="text-sm">Upload a document to get started</p>
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Platform Features</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contradiction Detection</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Settlement contradictions (89% success rate)</li>
                <li>• Direct logical negations</li>
                <li>• Timeline impossibilities</li>
                <li>• Authority conflicts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Authority Verification</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Norwegian government agencies</li>
                <li>• Court hierarchy validation</li>
                <li>• Regulatory body checking</li>
                <li>• Legal precedent matching</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;