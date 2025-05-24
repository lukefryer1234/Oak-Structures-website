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
  sendEmailVerification as firebaseSendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  // OAuthProvider, // For PayPal if implemented
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
  // signInWithPayPal: () => Promise<User | null>; 
  sendPasswordReset: (authInstance: Auth, email: string) => Promise<void>;
  sendEmailVerification: (user: User) => Promise<void>;
  isEmailVerified: () => boolean;
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

// This function calls the API endpoint to ensure user data is in Firestore.
async function ensureUserDocumentInFirestore(user: User): Promise<void> {
  if (!user) return;
  try {
    const response = await fetch('/api/createUser', { // Ensure this matches your API route
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send only necessary serializable user data
      body: JSON.stringify({ 
        user: { 
          uid: user.uid, 
          email: user.email, 
          displayName: user.displayName 
        } 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create/update user document in Firestore:', errorData.message);
      // Not throwing here to avoid breaking auth flow, but logging is important.
      // The API route itself should handle retries or critical errors if necessary.
    } else {
      console.log('User document processed successfully in Firestore.');
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
      if (user) {
        // If user logs in or state changes, ensure their doc is in Firestore.
        // This helps sync on first login or if the doc was missed.
        await ensureUserDocumentInFirestore(user);
      }
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe; 
  }, []);

  const signUpWithEmail = async (authInstance: Auth, email: string, pass: string, displayName?: string): Promise<User | null> => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, pass);
      if (userCredential.user && displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      if (userCredential.user) {
        // Send email verification
        await firebaseSendEmailVerification(userCredential.user);
        
        // Call the function to create/verify user document in Firestore
        await ensureUserDocumentInFirestore(userCredential.user);
        
        // Show verification email sent toast
        toast({ 
          title: "Verification Email Sent", 
          description: "Please check your inbox and verify your email address." 
        });
      }
      setCurrentUser(userCredential.user); // Update context state
      return userCredential.user;
    } catch (e: any) {
      console.error("Sign up error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Sign Up Error", description: e.message });
      return null;
    }
  };

  const signInWithEmail = async (authInstance: Auth, email: string, pass: string): Promise<User | null> => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(authInstance, email, pass);
      // Firestore document sync is handled by onAuthStateChanged
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (e: any) {
      console.error("Sign in error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Sign In Error", description: e.message });
      return null;
    }
  };
  
  const sendPasswordReset = async (authInstance: Auth, email: string): Promise<void> => {
    setError(null);
    try {
      await firebaseSendPasswordResetEmail(authInstance, email);
      // Toast for success is handled in the component calling this
    } catch (e: any) {
      console.error("Password reset error:", e);
      setError(e.message);
      throw e; // Re-throw to be caught by the calling component for specific UI updates
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      router.push('/login'); 
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (e: any)      {
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
      // Firestore document sync is handled by onAuthStateChanged
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

  const updateUserProfile = async (user: User, profileData: { displayName?: string; photoURL?: string }) => {
    setError(null);
    try {
      await updateProfile(user, profileData);
      // If display name changed, we should update Firestore too
      if (profileData.displayName && user.email) { // Ensure user.email is not null
        await ensureUserDocumentInFirestore({
            ...user,
            displayName: profileData.displayName,
            // photoURL: profileData.photoURL || user.photoURL, // Keep existing or update
        } as User); // Cast to User to satisfy ensureUserDocumentInFirestore
      }
      // Update context state for current user if it's the same user
      if (currentUser && currentUser.uid === user.uid) {
          setCurrentUser({...user, ...profileData});
      }
      toast({ title: "Profile Updated", description: "Your profile has been updated." });
    } catch (e: any) {
      console.error("Profile update error:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Profile Update Error", description: e.message });
    }
  };
  
  // Function to send email verification
  const sendEmailVerification = async (user: User): Promise<void> => {
    setError(null);
    try {
      await firebaseSendEmailVerification(user);
      toast({ 
        title: "Verification Email Sent", 
        description: "Please check your inbox and verify your email address." 
      });
    } catch (e: any) {
      console.error("Email verification error:", e);
      setError(e.message);
      toast({ 
        variant: "destructive", 
        title: "Email Verification Error", 
        description: e.message 
      });
      throw e;
    }
  };
  
  // Function to check if the current user's email is verified
  const isEmailVerified = (): boolean => {
    if (!currentUser) return false;
    return currentUser.emailVerified;
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
    sendEmailVerification,
    isEmailVerified,
    signOut,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
