import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial verification of stored authentication state
    const currentUser = authService.getCurrentUser();
    const currentToken = authService.getToken();
    
    if (currentUser && currentToken) {
      setUser(currentUser);
      setToken(currentToken);
    } else {
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, []);

  const login = async (role, username, password) => {
    const result = await authService.login(role, username, password);
    setUser(result.user);
    setToken(result.token);
    return result.user;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    return user.role === requiredRole.toUpperCase();
  };

  const value = {
    user,
    token,
    role: user ? user.role : null,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    logout,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
