import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { User, AuthResponse, UserUpdateInput } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UserUpdateInput) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    // Handle social auth callback
    if (location.pathname === '/auth/callback') {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      if (token) {
        authAPI.handleCallback(token)
          .then((user) => {
            setUser(user);
            setIsAuthenticated(true);
            navigate('/');
          })
          .catch((error) => {
            console.error('Auth callback error:', error);
            navigate('/login');
          });
      }
    }

    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          handleLogout();
          return;
        }

        const fetchUser = async () => {
          try {
            const response = await authAPI.getUser();
            setUser(response);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(response));
          } catch (error) {
            console.error('Error fetching user:', error);
            handleLogout();
          }
        };

        await fetchUser();
      } catch (error) {
        console.error('Auth check failed:', error);
        handleLogout();
      }
    };

    if (!location.pathname.startsWith('/auth/callback')) {
      checkAuthStatus();
    }
  }, [navigate, location]);

  const handleAuthResponse = (response: AuthResponse) => {
    const { token, user } = response;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
    navigate('/');
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      handleLogout();
    }
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        signup,
        logout,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
