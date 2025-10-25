import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

// Configure axios for cookie-based auth
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

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
    const checkAuth = async () => {
      try {
        const response = await axios.get(`/auth/profile`);
        if (response.data.status === 'success') {
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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
      console.error('Login failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 400) {
          errorMessage = 'Invalid email or password format';
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      return { 
        success: false, 
        error: errorMessage
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
