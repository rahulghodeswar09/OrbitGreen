import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/app/utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string, phone?: string, address?: string) => Promise<void>;
  adminSignup: (email: string, password: string, name: string, adminKey: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authAPI.getSession();
      if (session && session.access_token) {
        setAccessToken(session.access_token);
        const { profile } = await authAPI.getProfile(session.access_token);
        setUser(profile);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login(email, password);
      if (data.session) {
        setAccessToken(data.session.access_token);
        const { profile } = await authAPI.getProfile(data.session.access_token);
        setUser(profile);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, phone?: string, address?: string) => {
    try {
      await authAPI.signup(email, password, name, phone, address);
      // After signup, automatically log in
      await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const adminSignup = async (email: string, password: string, name: string, adminKey: string) => {
    try {
      await authAPI.adminSignup(email, password, name, adminKey);
      // After signup, automatically log in
      await login(email, password);
    } catch (error) {
      console.error('Admin signup error:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (accessToken) {
      const { profile } = await authAPI.getProfile(accessToken);
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, signup, adminSignup, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
