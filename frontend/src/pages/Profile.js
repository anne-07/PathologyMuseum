import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '', // For password update
    currentPassword: '', // For authentication before password change
    // Add other fields as necessary
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Store initial user data for cancel/reset
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data.data.user);
        const profileData = {
          username: response.data.data.user.username,
          email: response.data.data.user.email,
          password: '',
          currentPassword: '',
        };
        setFormData(profileData);
        setInitialData(profileData);
      } catch (error) {
        setError('Failed to fetch user profile.');
      }
    };

    fetchUserProfile();
  }, [setUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  // Only send password fields if changing password
  const getFormDataForSubmit = () => {
    const data = { ...formData };
    if (!data.password) {
      delete data.password;
      delete data.currentPassword;
    }
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // If changing password, require current password
    if (formData.password && !formData.currentPassword) {
      setLoading(false);
      setError('Please enter your current password to change your password.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        getFormDataForSubmit(),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === 'success') {
        setUser(response.data.data.user);
        setSuccessMessage('Profile updated successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-600 to-blue-500 p-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-4xl font-bold text-primary-700 shadow-md mb-4">
              {/* Avatar with initials */}
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{user?.username}</h2>
            <p className="text-blue-100">{user?.email}</p>
            <span className="mt-2 inline-block bg-white/20 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm">
              Role: {user?.role || 'student'}
            </span>
          </div>

          {/* Profile Form Section */}
          <div className="px-8 py-10">
            <h3 className="text-lg font-semibold text-primary-700 mb-6 text-center">Update Your Profile</h3>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                  />
                </div>
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                  />
                </div>
              </div>
              {/* Password update field (optional) */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password <span className="text-xs text-gray-400">(leave blank to keep current)</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="block w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                />
              </div>
              {/* Current password required if changing password */}
              {formData.password && (
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password <span className="text-xs text-red-400">(required to change password)</span>
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    autoComplete="current-password"
                    className="block w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                  />
                </div>
              )}
              <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-2 text-base font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span>
                      <svg className="inline-block animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Profile'
                  )}
                </button>
                {/* Cancel Button: only show if form has changed */}
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg bg-gray-200 px-6 py-2 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 transition-all duration-150"
                  disabled={loading || !initialData || JSON.stringify(formData) === JSON.stringify(initialData)}
                  onClick={() => initialData && setFormData(initialData)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

