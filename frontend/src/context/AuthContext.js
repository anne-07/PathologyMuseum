import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { handleAxiosError } from '../utils/errorHandler';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios for cookie-based auth
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

// Simple response interceptor - redirect to login on 401 errors
// No automatic token refresh to avoid loops
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip handling for auth endpoints to prevent redirect loops
    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/login') || 
                          requestUrl.includes('/auth/refresh-token') ||
                          requestUrl.includes('/auth/logout') ||
                          requestUrl.includes('/auth/register') ||
                          requestUrl.includes('/auth/google');

    // If 401 error and not an auth endpoint, redirect to login
    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._skipAuthRedirect) {
      // Clear user data
      localStorage.removeItem('user');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }

    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async (credentialResponse) => {
    try {
      const response = await axios.post(`/auth/google`, {
        token: credentialResponse.credential
      });
      
      if (response.data.status === 'success') {
        const { user } = response.data.data;
        // Update user state (tokens are stored in HTTP-only cookies by the server)
        const userData = {
          ...user,
          email: user.email || credentialResponse.profileObj?.email
        };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: response.data.message };
    } catch (error) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Google login failed. Please try again.' 
      };
    }
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const response = await axios.get(`/auth/profile`, {
          _skipAuthRedirect: true // Don't redirect on initial check failure
        });
        
        if (!isMounted) return;
        
        if (response.data.status === 'success') {
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        if (!isMounted) return;
        
        // Don't redirect on initial check - just set as not authenticated
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      const response = await axios.post(`/auth/login`, {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      if (!response.data.data?.user) {
        throw new Error('Invalid response format from server');
      }
      const { user } = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: handleAxiosError(error, 'operation')
      };
    }
  };

  const logout = async () => {
    localStorage.removeItem('user');
    try {
      await axios.post(`/auth/logout`);
    } catch (e) {
      // ignore
    }
    setUser(null);
    setIsAuthenticated(false);
    // Navigation is now handled in the component that calls logout
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    loginWithGoogle,
    setUser,
    setIsAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
