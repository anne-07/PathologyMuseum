import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Dynamic recent items will be fetched from backend


const quickLinks = [
  { name: 'Specimens Library', href: '/specimens', icon: '🔬' },
  { name: 'Histology Slides', href: '/slides', icon: '🔍' },
  { name: 'Bookmarks', href: '/bookmarks', icon: '📑' },
];


  export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Real-time data states
  const [recentSpecimens, setRecentSpecimens] = useState([]);
  const [recentBookmarks, setRecentBookmarks] = useState([]);
  const [loadingSpecimens, setLoadingSpecimens] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [errorSpecimens, setErrorSpecimens] = useState(null);
  const [errorBookmarks, setErrorBookmarks] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
    }
  }, [navigate]);

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
      const res = await axios.get('/api/specimens', { params: { ids: ids.join(',') } });
      // The backend should return specimens in the same order as requested IDs; if not, sort them
      const fetched = res.data.data.specimens || [];
      const idToSpecimen = Object.fromEntries(fetched.map(s => [s._id, s]));
      const ordered = ids.map(id => idToSpecimen[id]).filter(Boolean);
      setRecentSpecimens(ordered);
    } catch (err) {
      setErrorSpecimens('Failed to load recently viewed specimens');
    } finally {
      setLoadingSpecimens(false);
    }
  };

  // Fetch recent bookmarks
  const fetchRecentBookmarks = async () => {
    setLoadingBookmarks(true);
    setErrorBookmarks(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/bookmarks', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      // Assuming bookmarks have a 'createdAt' or 'updatedAt' field
      const sorted = (res.data.data || []).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      setRecentBookmarks(sorted.slice(0, 5));
    } catch (err) {
      setErrorBookmarks('Failed to load bookmarks');
    } finally {
      setLoadingBookmarks(false);
    }
  };

  // Polling for real-time updates
  useEffect(() => {
    fetchRecentSpecimens();
    fetchRecentBookmarks();
    const interval = setInterval(() => {
      fetchRecentSpecimens();
      fetchRecentBookmarks();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Welcome back, {user.username}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Quick Links</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-primary-500 hover:ring-1 hover:ring-primary-500"
                >
                  <div className="flex-shrink-0 text-2xl">{link.icon}</div>
                  <div className="min-w-0 flex-1">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <span className="text-gray-900 font-medium text-lg">{link.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Explore by Body System */}
          <div className="mt-12">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Explore by Body System</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from(new Set(recentSpecimens.map(s => s.system).filter(Boolean))).length === 0 ? (
                <div className="text-gray-500 col-span-full">No systems found.</div>
              ) : (
                (() => {
                  // Mapping from system name to image URL
                  const systemImages = {
                    Cardiovascular: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=400&q=80', // Heart
                    Respiratory: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', // Lungs
                    Nervous: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', // Brain
                    Digestive: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', // Digestive
                    Musculoskeletal: 'https://images.unsplash.com/photo-1424986620741-8822bcc7c3a5?auto=format&fit=crop&w=400&q=80', // Skeleton
                    Renal: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', // Kidneys
                    Endocrine: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80', // Endocrine
                    Lymphatic: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c8a?auto=format&fit=crop&w=400&q=80', // Lymphatic
                    Integumentary: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c8a?auto=format&fit=crop&w=400&q=80', // Skin
                    Reproductive: 'https://images.unsplash.com/photo-1510626176961-4b57d4fbad04?auto=format&fit=crop&w=400&q=80', // Reproductive
                    Immune: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', // Immune
                  };
                  const defaultImage = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80';
                  return Array.from(new Set(recentSpecimens.map(s => s.system).filter(Boolean))).map(system => (
                    <Link
                      key={system}
                      to={`/specimens?system=${encodeURIComponent(system)}`}
                      className="flex flex-col items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-8 shadow-sm hover:border-primary-500 hover:ring-1 hover:ring-primary-500 transition"
                    >
                      <div className="mb-2 w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img
                          src={systemImages[system] || defaultImage}
                          alt={system}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="font-semibold text-gray-900 text-lg text-center">{system}</div>
                    </Link>
                  ));
                })()
              )}
            </div>
          </div>

          {/* Real-Time Recent Specimens */}
          <div className="mt-12">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recently Viewed Specimens</h3>
            {loadingSpecimens ? (
              <div className="mt-2 text-gray-500">Loading...</div>
            ) : errorSpecimens ? (
              <div className="mt-2 text-red-500">{errorSpecimens}</div>
            ) : recentSpecimens.length === 0 ? (
              <div className="text-gray-500">No recent specimens found.</div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentSpecimens.map(item => (
                  <Link
                    key={item._id}
                    to={`/specimens/${item._id}`}
                    className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-primary-500 hover:ring-1 hover:ring-primary-500"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-full overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">🔬</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900">{item.title || item.name}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Real-Time Recent Bookmarks */}
          <div className="mt-12">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Bookmarks</h3>
            {loadingBookmarks ? (
              <div className="mt-2 text-gray-500">Loading...</div>
            ) : errorBookmarks ? (
              <div className="mt-2 text-red-500">{errorBookmarks}</div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentBookmarks.length === 0 ? (
                  <div className="text-gray-500">No bookmarks found.</div>
                ) : recentBookmarks.map(item => (
                  <Link
                    key={item._id}
                    to={item.specimenId ? `/specimens/${item.specimenId}` : '#'}
                    className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-primary-500 hover:ring-1 hover:ring-primary-500"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-full overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title || 'Bookmark'} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">📑</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900">{item.title || item.notes || 'Bookmark'}</div>
                      <div className="text-sm text-gray-500">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ''}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

