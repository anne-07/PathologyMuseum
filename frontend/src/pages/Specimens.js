import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';



export default function Specimens() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);
  const [searchParams] = useSearchParams();
  // Only list mode for specimen preview
  const viewMode = 'list';
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSpecimens, setFilteredSpecimens] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    system: searchParams.get('system') || '',
    organ: '',
    diseaseCategory: '',
  });
  const [specimens, setSpecimens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic filter options
  const [filterOptions, setFilterOptions] = useState({

    organ: [],
    system: [],
    diseaseCategory: [],
  });
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState(null);
  const [newFilter, setNewFilter] = useState({ organ: '', system: '',diseaseCategory: '' });

  // Fetch filter options from backend
  const fetchFilterOptions = async () => {
    setFilterLoading(true);
    setFilterError(null);
    try {
      const types = [ 'organ', 'system','diseaseCategory'];
      const results = await Promise.all(types.map(type => axios.get(`${API_URL}/filter-options?type=${type}`)));
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
  };

  useEffect(() => { 
    fetchFilterOptions();
    const onStorage = (e) => {
      if (e.key === 'filtersUpdated') fetchFilterOptions();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);


  // Helper to build query string
  const buildQuery = () => {
    const params = [];
    if (activeFilters.system) params.push(`system=${encodeURIComponent(activeFilters.system)}`);
    if (activeFilters.diseaseCategory) params.push(`diseaseCategory=${encodeURIComponent(activeFilters.diseaseCategory)}`);
    if (activeFilters.organ) params.push(`organ=${encodeURIComponent(activeFilters.organ)}`);
    
    // Add search query if present
    if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);

    return params.length ? `?${params.join('&')}` : '';
  };


  useEffect(() => {
    const fetchSpecimens = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/specimens${buildQuery()}`);
        if (response.data && response.data.data && response.data.data.specimens) {
          setSpecimens(response.data.data.specimens);
          setFilteredSpecimens(response.data.data.specimens);
        } else {
          setSpecimens([]);
          setFilteredSpecimens([]);
        }
      } catch (err) {
        console.error('Error fetching specimens:', err);
        setError(err.response?.data?.message || 'Failed to fetch specimens');
        setSpecimens([]);
        setFilteredSpecimens([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecimens();
  }, [activeFilters.system, activeFilters.diseaseCategory, activeFilters.organ]);

  // Filter specimens by name in real-time
  useEffect(() => {
    if (!specimens) {
      setFilteredSpecimens([]);
      return;
    }
    if (!searchQuery) {
      setFilteredSpecimens(specimens);
    } else {
      setFilteredSpecimens(
        specimens.filter(s =>
          (s.title || s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, specimens]);

  const handleFilterChange = (category, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: prev[category] === value ? '' : value, // Deselect if already selected
    }));
  };

  // Remove a filter by category
  const handleRemoveFilter = (category) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: '',
    }));
  };

  // Clear all filters and search
  const handleClearAll = () => {
    setActiveFilters({ system: '', organ: '', diseaseCategory: '' });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pathology Specimens</h1>
        </div>

        {/* Search and Filters */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-4">

          {/* Filters (left sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </h2>
              <div className="mt-6 space-y-6">
                {/* Dynamic filters:  organ, system , diseaseCategory*/}
                {[ 'organ', 'system','diseaseCategory'].map((category) => (
                  <div key={category} className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      {category === 'diseaseCategory' ? 'Disease Category' : 
                       category === 'organ' ? 'Organ' : 
                       category === 'system' ? 'System' : 
                       category}
                    </h3>
                    <div className="mt-2 space-y-2 min-h-[36px]">
                      {filterLoading && <div className="text-xs text-gray-400">Loading...</div>}
                      {!filterLoading && filterOptions[category]?.length === 0 && (
                        <div className="text-xs text-gray-400">No options yet.</div>
                      )}
                      <select
                        name={category}
                        value={activeFilters[category]}
                        onChange={(e) => handleFilterChange(category, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value=""> Select </option>
                        {(filterOptions[category] || []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {filterError && <div className="text-xs text-red-500 mt-2">{filterError}</div>}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
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

            {/* Selected Filters Chips and Clear All */}
            <div className="flex flex-wrap gap-2 mb-4">
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
