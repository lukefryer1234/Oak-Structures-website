"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import * as authApi from '@/lib/api/auth-api';
import type { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  register: (userData: any) => Promise<void>;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start loading until session is checked
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check for an active session when the provider mounts
    const checkUserSession = async () => {
      setLoading(true);
      try {
        const sessionUser = await authApi.checkSession();
        if (sessionUser) {
          setUser(sessionUser);
        }
      } catch (e: any) {
        // It's normal for this to fail if there's no session
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUserSession();
  }, []);

  const register = async (userData: any) => {
    setError(null);
    try {
      await authApi.register(userData);
      toast({ title: 'Registration Successful', description: 'Please log in with your new account.' });
      router.push('/login');
    } catch (e: any) {
      console.error("Registration error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Registration Error", description: e.message });
    }
  };

  const login = async (credentials: any) => {
    setError(null);
    setLoading(true);
    try {
      const loggedInUser = await authApi.login(credentials);
      setUser(loggedInUser);
      router.push('/account/profile'); // Redirect after successful login
      toast({ title: "Signed In", description: "Successfully signed in." });
    } catch (e: any) {
      console.error("Sign in error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Sign In Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await authApi.logout();
      setUser(null);
      router.push('/login');
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (e: any) {
      console.error("Sign out error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Sign Out Error", description: e.message });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    setError,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
