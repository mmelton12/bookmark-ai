import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { authAPI } from '../services/api';
import { User, AuthResponse, UserUpdateInput } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UserUpdateInput) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for saved token and user data
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }

    // Handle OAuth callback
    if (location.pathname === '/auth/callback') {
      const params = new URLSearchParams(location.search);
      const callbackToken = params.get('token');
      
      if (callbackToken) {
        // Set the token
        setToken(callbackToken);
        localStorage.setItem('token', callbackToken);
        
        // Fetch user data
        const fetchUser = async () => {
          try {
            const response = await authAPI.getUser();
            setUser(response);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(response));
            navigate('/');
          } catch (error) {
            console.error('Error fetching user data:', error);
            navigate('/login');
          }
        };
        
        fetchUser();
      } else {
        // Handle error case
        const error = params.get('error');
        if (error) {
          console.error('OAuth error:', error);
          navigate('/login');
        }
      }
    }
  }, [location, navigate]);

  const handleAuthResponse = (response: AuthResponse) => {
    setToken(response.token);
    setUser(response.user);
    setIsAuthenticated(true);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      handleAuthResponse(response);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await authAPI.signup(email, password);
      handleAuthResponse(response);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updateProfile = async (data: UserUpdateInput) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authAPI.updatePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    signup,
    logout,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
