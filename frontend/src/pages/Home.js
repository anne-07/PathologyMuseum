import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { handleAxiosError } from '../utils/errorHandler';
import { 
  BookOpenIcon, 
  BookmarkIcon, 
  ClockIcon, 
  MagnifyingGlassIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  // Check authentication immediately
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
  }, [isAuthenticated, navigate]);

  // Real-time data states
  const [recentSpecimens, setRecentSpecimens] = useState([]);
  const [recentBookmarks, setRecentBookmarks] = useState([]);
  const [loadingSpecimens, setLoadingSpecimens] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [errorSpecimens, setErrorSpecimens] = useState(null);
  const [errorBookmarks, setErrorBookmarks] = useState(null);

  // Fetch recently viewed specimens
  const fetchRecentSpecimens = async () => {
    setLoadingSpecimens(true);
    setErrorSpecimens(null);
    try {
      const ids = JSON.parse(localStorage.getItem('recentlyViewedSpecimens') || '[]');
      if (!ids.length) {
        setRecentSpecimens([]);
        setLoadingSpecimens(false);
        return;
      }

      // Fetch specimen data for each ID (in order)
      const res = await axios.get('/specimens', { params: { ids: ids.join(',') } });
      // The backend should return specimens in the same order as requested IDs; if not, sort them
      const fetched = res.data.data.specimens || [];
      const idToSpecimen = Object.fromEntries(fetched.map(s => [s._id, s]));
      const ordered = ids.map(id => idToSpecimen[id]).filter(Boolean);
      setRecentSpecimens(ordered);
    } catch (err) {
      setErrorSpecimens(handleAxiosError(err, 'load'));
    } finally {
      setLoadingSpecimens(false);
    }
  };

  // Fetch recent bookmarks
  const fetchRecentBookmarks = async () => {
    setLoadingBookmarks(true);
    setErrorBookmarks(null);
    try {
      const res = await axios.get('/bookmarks', {
        withCredentials: true
      });
      // Assuming bookmarks have a 'createdAt' or 'updatedAt' field
      const sorted = (res.data.data || []).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      setRecentBookmarks(sorted.slice(0, 5));
    } catch (err) {
      setErrorBookmarks(handleAxiosError(err, 'load'));
    } finally {
      setLoadingBookmarks(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentSpecimens();
      fetchRecentBookmarks();
    }
  }, [isAuthenticated]);

  // If not authenticated, return null to prevent rendering
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, <span className="text-primary-600">{user.username}</span>
              </h1>
              <p className="mt-2 text-gray-600">
                {user.role === 'admin' ? 'Administrator Dashboard' : 'Student Dashboard'}
              </p>
            </div>

            {/* Essential Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <BookOpenIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recently Viewed</p>
                    <p className="text-2xl font-bold text-gray-900">{recentSpecimens.length}</p>
                    <p className="text-xs text-gray-500 mt-1">specimens</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                    <BookmarkIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Saved Bookmarks</p>
                    <p className="text-2xl font-bold text-gray-900">{recentBookmarks.length}</p>
                    <p className="text-xs text-gray-500 mt-1">items</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recently Viewed Specimens - Main Content */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <ClockIcon className="h-6 w-6 mr-2 text-primary-600" />
                  Recently Viewed Specimens
                </h2>
                <p className="mt-1 text-sm text-gray-500">Continue where you left off</p>
              </div>
              {recentSpecimens.length > 0 && (
                <Link 
                  to="/specimens" 
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  Browse all
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Link>
              )}
            </div>

            {loadingSpecimens ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : errorSpecimens ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600">{errorSpecimens}</p>
              </div>
            ) : recentSpecimens.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No recent specimens found.</p>
                <Link 
                  to="/specimens" 
                  className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                >
                  Browse specimens
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentSpecimens.slice(0, 9).map(item => (
                  <Link
                    key={item._id}
                    to={`/specimens/${item._id}`}
                    className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-200"
                  >
                    <div className="w-full">
                      <h4 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                        {item.title || item.name}
                      </h4>
                      {item.system && (
                        <p className="mb-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">
                          {item.system}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-gray-400">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        Recently viewed
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookmarks */}
          {isAuthenticated && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BookmarkIcon className="h-6 w-6 mr-2 text-primary-600" />
                    Recent Bookmarks
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">Quick access to your saved items</p>
                </div>
                {recentBookmarks.length > 0 && (
                  <Link 
                    to="/bookmarks" 
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    View all
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                )}
              </div>
              
              {loadingBookmarks ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ) : errorBookmarks ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <p className="text-red-600">{errorBookmarks}</p>
                </div>
              ) : recentBookmarks.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No bookmarks yet.</p>
                  <Link 
                    to="/specimens" 
                    className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                  >
                    Start bookmarking
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentBookmarks.map(item => (
                    <Link
                      key={item._id}
                      to={item.specimenId ? `/specimens/${item.specimenId}` : '#'}
                      className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-200"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-purple-100 rounded-lg overflow-hidden flex items-center justify-center ring-2 ring-gray-200 group-hover:ring-primary-300 transition-all">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.title || 'Bookmark'} 
                              className="object-cover w-full h-full" 
                            />
                          ) : (
                            <BookmarkIcon className="h-8 w-8 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                              {item.title || item.notes || 'Bookmark'}
                            </h4>
                            <BookmarkIcon className="h-4 w-4 text-purple-500 flex-shrink-0 ml-2" />
                          </div>
                          {item.notes && (
                            <p className="mt-1 text-sm text-gray-500 line-clamp-1">{item.notes}</p>
                          )}
                          {item.updatedAt && (
                            <div className="mt-2 flex items-center text-xs text-gray-400">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}