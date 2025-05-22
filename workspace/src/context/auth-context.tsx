
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
  // OAuthProvider, // For PayPal if implemented
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Ensure db is imported if used here, or remove if not
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; // For ensureUserDocumentInFirestore

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<User | null>;
  signInWithEmail: (email: string, pass: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  sendPasswordReset: (email: string) => Promise<void>;
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

// This function calls the API endpoint or directly interacts with Firestore.
// For direct Firestore interaction from client-side (like in AuthProvider), ensure rules allow it.
// Or, keep it as an API call as previously implemented if preferred for security/centralization.
async function ensureUserDocumentInFirestore(user: User): Promise<void> {
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const userDataToSet: { email: string; displayName: string; role?: string; createdAt?: any; lastLogin?: any } = {
      email: user.email || "",
      displayName: user.displayName || "New User",
    };

    if (userSnap.exists()) {
      const existingData = userSnap.data();
      if (user.displayName && user.displayName !== existingData.displayName) {
        userDataToSet.displayName = user.displayName;
      }
      if (user.email && user.email !== existingData.email) {
         userDataToSet.email = user.email;
      }
      // Add lastLogin timestamp on update/ensure
      userDataToSet.lastLogin = serverTimestamp();
      await setDoc(userRef, userDataToSet, { merge: true });
      console.log(`User document for ${user.uid} updated/ensured in Firestore.`);
    } else {
      userDataToSet.role = 'Customer'; // Default role
      userDataToSet.createdAt = serverTimestamp();
      userDataToSet.lastLogin = serverTimestamp();
      await setDoc(userRef, userDataToSet);
      console.log(`Created new user document for ${user.uid} in Firestore.`);
    }
  } catch (error: unknown) {
    console.error('Error ensuring user document in Firestore (AuthContext):', error);
    // Optionally, rethrow or set an error state if this is critical for auth flow
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
        await ensureUserDocumentInFirestore(user);
      }
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUpWithEmail = async (email: string, pass: string, displayName?: string): Promise<User | null> => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user && displayName) {
        await updateProfile(userCredential.user, { displayName });
        // Ensure Firestore document is created/updated with new display name
        await ensureUserDocumentInFirestore({ ...userCredential.user, displayName });
      } else if (userCredential.user) {
        await ensureUserDocumentInFirestore(userCredential.user);
      }
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (e: unknown) {
      console.error("Sign up error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during sign up.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Sign Up Error", description: errorMessage });
      return null;
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User | null> => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      // Firestore document sync (like lastLogin) is handled by onAuthStateChanged -> ensureUserDocumentInFirestore
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (e: unknown) {
      console.error("Sign in error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during sign in.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Sign In Error", description: errorMessage });
      return null;
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    setError(null);
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (e: unknown) {
      console.error("Password reset error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during password reset.";
      setError(errorMessage);
      throw new Error(errorMessage); // Re-throw to be caught by the calling component
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      router.push('/login');
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (e: unknown)      {
      console.error("Sign out error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during sign out.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Sign Out Error", description: errorMessage });
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Firestore document sync is handled by onAuthStateChanged -> ensureUserDocumentInFirestore
      setCurrentUser(result.user);
      toast({ title: "Signed In", description: "Successfully signed in with Google." });
      return result.user;
    } catch (e: unknown) {
      console.error("Google sign in error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during Google sign-in.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Google Sign-In Error", description: errorMessage });
      return null;
    }
  };

  const updateUserProfile = async (user: User, profileData: { displayName?: string; photoURL?: string }) => {
    setError(null);
    try {
      await updateProfile(user, profileData);
      const updatedUserFields: Partial<User> = {};
      if (profileData.displayName) updatedUserFields.displayName = profileData.displayName;
      if (profileData.photoURL) updatedUserFields.photoURL = profileData.photoURL;

      // Ensure Firestore document is updated with new profile data
      await ensureUserDocumentInFirestore({ ...user, ...updatedUserFields } as User);

      if (currentUser && currentUser.uid === user.uid) {
          setCurrentUser(prevUser => prevUser ? ({...prevUser, ...updatedUserFields}) : null);
      }
      toast({ title: "Profile Updated", description: "Your profile has been updated." });
    } catch (e: unknown) {
      console.error("Profile update error:", e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during profile update.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Profile Update Error", description: errorMessage });
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

    