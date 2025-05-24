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
  updateProfile, // Added for updating display name
  // OAuthProvider, // For PayPal if implemented
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// List of public paths that don't require authentication
const publicPaths = [
  '/',
  '/products',
  '/about',
  '/contact',
  '/gallery',
  '/faq',
  '/special-deals',
  '/terms',
  '/privacy',
  '/login',
  '/register',
  '/forgot-password',
];

// Check if the current path starts with any of the public paths
const isPublicPath = (path: string): boolean => {
  // Handle product category paths specifically - these should ALWAYS be public
  if (path.startsWith('/products/')) {
    return true;
  }
  
  // Handle gallery and other static content
  if (path.startsWith('/gallery') || path.startsWith('/special-deals')) {
    return true;
  }
  
  return publicPaths.includes(path);
};
};

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
        // Call the function to create/verify user document in Firestore
        await ensureUserDocumentInFirestore(userCredential.user);
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
      
      // Get the current path
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        
        // Only redirect to login if current path is not public
        if (!isPublicPath(currentPath)) {
          router.push('/login');
        }
      } else {
        router.push('/login'); // Fallback if window is not available
      }
      
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
    
    // Add these lines to force account selection and get refresh token
    provider.setCustomParameters({
      prompt: 'select_account',
      access_type: 'offline'
    });
    
    try {
      const result = await signInWithPopup(auth, provider);
      // Firestore document sync is handled by onAuthStateChanged
      setCurrentUser(result.user);
      
      // Get the redirect URL from the URL parameters if available
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || '/account/profile';
        
        // Navigate to the redirect URL
        router.push(redirectUrl);
      } else {
        router.push('/account/profile'); // Fallback if window is not available
      }
      
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
