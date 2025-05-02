import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpecimenForm from './SpecimenForm';
import AddFilterOptionForm from './AddFilterOptionForm';

const API_URL = 'http://localhost:5000/api';

export default function AdminPanel() {
  const [specimens, setSpecimens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editSpecimen, setEditSpecimen] = useState(null);
  const [activeTab, setActiveTab] = useState('specimens');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Filter Option Management State and Logic ---
  const [filterOptions, setFilterOptions] = useState({
    organ: [],
    system: [],
    diseaseCategory: [],
  });
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState(null);
  const [newFilter, setNewFilter] = useState({  organ: '', system: '',diseaseCategory: ''});

  const fetchFilterOptions = async () => {
    setFilterLoading(true);
    setFilterError(null);
    try {
      const types = [ 'organ', 'system', 'diseaseCategory'];
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

  useEffect(() => { fetchFilterOptions(); }, []);

  const addFilterOption = async (type) => {
    if (!newFilter[type]?.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/filter-options`, { type, value: newFilter[type].trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewFilter(f => ({ ...f, [type]: '' }));
      fetchFilterOptions();
      localStorage.setItem('filtersUpdated', Date.now());
    } catch (err) {
      alert('Failed to add filter option: ' + (err.response?.data?.message || err.message));
    }
  };

  const deleteFilterOption = async (type, value) => {
    try {
      const token = localStorage.getItem('token');
      // Get the option ID
      const res = await axios.get(`${API_URL}/filter-options?type=${type}`);
      const option = res.data.data.options.find(opt => opt.value === value);
      if (!option) return alert('Option not found');
      await axios.delete(`${API_URL}/filter-options/${option._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFilterOptions();
    } catch (err) {
      alert('Failed to delete filter option: ' + (err.response?.data?.message || err.message));
    }
  };
  // --- End Filter Option Management ---


  const fetchSpecimens = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/specimens');
      if (!res.ok) throw new Error('Failed to fetch specimens');
      const data = await res.json();
      setSpecimens(data.data.specimens || []);
    } catch (err) {
      setError(err.message);
      setSpecimens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSpecimens(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this specimen?')) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/specimens/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete specimen');
      }
      fetchSpecimens();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (specimen) => {
    setEditSpecimen(specimen);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditSpecimen(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditSpecimen(null);
    fetchSpecimens();
  };

  // Filter specimens by search query (case insensitive, match title, diseaseCategory, organ)
  const filteredSpecimens = specimens.filter(specimen => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (specimen.title && specimen.title.toLowerCase().includes(q)) ||
      (specimen.diseaseCategory && specimen.diseaseCategory.toLowerCase().includes(q)) ||
      (specimen.organ && specimen.organ.toLowerCase().includes(q))
    );
  });

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
              onClick={handleAdd}
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
              onClick={() => setActiveTab('filters')}
              className={`${
                activeTab === 'filters'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Manage Filters
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

          {activeTab === 'filters' && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Manage Filter Options</h3>
              {filterError && <div className="text-red-500 mb-2">{filterError}</div>}
              {filterLoading ? <div>Loading filter options...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['organ', 'system', 'diseaseCategory'].map(type => (
                    <div key={type} className="border rounded p-4 bg-white shadow">
                      <h4 className="font-bold mb-3">{type === 'diseaseCategory' ? 'Disease Category' : type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                      <ul className="mb-3 min-h-[40px]">
                        {filterOptions[type]?.length === 0 && <li className="text-xs text-gray-400">No options yet.</li>}
                        {filterOptions[type]?.map(opt => (
                          <li key={opt} className="flex items-center justify-between mb-1 group hover:bg-gray-50 rounded px-1">
                            <span>{opt}</span>
                            <button
                              onClick={() => deleteFilterOption(type, opt)}
                              className="text-xs text-red-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                              title={`Delete ${opt}`}
                            >
                              Delete
                            </button>
                          </li>
                        ))}
                      </ul>
                      <form
                        onSubmit={e => { e.preventDefault(); addFilterOption(type); }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={newFilter[type] || ''}
                          onChange={e => setNewFilter(f => ({ ...f, [type]: e.target.value }))}
                          placeholder={`Add new ${type}`}
                          className="border rounded px-2 py-1 text-xs"
                          disabled={filterLoading}
                        />
                        <button
                          type="submit"
                          className="text-xs bg-primary-600 text-white rounded px-2 py-1"
                          disabled={!newFilter[type]?.trim() || filterLoading}
                        >
                          Add
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'specimens' && (
            <>
              {/* Search Bar */}
              <div className="mb-4 flex justify-end">
                <input
                  type="text"
                  className="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder="Search specimens..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
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
                    {loading ? (
                      <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                    ) : error ? (
                      <tr><td colSpan="5" className="text-center text-red-500 py-8">{error}</td></tr>
                    ) : filteredSpecimens.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-8">No specimens found.</td></tr>
                    ) : (
                      filteredSpecimens.map((specimen) => (
                        <tr key={specimen._id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                            {specimen.title || specimen.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{specimen.organ || specimen.system}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{specimen.createdAt ? new Date(specimen.createdAt).toLocaleDateString() : ''}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{specimen.status || 'published'}</td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                            <button className="text-primary-600 hover:text-primary-900 mr-4" onClick={() => handleEdit(specimen)}>Edit</button>
                            <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(specimen._id)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {activeTab === 'slides' && (
            <div className="text-center py-12 text-gray-500">Slides management coming soon...</div>
          )}
          {activeTab === 'users' && (
            <div className="text-center py-12 text-gray-500">User management coming soon...</div>
          )}
        </div>
      </div>
      {/* Specimen Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <SpecimenForm
              specimen={editSpecimen}
              onClose={handleFormClose}

            />
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleFormClose}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}






