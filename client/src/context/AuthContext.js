import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configure axios base URL
  axios.defaults.baseURL = 'http://localhost:8080';

  // Add request interceptor to include JWT token in all requests
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = authToken || localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Adding JWT token to request:', token.substring(0, 20) + '...');
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [authToken]);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('Found existing token, verifying...');
      setAuthToken(token);
      verifyToken(token);
    } else {
      console.log('No existing token found');
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      console.log('Verifying JWT token...');
      const response = await axios.get('/api/verify-token', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Token verification response:', response.data);
      
      if (response.data.success) {
        // Token is valid, set user data
        const userData = {
          username: response.data.user.username,
          name: response.data.user.name,
          userId: response.data.user.userId,
          email: response.data.user.email,
        };
        
        console.log('Setting authenticated user:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        setAuthToken(token);
        
        console.log('User authentication successful');
      } else {
        console.log('Token verification failed - invalid response');
        handleInvalidToken();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      handleInvalidToken();
    } finally {
      setLoading(false);
    }
  };

  const handleInvalidToken = () => {
    console.log('Token is invalid, clearing authentication...');
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
  };

  // Add response interceptor to handle token expiration
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.log('Axios response error:', error.response?.status, error.response?.data);
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Authentication error detected, invalidating token...');
          handleInvalidToken();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (user_name, password) => {
    try {
      setLoading(true);
      console.log('Attempting login for user:', user_name);
      
      const response = await axios.post('/login', {
        user_name,
        password
      });

      console.log('Login API response:', response.data);

      if (response.data.success && response.data.token) {
        const userData = {
          username: response.data.user.user_name,
          name: response.data.user.name,
          userId: response.data.user.userId,
          email: response.data.user.email,
        };
        
        console.log('Login successful, setting user data:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store JWT token
        setAuthToken(response.data.token);
        localStorage.setItem('authToken', response.data.token);
        
        console.log('JWT token stored successfully');
        
        return { success: true, message: response.data.message };
      } else {
        console.log('Login failed - no token in response');
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data) {
        console.error('Error response data:', error.response.data);
        return { success: false, message: error.response.data.message };
      }
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      console.log('Attempting signup for user:', userData.user_name);
      
      const response = await axios.post('/adduser', userData);
      
      console.log('Signup API response:', response.data);

      if (response.data.success) {
        // After successful signup, automatically log the user in
        console.log('Signup successful, attempting auto-login...');
        const loginResponse = await login(userData.user_name, userData.password);
        
        if (loginResponse.success) {
          return { success: true, message: response.data.message };
        } else {
          return { 
            success: false, 
            message: 'Account created but login failed. Please try logging in.' 
          };
        }
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response?.data) {
        console.error('Error response data:', error.response.data);
        return { success: false, message: error.response.data.message };
      }
      return { success: false, message: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const googleSignup = async (googleData) => {
    try {
      setLoading(true);
      console.log('Attempting Google signup:', googleData.email);
      
      const response = await axios.post('/google-signup', googleData);
      
      console.log('Google signup API response:', response.data);

      if (response.data.success && response.data.token) {
        const userData = {
          username: response.data.user.user_name,
          name: response.data.user.name,
          userId: response.data.user.userId,
          email: response.data.user.email,
        };
        
        console.log('Google signup successful, setting user data:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store JWT token
        setAuthToken(response.data.token);
        localStorage.setItem('authToken', response.data.token);
        
        console.log('JWT token stored successfully for Google user');
        
        return { success: true, message: response.data.message };
      } else {
        console.log('Google signup failed - no token in response');
        return { success: false, message: response.data.message || 'Google signup failed' };
      }
    } catch (error) {
      console.error('Google signup error:', error);
      if (error.response?.data) {
        console.error('Error response data:', error.response.data);
        return { success: false, message: error.response.data.message };
      }
      return { success: false, message: 'Google signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');
      // Optional: Call server logout endpoint if you have one
      await axios.post('/api/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with client-side logout even if API call fails
    } finally {
      // Clear client-side authentication state
      console.log('Clearing client-side authentication state');
      setUser(null);
      setAuthToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      console.log('Logout completed successfully');
    }
  };

  // Function to get the current token
  const getToken = () => {
    const token = authToken || localStorage.getItem('authToken');
    console.log('Retrieving token:', token ? token.substring(0, 20) + '...' : 'No token');
    return token;
  };

  // Function to check if user is authenticated (useful for conditional rendering)
  const checkAuth = () => {
    return isAuthenticated && user !== null;
  };

  // Function to refresh token (if you implement token refresh logic)
  const refreshToken = async () => {
    // Implement token refresh logic here if needed
    console.log('Token refresh requested');
    // This would typically make an API call to refresh the token
  };

  const value = {
    user,
    authToken,
    isAuthenticated: checkAuth(),
    loading,
    login,
    logout,
    signup,
    googleSignup,
    getToken,
    refreshToken,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};