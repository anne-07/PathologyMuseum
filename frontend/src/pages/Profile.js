import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  XMarkIcon,
  CheckCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon as XIcon
} from '@heroicons/react/24/outline';

const API_URL = '/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Get user's first initial for avatar
  const userInitial = user?.username?.charAt(0).toUpperCase() || 'U';
  
  // Format join date
  const joinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Recently';

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get token from localStorage and set in axios headers
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Set the auth header for all axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user profile
        const response = await axios.get(`${API_URL}/auth/profile`, {
          withCredentials: true
        });
        
        if (response.data.status === 'success') {
          const userData = response.data.data.user;
          setUser(userData);
          
          const profileData = {
            username: userData.username || '',
            email: userData.email || '',
            password: '',
            currentPassword: ''
          };
          
          setFormData(profileData);
          
          // Update localStorage with fresh user data
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // If the token is invalid, clear it and redirect to login
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          navigate('/login');
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setError(error.response?.data?.message || 'Failed to fetch user profile. Please try again.');
        
        // If unauthorized, clear token and redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          navigate('/login');
        }
      }
    };
    
    fetchUserProfile();
  }, [navigate, setUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const formDataToSend = {
        username: formData.username,
        email: formData.email
      };

      const response = await axios.patch(
        `${API_URL}/auth/update-profile`,
        formDataToSend,
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          withCredentials: true
        }
      );
      
      if (response.data.status === 'success') {
        const updatedUser = { ...user, ...response.data.data.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSuccessMessage('Profile updated successfully!');

        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Update error:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      password: '',
      currentPassword: ''
    });
    setError('');
    setSuccessMessage('');
  };
  
  const handleCancel = () => {
    handleResetForm();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar with Gradient */}
          <div className="lg:w-1/3">
            <div className="bg-gradient-to-b from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white h-full">
              <div className="flex flex-col items-center text-center">
                <div className="relative h-32 w-32 rounded-full bg-white p-1 shadow-md mb-4">
                  {user?.avatar ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL || ''}${user.avatar}`} 
                      alt="Profile" 
                      className="h-full w-full rounded-full object-cover" 
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-4xl font-bold text-indigo-600">{userInitial}</span>
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white">{user?.username || 'User'}</h1>
                <p className="text-indigo-100">{user?.email}</p>
                <div className="mt-4 flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                    {user?.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                    Active
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 w-full">
                  <p className="text-sm text-indigo-100">Member since</p>
                  <p className="text-sm font-medium text-white">{joinDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-2/3 space-y-6">
            {/* Profile Information Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Update your personal details</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {error && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XIcon className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                {successMessage && (
                  <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700">{successMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserCircleIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="username"
                          id="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                          placeholder="johndoe"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Change Password</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Update your password</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Ensure your account is using a long, random password to stay secure.
                  </p>
                  <div>
                    <Link
                      to="/forgot-password"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Update Password
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Account Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Account</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Permanently delete your account
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data will be permanently deleted.
                    Before deleting your account, please download any data or information that you wish to retain.
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
