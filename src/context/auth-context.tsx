"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Auth,
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  // Uncomment if you add PayPal OAuth
  // OAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Assuming your firebase config is in lib/firebase.ts
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  signUpWithEmail: (authInstance: Auth, email: string, pass: string) => Promise<User | null>;
  signInWithEmail: typeof signInWithEmailAndPassword;
  signInWithGoogle: () => Promise<User | null>;
  // signInWithPayPal: () => Promise<User | null>; // Uncomment if PayPal added
  sendPasswordReset: typeof firebaseSendPasswordResetEmail;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

async function createUserDocument(user: User): Promise<void> {
  if (!user) return;
  try {
    const response = await fetch('/api/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: { uid: user.uid, email: user.email, displayName: user.displayName } }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create user document:', errorData.message);
      throw new Error(errorData.message || 'Failed to create user document');
    }
    console.log('User document created/updated successfully');
  } catch (error) {
    console.error('Error in createUserDocument:', error);
    // Potentially re-throw or handle more gracefully depending on requirements
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const signUpWithEmail = async (authInstance: Auth, email: string, pass: string): Promise<User | null> => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, pass);
      if (userCredential.user) {
        await createUserDocument(userCredential.user);
      }
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (e: any) {
      console.error("Sign up error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Sign Up Error", description: e.message });
      return null;
    }
  };


  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      router.push('/login'); // Redirect to login after sign out
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (e: any) {
      console.error("Sign out error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Sign Out Error", description: e.message });
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await createUserDocument(result.user); // Ensure user doc is created/updated
      }
      setCurrentUser(result.user);
      toast({ title: "Signed In", description: "Successfully signed in with Google." });
      return result.user;
    } catch (e: any) {
      console.error("Google sign in error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Google Sign-In Error", description: e.message });
      return null;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    setError,
    signUpWithEmail,
    signInWithEmail: (authInstance: Auth, email: string, pass: string) => signInWithEmailAndPassword(authInstance, email, pass),
    signInWithGoogle,
    sendPasswordReset: (authInstance: Auth, email: string) => firebaseSendPasswordResetEmail(authInstance, email),
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
