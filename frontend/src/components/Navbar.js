import React, { useState, useContext} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Home', href: '/home', userOnly: true },
  { name: 'Specimens', href: '/specimens' },
  { name: 'Bookmarks', href: '/bookmarks', userOnly: true },
  { name: 'Admin Panel', href: '/admin', adminOnly: true },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Auth state (with user role)
  const { isAuthenticated, user, logout } = useAuth();

  // Log the user object to the console for debugging
  console.log('Current user state:', user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigationClick = (href) => {
    if (href === '/bookmarks' && !isAuthenticated) {
      navigate('/login', { state: { from: href } });
      return false;
    }
    return true;
  };

  return (
    <header className="bg-white shadow z-50 relative">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">PathologyMuseum</span>
            </Link>
            <div className="hidden ml-10 space-x-8 md:flex">
              {navigation.map((item) => {
                // Only show admin panel if user is authenticated and is admin
                if (item.adminOnly && (!isAuthenticated || !user || user.role !== 'admin')) return null;
                // Hide bookmarks for admin users
                if (item.userOnly && (!isAuthenticated || user?.role === 'admin')) return null;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={(e) => {
                      if (!handleNavigationClick(item.href)) {
                        e.preventDefault();
                      }
                    }}
                    className={`${
                      isActive(item.href)
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-900'
                    } text-base font-medium cursor-pointer`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex md:items-center md:space-x-4">
              {isAuthenticated ? (
                <Menu as="div" className="relative ml-3">
                  <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    <span className="sr-only">Open user menu</span>
                    {/* <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-800 font-medium">JD</span>
                    </div> */}
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <img
                        src={ 'https://cdn-icons-png.flaticon.com/512/6522/6522516.png'}
                        alt="Profile"
                        className="h-8 w-8 rounded-full"
                      />
                    </div>
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block px-4 py-2 text-sm text-gray-700`}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-4 py-2 text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors duration-200 cursor-pointer"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white hover:bg-primary-700 cursor-pointer"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu */}
            <Menu as="div" className="relative md:hidden">
              <Menu.Button
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                  {navigation.map((item) => {
                    if (item.adminOnly && (!isAuthenticated || !user || user.role !== 'admin')) return null;
                    // Hide bookmarks for admin users
                    if (item.userOnly && (!isAuthenticated || user?.role === 'admin')) return null;
                    return (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <Link
                            to={item.href}
                            onClick={(e) => {
                              if (!handleNavigationClick(item.href)) {
                                e.preventDefault();
                              }
                              setMobileMenuOpen(false);
                            }}
                            className={`${
                              active ? 'bg-primary-500 text-white' : 'text-gray-900'
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm cursor-pointer ${
                              isActive(item.href) ? 'bg-primary-50' : ''
                            }`}
                          >
                            {item.name}
                          </Link>
                        )}
                      </Menu.Item>
                    );
                  })}
                  {isAuthenticated ? (
                    <>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-primary-500 text-white' : 'text-gray-900'
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Your Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              handleLogout();
                              setMobileMenuOpen(false);
                            }}
                            className={`${
                              active ? 'bg-primary-500 text-white' : 'text-gray-900'
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm text-left`}
                          >
                            Log out
                          </button>
                        )}
                      </Menu.Item>
                    </>
                  ) : (
                    <>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/login"
                            className={`${
                              active ? 'bg-primary-500 text-white' : 'text-gray-900'
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Sign in
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/register"
                            className={`${
                              active ? 'bg-primary-500 text-white' : 'text-gray-900'
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm font-semibold`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            Get started
                          </Link>
                        )}
                      </Menu.Item>
                    </>
                  )}
                </div>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </nav>
    </header>
  );
}
