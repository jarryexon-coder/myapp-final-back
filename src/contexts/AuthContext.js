import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext({
  user: null,
  loading: true,
  token: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

// Auth Provider Component - FIXED: Added proper children prop
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check for existing token on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, you would check AsyncStorage or similar
        // For now, we'll simulate checking
        const storedToken = null; // Get from storage
        if (storedToken) {
          setToken(storedToken);
          // Validate token with backend
          // setUser(userData);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      // Simulate API call
      // const response = await apiService.post('/auth/login', { email, password });
      // setToken(response.token);
      // setUser(response.user);
      
      // For demo, use mock data
      const mockUser = { id: 1, email, name: 'Demo User' };
      const mockToken = 'mock-jwt-token';
      
      setUser(mockUser);
      setToken(mockToken);
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // In a real app, you would call logout endpoint and clear storage
      setUser(null);
      setToken(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    try {
      setLoading(true);
      // Simulate API call
      // const response = await apiService.post('/auth/register', { email, password, name });
      
      // For demo, use mock data
      const mockUser = { id: 1, email, name };
      const mockToken = 'mock-jwt-token';
      
      setUser(mockUser);
      setToken(mockToken);
      
      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
