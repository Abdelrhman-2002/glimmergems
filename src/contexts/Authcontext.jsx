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
      const data = await login(email, password);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        return true;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
      return false;
    }
  };

  // Register function
  const handleRegister = async (userData) => {
    setError(null);
    try {
      const data = await register(userData);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        return true;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
      return false;
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