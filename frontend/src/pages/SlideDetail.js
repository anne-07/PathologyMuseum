import React from 'react';
import { useParams } from 'react-router-dom';

export default function SlideDetail() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Histological Slide Viewer</h1>
        <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Slide viewer will be implemented here */}
          <div className="aspect-w-16 aspect-h-9 bg-gray-200">
            <div className="flex items-center justify-center">
              <p className="text-gray-500">Slide viewer coming soon...</p>
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900">Slide Details</h2>
            <p className="mt-4 text-gray-600">Slide ID: {id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
