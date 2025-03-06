import React from 'react';

export default function Resources() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Learning Resources</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for resources */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Coming Soon</h2>
          <p className="text-gray-600 mt-2">Additional learning resources under development</p>
        </div>
      </div>
    </div>
  );
}
