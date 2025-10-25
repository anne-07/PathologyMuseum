import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Dynamic recent items will be fetched from backend

const quickLinks = [
  { name: 'Specimens Library', href: '/specimens', icon: '🔬' },
  { name: 'Histology Slides', href: '/slides', icon: '🔍' },
  { name: 'Bookmarks', href: '/bookmarks', icon: '📑' },
];

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
      const res = await axios.get('/bookmarks', {
        withCredentials: true
      });
      // Assuming bookmarks have a 'createdAt' or 'updatedAt' field
      const sorted = (res.data.data || []).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      setRecentBookmarks(sorted.slice(0, 5));
    } catch (err) {
      console.error('Bookmarks fetch error:', err);
      setErrorBookmarks('Failed to load bookmarks');
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

          {/* Recently Viewed Body System */}
          <div className="mt-12">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Explore by Body System</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from(new Set(recentSpecimens.map(s => s.system).filter(Boolean))).length === 0 ? (
                <div className="text-gray-500 col-span-full">No systems found.</div>
              ) : (
                (() => {
                  // Mapping from system name to image URL
                  const systemImages = {
                    Cardiovascular: 'https://www.shutterstock.com/image-illustration/3d-rendered-medical-illustration-male-600nw-2256981889.jpg', // Heart
                    Respiratory: 'https://img.freepik.com/premium-photo/human-respiratory-system-lungs-anatomy-3d-illustration_1302875-22727.jpg', // Lungs
                    //Nervous: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', // Brain
                    //Digestive: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', // Digestive
                    //Musculoskeletal: 'https://images.unsplash.com/photo-1424986620741-8822bcc7c3a5?auto=format&fit=crop&w=400&q=80', // Skeleton
                    //Renal: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', // Kidneys
                    //Endocrine: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80', // Endocrine
                    //Lymphatic: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c8a?auto=format&fit=crop&w=400&q=80', // Lymphatic
                    //Integumentary: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3c8a?auto=format&fit=crop&w=400&q=80', // Skin
                    //Reproductive: 'https://media.gettyimages.com/id/1682989686/vector/female-reproductive-organs-illustration.jpg?s=612x612&w=0&k=20&c=yRkD2P9BOGFGxIBS5g-yyJaL1TIgBR0KC28dC7wzbr4=', // Reproductive
                    //Immune: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', // Immune
                    Breast: 'https://www.shutterstock.com/image-illustration/3d-rendered-medically-accurate-illustration-600nw-1186974508.jpg',
                    Hepatobiliary: 'https://t3.ftcdn.net/jpg/05/47/99/04/360_F_547990421_TsWtvbI2WL5wHU1aArXE7vcprk8BkU5p.jpg',
                    "Female Genital": "https://media.gettyimages.com/id/1682989686/vector/female-reproductive-organs-illustration.jpg?s=612x612&w=0&k=20&c=yRkD2P9BOGFGxIBS5g-yyJaL1TIgBR0KC28dC7wzbr4=",
                    "Male Genital": "https://www.shutterstock.com/shutterstock/videos/1097590213/thumb/1.jpg?ip=x480",
                    "Head and Neck": "https://www.healthxchange.sg/sites/hexassets/Assets/head-neck/how-to-take-care-of-nervous-system.jpg",
                    "Kidney and Lower Urinary": "https://st4.depositphotos.com/6563466/38183/i/450/depositphotos_381839760-stock-photo-human-urinary-system-bladder-anatomy.jpg",
                    Gastrointestinal: 'https://exam.kku.ac.th/pluginfile.php/81176/course/overviewfiles/Gastrointestinal%20System.jpg',
                    "Bone and Soft tissue": "https://lh3.googleusercontent.com/proxy/l8Y9OB6lieOhdKAayEM1Xc-nbKj3yfIpY9ZM8ZAhfdlqe47qaFphr8bYWoRj2Qvl2FgGxhPBQ1vxeK723TkLt_X48o9YOriFpT25",
                    Miscellaneous: 'https://img.freepik.com/premium-photo/human-body-with-blue-background-that-says-human-anatomy_130714-4503.jpg',

                  };
                  const defaultImage = 'https://www.healthxchange.sg/sites/hexassets/Assets/head-neck/how-to-take-care-of-nervous-system.jpg';
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
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">🧪 Recently Viewed Specimens</h3>

            {loadingSpecimens ? (
              <div className="text-gray-500 text-center mt-4">Loading...</div>
            ) : errorSpecimens ? (
              <div className="text-red-500 text-center mt-4">{errorSpecimens}</div>
            ) : recentSpecimens.length === 0 ? (
              <div className="text-gray-500 text-center mt-4">No recent specimens found.</div>
            ) : (
              <div className="space-y-4">
                {recentSpecimens.map(item => (
                  <Link
                    key={item._id}
                    to={`/specimens/${item._id}`}
                    className="flex items-center space-x-4 px-4 py-3 rounded-lg bg-white shadow-sm hover:shadow-lg hover:border-l-4 hover:border-primary-500 transition duration-300"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="object-cover w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="text-gray-500 text-xl">🔬</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-800">{item.title || item.name}</h4>
                      <p className="text-sm text-gray-500">Click to view specimen details</p>
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