import React, { createContext, useContext, useEffect, useState } from 'react';
import { pb } from '@/integrations/pocketbase/client';
import type { RecordModel } from 'pocketbase';

// Check if we're in mock mode
const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'pocketbase';
const USE_MOCK_AUTH = DATA_SOURCE === 'mock';

// Hardcoded identity for token-based login.
// Update this to match your PocketBase user email/username,
// or set VITE_AUTH_IDENTITY in your .env file.
const AUTH_IDENTITY = import.meta.env.VITE_AUTH_IDENTITY || 'user@proposaltracker.local';

// User type based on PocketBase's users collection
interface PocketBaseUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  created: string;
  updated: string;
}

interface AuthContextType {
  user: PocketBaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to convert PocketBase model to our user type
function modelToUser(model: RecordModel | null): PocketBaseUser | null {
  if (!model) return null;
  return {
    id: model.id,
    email: model.email,
    name: model.name,
    avatar: model.avatar,
    created: model.created,
    updated: model.updated,
  };
}

// Mock user for development without backend
const MOCK_USER: PocketBaseUser = {
  id: 'mock-user-id',
  email: 'dev@localhost',
  name: 'Dev User',
  avatar: '',
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PocketBaseUser | null>(USE_MOCK_AUTH ? MOCK_USER : null);
  const [loading, setLoading] = useState(!USE_MOCK_AUTH);

  useEffect(() => {
    // In mock mode, user is already set
    if (USE_MOCK_AUTH) {
      console.log('🔓 Mock auth: Auto-logged in as dev@localhost');
      return;
    }

    // Check if user is already authenticated (from localStorage)
    const initAuth = () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        setUser(modelToUser(pb.authStore.model));
      }
      setLoading(false);
    };

    initAuth();

    // Subscribe to auth state changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(modelToUser(model));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (token: string): Promise<{ error: Error | null }> => {
    try {
      await pb.collection('users').authWithPassword(AUTH_IDENTITY, token);
      return { error: null };
    } catch (err: any) {
      console.error('Sign in error:', err);
      return {
        error: new Error(err?.message || 'Invalid token')
      };
    }
  };

  const signOut = async (): Promise<void> => {
    pb.authStore.clear();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
