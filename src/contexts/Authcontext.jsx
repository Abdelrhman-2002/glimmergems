import React, { createContext, useState, useEffect, useContext } from 'react';
import { login, register } from '../services/api'; // Make sure path is correct

// Create the context
const AuthContext = createContext();

// Add this line to export AuthContext as a named export as well
export { AuthContext };  // Add this line

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on page load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        // Invalid stored user
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  // Login function
  const handleLogin = async (email, password) => {
    setError(null);
    try {
      const response = await login(email, password);
      
      if (response.success && response.user) {
        const userData = response.user;
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
        return true;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during login');
      throw err;
    }
  };

  // Register function
  const handleRegister = async (userData) => {
    setError(null);
    try {
      const response = await register(userData);
      
      if (response.success && response.user) {
        const userInfo = response.user;
        localStorage.setItem('token', userInfo.token);
        localStorage.setItem('user', JSON.stringify(userInfo));
        setCurrentUser(userInfo);
        return true;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during registration');
      throw err;
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Context value
  const value = {
    currentUser,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;