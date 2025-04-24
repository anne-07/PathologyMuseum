import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const recentItems = [
  {
    id: 'spec1',
    type: 'specimen',
    name: 'Uterine Fibroids',
    lastViewed: '2 hours ago',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1674086619163-54bd6379f538?q=80&w=1975&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'slide1',
    type: 'slide',
    name: 'Histological Section of Myoma',
    lastViewed: '1 day ago',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1674086619163-54bd6379f538?q=80&w=1975&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

const quickLinks = [
  { name: 'Specimens Library', href: '/specimens', icon: '🔬' },
  { name: 'Histology Slides', href: '/slides', icon: '🔍' },
  { name: 'Bookmarks', href: '/bookmarks', icon: '📑' },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
                    <p className="text-sm font-medium text-gray-900">{link.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Continue Learning Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Continue Where You Left Off</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/${item.type}s/${item.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-white"
                >
                  <div className="aspect-w-3 aspect-h-2 bg-gray-200 group-hover:opacity-75">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">Last viewed {item.lastViewed}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Bookmarks Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Bookmarks</h3>
              <Link
                to="/bookmarks"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
            <div className="mt-4">
              {/* Add bookmarked items here */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
