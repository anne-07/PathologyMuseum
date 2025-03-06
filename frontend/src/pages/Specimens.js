import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

const specimens = [
  {
    id: 'spec1',
    name: 'Uterine Fibroids',
    system: 'Female Genital',
    description: 'Multiple well-circumscribed nodules within the myometrium',
    severity: 'Moderate',
    organ: 'Uterus',
    histologicalType: 'Leiomyoma',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1674086619163-54bd6379f538?q=80&w=1975&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'spec2',
    name: 'Myocardial Infarction',
    system: 'Cardiovascular',
    description: 'Acute myocardial infarction with wall thinning',
    severity: 'Severe',
    organ: 'Heart',
    histologicalType: 'Necrosis',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1674086619163-54bd6379f538?q=80&w=1975&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

const filters = {
  system: [
    { value: 'female-genital', label: 'Female Genital System' },
    { value: 'cardiovascular', label: 'Cardiovascular System' },
    { value: 'respiratory', label: 'Respiratory System' },
  ],
  severity: [
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
  ],
  organ: [
    { value: 'uterus', label: 'Uterus' },
    { value: 'heart', label: 'Heart' },
    { value: 'lung', label: 'Lung' },
  ],
};

export default function Specimens() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    system: searchParams.get('system') || '',
    severity: '',
    organ: '',
  });

  const handleFilterChange = (category, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pathology Specimens</h1>
          <div className="mt-4 sm:mt-0 sm:flex-none">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5 text-gray-500" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <ListBulletIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </h2>
              <div className="mt-6 space-y-6">
                {Object.entries(filters).map(([category, options]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-gray-900 capitalize">{category}</h3>
                    <div className="mt-2 space-y-2">
                      {options.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name={category}
                            value={option.value}
                            checked={activeFilters[category] === option.value}
                            onChange={(e) => handleFilterChange(category, e.target.value)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border-0 py-3 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600"
                  placeholder="Search specimens..."
                />
              </div>
            </div>

            {/* Specimens Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {specimens.map((specimen) => (
                  <Link
                    key={specimen.id}
                    to={`/specimens/${specimen.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-white"
                  >
                    <div className="aspect-h-3 aspect-w-4 bg-gray-200 group-hover:opacity-75">
                      <img
                        src={specimen.imageUrl}
                        alt={specimen.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-lg font-medium text-gray-900">{specimen.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{specimen.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                          {specimen.system}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                          {specimen.organ}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        System
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Organ
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Severity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {specimens.map((specimen) => (
                      <tr
                        key={specimen.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => window.location.href = `/specimens/${specimen.id}`}
                      >
                        <td className="py-4 pl-4 pr-3 text-sm">
                          <div className="font-medium text-gray-900">{specimen.name}</div>
                          <div className="text-gray-500">{specimen.description}</div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">{specimen.system}</td>
                        <td className="px-3 py-4 text-sm text-gray-500">{specimen.organ}</td>
                        <td className="px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            specimen.severity === 'Severe'
                              ? 'bg-red-100 text-red-800'
                              : specimen.severity === 'Moderate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {specimen.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
