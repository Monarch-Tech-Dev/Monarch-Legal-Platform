import React from 'react';

const CasesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your legal cases and track progress
        </p>
      </div>
      
      <div className="card">
        <div className="card-body text-center py-12">
          <p className="text-gray-500">Cases management coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default CasesPage;