import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  handleOAuthCallback: (token: string, userData: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleOAuthCallback = useCallback((token: string, userData: string) => {
    try {
      const parsedUser = JSON.parse(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(parsedUser));
      setUser(parsedUser);
      navigate('/');
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Handle OAuth callback
    if (location.pathname === '/auth/callback') {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const userData = params.get('user');
      
      if (token && userData) {
        handleOAuthCallback(token, userData);
      }
    }
  }, [location, handleOAuthCallback]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await authAPI.signup(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user && !!localStorage.getItem('token'),
    login,
    signup,
    logout,
    handleOAuthCallback,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
