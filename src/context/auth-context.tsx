"use client";

import type { ReactNode, Dispatch, SetStateAction } from "react";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile, // Added for updating display name
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";

import {
  UserRole,
  getEffectiveRole,
  EMAIL_ROLE_OVERRIDES,
} from "@/lib/permissions";

// Extended User type with role property
export interface ExtendedUser extends User {
  isAdmin?: boolean; // Legacy property
  role?: UserRole | string; // Using our standardized UserRole enum
  effectiveRole?: UserRole; // The computed role after applying overrides
}

interface AuthContextType {
  currentUser: ExtendedUser | null;
  loading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  updateUserProfile: (
    user: User,
    profileData: { displayName?: string; photoURL?: string },
  ) => Promise<void>;
  isUserAdmin: () => boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// This function calls the API endpoint to ensure user data is in Firestore.
async function ensureUserDocumentInFirestore(user: User): Promise<void> {
  if (!user) return;
  try {
    const response = await fetch("/api/createUser", {
      // Ensure this matches your API route
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Send only necessary serializable user data
      body: JSON.stringify({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Failed to create/update user document in Firestore:",
        errorData.message,
      );
      // Not throwing here to avoid breaking auth flow, but logging is important.
      // The API route itself should handle retries or critical errors if necessary.
    } else {
      console.log("User document processed successfully in Firestore.");
    }
  } catch (error) {
    console.error("Error calling ensureUserDocumentInFirestore API:", error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Get the user's role with all overrides applied
  const getEffectiveUserRole = (user: ExtendedUser | null): UserRole => {
    if (!user) return UserRole.GUEST;

    // Check for special email overrides first
    if (user.email && EMAIL_ROLE_OVERRIDES[user.email]) {
      console.log(
        `[PERMISSIONS] Role override applied for ${user.email}: ${EMAIL_ROLE_OVERRIDES[user.email]}`,
      );
      return EMAIL_ROLE_OVERRIDES[user.email];
    }

    // Get the effective role from permissions system
    const role = getEffectiveRole(user.email || null, user.role || null);

    return role;
  };

  // Update user with role information
  const updateUserWithRole = async (user: User): Promise<ExtendedUser> => {
    const extendedUser = user as ExtendedUser;

    try {
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        extendedUser.role = userDoc.data().role || "Customer";
      } else {
        extendedUser.role = "Customer";
      }
    } catch (error) {
      console.error("Error getting user role from Firestore:", error);
      extendedUser.role = "Customer";
    }

    // Apply role overrides
    const effectiveRole = getEffectiveUserRole(extendedUser);
    extendedUser.effectiveRole = effectiveRole;

    // Set admin flag for backward compatibility
    extendedUser.isAdmin =
      effectiveRole === UserRole.ADMIN ||
      effectiveRole === UserRole.SUPER_ADMIN;

    console.log(
      `User ${user.email} has role ${extendedUser.role}, effective role: ${effectiveRole}`,
    );

    return extendedUser;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If user logs in or state changes, ensure their doc is in Firestore.
        await ensureUserDocumentInFirestore(user);

        // Update user with role information
        const extendedUser = await updateUserWithRole(user);
        setCurrentUser(extendedUser);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [updateUserWithRole, ensureUserDocumentInFirestore]); // Added missing dependencies

  const signOut = async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      router.push("/login");
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (e: FirebaseError | unknown) {
      const errorMessage = e instanceof FirebaseError ? e.message : 'An unknown error occurred';
      console.error("Sign out error:", e);
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: errorMessage,
      });
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    setError(null);

    // Configure the Google provider with better options
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account", // Forces account selection even when only one account is available
      // You can add additional parameters as needed
    });

    try {
      const result = await signInWithPopup(auth, provider);

      // Update user with role information
      const extendedUser = await updateUserWithRole(result.user);
      setCurrentUser(extendedUser);

      toast({
        title: "Signed In",
        description: "Successfully signed in with Google.",
      });
      return result.user;
    } catch (e: FirebaseError | unknown) {
      console.error("Google sign in error:", e);
      
      if (e instanceof FirebaseError) {
        console.error("Error code:", e.code);
        
        // Specific error handling for API key issues
        if (
          e.code === "auth/invalid-api-key" ||
          e.code === "auth/key-not-valid"
        ) {
          const errorMsg =
            "There's an issue with the site configuration. Please contact support.";
          setError(errorMsg);
          toast({
            variant: "destructive",
            title: "Configuration Error",
            description: errorMsg,
          });
        } else if (e.code === "auth/popup-blocked") {
          const errorMsg =
            "Please allow popups for this site to use Google sign-in.";
          setError(errorMsg);
          toast({
            variant: "destructive",
            title: "Popup Blocked",
            description: errorMsg,
          });
        } else if (e.code === "auth/cancelled-popup-request") {
          // User closed the popup, don't show an error
          console.log("User closed the login popup");
          return null;
        } else {
          // Handle all other errors
          setError(e.message);
          toast({
            variant: "destructive",
            title: "Google Sign-In Error",
            description: e.message,
          });
        }
      } else {
        // Handle non-Firebase errors
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Google Sign-In Error",
          description: errorMessage,
        });
      }
      return null;
    }
  };

  const updateUserProfile = async (
    user: User,
    profileData: { displayName?: string; photoURL?: string },
  ) => {
    setError(null);
    try {
      await updateProfile(user, profileData);
      // If display name changed, we should update Firestore too
      if (profileData.displayName && user.email) {
        // Ensure user.email is not null
        await ensureUserDocumentInFirestore({
          ...user,
          displayName: profileData.displayName,
          // photoURL: profileData.photoURL || user.photoURL, // Keep existing or update
        } as User); // Cast to User to satisfy ensureUserDocumentInFirestore
      }

      // Update current user and apply role information
      if (currentUser && currentUser.uid === user.uid) {
        const updatedUser = { ...user, ...profileData } as ExtendedUser;
        const extendedUser = await updateUserWithRole(updatedUser);
        setCurrentUser(extendedUser);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated.",
      });
    } catch (e: FirebaseError | unknown) {
      const errorMessage = e instanceof FirebaseError ? e.message : e instanceof Error ? e.message : 'An unknown error occurred';
      console.error("Profile update error:", e);
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Profile Update Error",
        description: errorMessage,
      });
    }
  };

  // Function to check if current user is an admin
  const isUserAdmin = () => {
    if (!currentUser) return false;

    // Use the effectiveRole that's already been computed
    if (currentUser.effectiveRole) {
      return (
        currentUser.effectiveRole === UserRole.ADMIN ||
        currentUser.effectiveRole === UserRole.SUPER_ADMIN
      );
    }

    // Or compute it again if needed
    const effectiveRole = getEffectiveUserRole(currentUser);
    return (
      effectiveRole === UserRole.ADMIN || effectiveRole === UserRole.SUPER_ADMIN
    );
  };

  // Function to manually refresh user data from Firestore
  const refreshUserData = async () => {
    if (!currentUser) return;

    try {
      const updatedUser = await updateUserWithRole(currentUser);
      setCurrentUser(updatedUser);
      console.log("User data refreshed from Firestore");
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    setError,
    signInWithGoogle,
    signOut,
    updateUserProfile,
    isUserAdmin,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
