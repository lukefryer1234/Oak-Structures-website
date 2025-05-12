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
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  signUpWithEmail: (authInstance: Auth, email: string, pass: string, displayName?: string) => Promise<User | null>;
  signInWithEmail: (authInstance: Auth, email: string, pass: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  sendPasswordReset: (authInstance: Auth, email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (user: User, profileData: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

async function ensureUserDocumentInFirestore(user: User): Promise<void> {
  if (!user) {
    console.warn('ensureUserDocumentInFirestore called with null user.');
    return;
  }
  try {
    console.log(`Attempting to ensure Firestore document for user: ${user.uid}`);
    const response = await fetch('/api/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }
      }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      console.error('Failed to create/update user document in Firestore:', responseData.message);
      // Optionally, you could set a non-critical error state here if needed
    } else {
      console.log('User document processed successfully in Firestore:', responseData.message);
    }
  } catch (error) {
    console.error('Error calling ensureUserDocumentInFirestore API:', error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user ? user.uid : null);
      if (user) {
        await ensureUserDocumentInFirestore(user);
      }
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUpWithEmail = async (authInstance: Auth, email: string, pass: string, displayName?: string): Promise<User | null> => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, pass);
      if (userCredential.user && displayName) {
        await updateProfile(userCredential.user, { displayName });
         // Re-fetch the user to get the updated profile
        const updatedUser = authInstance.currentUser;
        if (updatedUser) {
            await ensureUserDocumentInFirestore(updatedUser);
            setCurrentUser(updatedUser);
        } else {
            // Fallback if currentUser is somehow null after updateProfile
            await ensureUserDocumentInFirestore(userCredential.user);
            setCurrentUser(userCredential.user);
        }
      } else if (userCredential.user) {
        await ensureUserDocumentInFirestore(userCredential.user);
        setCurrentUser(userCredential.user);
      }
      toast({ title: "Registration Successful", description: "Your account has been created." });
      return userCredential.user;
    } catch (e: any) {
      console.error("Sign up error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Sign Up Error", description: e.message });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (authInstance: Auth, email: string, pass: string): Promise<User | null> => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(authInstance, email, pass);
      // ensureUserDocumentInFirestore will be called by onAuthStateChanged
      setCurrentUser(userCredential.user);
      toast({ title: "Login Successful", description: "Welcome back!" });
      return userCredential.user;
    } catch (e: any) {
      console.error("Sign in error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Sign In Error", description: e.message });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (authInstance: Auth, email: string): Promise<void> => {
    setError(null);
    setLoading(true);
    try {
      await firebaseSendPasswordResetEmail(authInstance, email);
      // Success toast handled by calling component
    } catch (e: any) {
      console.error("Password reset error:", e);
      setError(e.message);
      throw e; 
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      router.push('/login');
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (e: any) {
      console.error("Sign out error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Sign Out Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // ensureUserDocumentInFirestore will be called by onAuthStateChanged
      setCurrentUser(result.user);
      toast({ title: "Signed In", description: "Successfully signed in with Google." });
      return result.user;
    } catch (e: any) {
      console.error("Google sign in error:", e);
      if (e.code === 'auth/popup-closed-by-user') {
        toast({ variant: "default", title: "Sign-in Cancelled", description: "Google sign-in was cancelled." });
      } else {
        setError(e.message);
        toast({ variant: "destructive", title: "Google Sign-In Error", description: e.message });
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (user: User, profileData: { displayName?: string; photoURL?: string }) => {
    setError(null);
    setLoading(true);
    try {
      await updateProfile(user, profileData);
      // Re-fetch the user to ensure local state is up-to-date with Auth service
      const updatedUser = auth.currentUser; 
      if (updatedUser) {
        await ensureUserDocumentInFirestore(updatedUser);
         // Update context state for current user if it's the same user
        if (currentUser && currentUser.uid === updatedUser.uid) {
          setCurrentUser(updatedUser);
        }
      }
      toast({ title: "Profile Updated", description: "Your profile has been updated." });
    } catch (e: any) {
      console.error("Profile update error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Profile Update Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    setError,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    signOut,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}