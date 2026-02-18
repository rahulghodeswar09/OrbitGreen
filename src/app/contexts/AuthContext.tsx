import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/app/utils/api';
import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
    phone?: string,
    address?: string
  ) => Promise<void>;
  adminSignup: (
    email: string,
    password: string,
    name: string,
    adminKey: string
  ) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Supabase auth state changes
  useEffect(() => {
    // Get initial session
    checkSession();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setAccessToken(null);
        setLoading(false);
        return;
      }

      if (session?.access_token) {
        setAccessToken(session.access_token);
        try {
          const { profile } = await authAPI.getProfile(session.access_token);
          setUser(profile);
        } catch (err) {
          console.error('Error fetching profile on auth change:', err);
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authAPI.getSession();
      if (session?.access_token) {
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
    const data = await authAPI.login(email, password);
    if (data.session) {
      setAccessToken(data.session.access_token);
      const { profile } = await authAPI.getProfile(data.session.access_token);
      setUser(profile);
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    setAccessToken(null);
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    phone?: string,
    address?: string
  ) => {
    await authAPI.signup(email, password, name, phone, address);
    await login(email, password);
  };

  const adminSignup = async (
    email: string,
    password: string,
    name: string,
    adminKey: string
  ) => {
    await authAPI.adminSignup(email, password, name, adminKey);
    await login(email, password);
  };

  const refreshProfile = async () => {
    if (!accessToken) return;
    const { profile } = await authAPI.getProfile(accessToken);
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        logout,
        signup,
        adminSignup,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
