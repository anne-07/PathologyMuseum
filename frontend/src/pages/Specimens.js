import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SearchableSelect from '../components/SearchableSelect';
import FilterSection from '../components/specimens/FilterSection';

const API_URL = 'http://localhost:5000/api';

const useSpecimens = () => {
  const [specimens, setSpecimens] = useState([]);
  const [filteredSpecimens, setFilteredSpecimens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    system: '',
    organ: '',
    diseaseCategory: '',
  });
  const [filterOptions, setFilterOptions] = useState({
    organ: [],
    system: [],
    diseaseCategory: [],
  });
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState(null);
  const [searchParams] = useSearchParams();

  // Initialize active filters from URL params
  useEffect(() => {
    const system = searchParams.get('system') || '';
    if (system) {
      setActiveFilters(prev => ({
        ...prev,
        system
      }));
    }
  }, [searchParams]);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    setFilterLoading(true);
    setFilterError(null);
    try {
      const types = ['organ', 'system', 'diseaseCategory'];
      const results = await Promise.all(
        types.map(type => 
          axios.get(`${API_URL}/filter-options?type=${type}`, {
            withCredentials: true
          })
        )
      );
      
      const newOptions = {};
      types.forEach((type, i) => {
        newOptions[type] = results[i].data.data.options.map(opt => opt.value);
      });
      setFilterOptions(newOptions);
    } catch (err) {
      setFilterError('Failed to load filter options');
    } finally {
      setFilterLoading(false);
    }
  }, []);

  // Fetch specimens based on filters
  const fetchSpecimens = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const params = new URLSearchParams();
    if (activeFilters.system) params.append('system', activeFilters.system);
    if (activeFilters.diseaseCategory) params.append('diseaseCategory', activeFilters.diseaseCategory);
    if (activeFilters.organ) params.append('organ', activeFilters.organ);
    if (searchQuery) params.append('search', searchQuery);

    try {
      const response = await axios.get(`${API_URL}/specimens?${params.toString()}`, {
        withCredentials: true
      });
      
      if (response.data?.data?.specimens) {
        setSpecimens(response.data.data.specimens);
        setFilteredSpecimens(response.data.data.specimens);
      }
    } catch (err) {
      console.error('Error fetching specimens:', err);
      setError(err.response?.data?.message || 'Failed to fetch specimens');
      setSpecimens([]);
      setFilteredSpecimens([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, searchQuery]);

  // Handle filter changes
  const handleFilterChange = (category, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? '' : value
    }));
  };

  // Remove a specific filter
  const handleRemoveFilter = (category) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: ''
    }));
  };

  // Clear all filters
  const handleClearAll = () => {
    setActiveFilters({
      system: '',
      organ: '',
      diseaseCategory: ''
    });
    setSearchQuery('');
  };

  // Initial data loading
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Fetch specimens when filters change
  useEffect(() => {
    fetchSpecimens();
  }, [fetchSpecimens]);

  return {
    specimens,
    filteredSpecimens,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeFilters,
    filterOptions,
    filterLoading,
    filterError,
    handleFilterChange,
    handleClearAll,
    handleRemoveFilter
  };
};

export default function Specimens() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // Use the custom hook for data management
  const {
    specimens,
    filteredSpecimens,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeFilters,
    filterOptions,
    filterLoading,
    filterError,
    handleFilterChange,
    handleClearAll,
    handleRemoveFilter
  } = useSpecimens();

  // Check if any filters are active
  const hasActiveFilters = Object.values(activeFilters).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Pathology Specimens</h1>
          
          {/* Mobile filter button */}
          <button
            type="button"
            className="lg:hidden flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <FunnelIcon className="h-4 w-4" />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            {hasActiveFilters && (
              <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {Object.values(activeFilters).filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Filters (left sidebar) */}
          <div className={`lg:col-span-1 ${!showMobileFilters && 'hidden lg:block'}`}>
            <div className="bg-white shadow rounded-lg p-4 sm:p-5 lg:sticky lg:top-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
                  <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Filters
                </h2>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    >
                      Clear all
                    </button>
                  )}
                  <button 
                    className="lg:hidden text-gray-400 hover:text-gray-500"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                {/* Dynamic filters */}
                {['organ', 'system', 'diseaseCategory'].map((category) => (
                  <div key={category} className="py-1">
                    <FilterSection
                      category={category}
                      value={activeFilters[category]}
                      options={filterOptions[category] || []}
                      loading={filterLoading}
                      onChange={(value) => handleFilterChange(category, value)}
                    />
                  </div>
                ))}

                {filterError && (
                  <div className="text-xs text-red-500 mt-2">
                    {filterError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile filter summary */}
            <div className="lg:hidden mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">
                {filteredSpecimens.length} {filteredSpecimens.length === 1 ? 'result' : 'results'}
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              )}
            </div>
            {/* Search Bar (above results, right column) */}
            <div className="mb-6">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder="Search specimens by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Selected Filters Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(activeFilters).map(([category, value]) => (
                value ? (
                  <span key={category} className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">
                    {value}
                    <button
                      className="ml-2 text-primary-700 hover:text-red-600 focus:outline-none"
                      onClick={() => handleRemoveFilter(category)}
                      aria-label={`Remove ${category} filter`}
                      type="button"
                    >
                      &times;
                    </button>
                  </span>
                ) : null
              ))}
              {(activeFilters.system || activeFilters.diseaseCategory || activeFilters.organ || searchQuery) && (
                <button
                  className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300 ml-2"
                  onClick={handleClearAll}
                  type="button"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Specimen List */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredSpecimens.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No specimens found.</div>
            ) : (
              <ul className="divide-y divide-gray-200 bg-white shadow rounded-lg">
                {filteredSpecimens.map((specimen) => (
                  <li key={specimen._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{specimen.title}</h3>
                      {specimen.system && (
                        <div className="text-xs text-primary-700 font-medium mb-1">
                          System: {specimen.system}
                        </div>
                      )}
                      <div className="text-sm text-gray-600">Organ: {specimen.organ}</div>
                      <div className="text-sm text-gray-600">Disease Category: {specimen.diseaseCategory}</div>
                      <div className="text-xs text-gray-400">{new Date(specimen.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-2 sm:mt-0 flex flex-col gap-2 items-start sm:items-end">
                      <Link
                        to={`/specimens/${specimen._id}`}
                        className="inline-block text-primary-600 hover:underline text-sm"
                      >
                        View Details
                      </Link>
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        specimen.severity === 'Severe'
                          ? 'bg-red-100 text-red-800'
                          : specimen.severity === 'Moderate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {specimen.severity}
                      </span>
                    </div>
                </li>
              ))}
            </ul>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
