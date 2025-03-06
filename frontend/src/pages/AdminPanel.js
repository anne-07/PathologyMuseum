import React, { useState } from 'react';

const mockSpecimens = [
  {
    id: 'spec1',
    name: 'Uterine Fibroids',
    system: 'Female Genital',
    uploadDate: '2025-03-01',
    status: 'published',
  },
  {
    id: 'spec2',
    name: 'Myocardial Infarction',
    system: 'Cardiovascular',
    uploadDate: '2025-03-02',
    status: 'draft',
  },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('specimens');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Admin Dashboard
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              Add New Specimen
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('specimens')}
              className={`${
                activeTab === 'specimens'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Specimens
            </button>
            <button
              onClick={() => setActiveTab('slides')}
              className={`${
                activeTab === 'slides'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Slides
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Users
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === 'specimens' && (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      System
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Upload Date
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {mockSpecimens.map((specimen) => (
                    <tr key={specimen.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {specimen.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{specimen.system}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{specimen.uploadDate}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            specimen.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {specimen.status}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'slides' && (
            <div className="text-center py-12 text-gray-500">Slides management coming soon...</div>
          )}
          {activeTab === 'users' && (
            <div className="text-center py-12 text-gray-500">User management coming soon...</div>
          )}
        </div>
      </div>
    </div>
  );
}
