import React from 'react';

const DocumentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage your uploaded documents
        </p>
      </div>
      
      <div className="card">
        <div className="card-body text-center py-12">
          <p className="text-gray-500">Document management coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;