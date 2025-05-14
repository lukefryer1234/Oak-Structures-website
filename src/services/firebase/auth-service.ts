// src/services/firebase/auth-service.ts
import {
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
  getAuth,
  sendEmailVerification,
  confirmPasswordReset,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserRole } from '@/lib/permissions';

// Error handling helper
export class AuthError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

// Helper function to handle Firebase auth errors
function handleAuthError(error: any): never {
  if (error.code) {
    // Map Firebase error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'This email is already registered. Please log in or use a different email.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'No account found with this email. Please check your email or sign up.',
      'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
      'auth/weak-password': 'Password is too weak. Please use a stronger password.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed before completing the sign-in process.',
      'auth/cancelled-popup-request': 'The sign-in popup was cancelled.',
      'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups for this site.',
      'auth/requires-recent-login': 'This operation requires re-authentication. Please log in again before retrying.',
      'auth/invalid-credential': 'The authentication credential is invalid. Please try again.',
      'auth/invalid-verification-code': 'The verification code is invalid. Please try again.',
      'auth/missing-verification-code': 'The verification code is missing. Please try again.',
      'auth/invalid-verification-id': 'The verification ID is invalid. Please try again.',
      'auth/missing-verification-id': 'The verification ID is missing. Please try again.',
      'auth/network-request-failed': 'A network error occurred. Please check your connection and try again.',
    };
    
    const message = errorMessages[error.code] || error.message || 'An authentication error occurred.';
    throw new AuthError(message, error.code);
  }
  
  throw new AuthError(error.message || 'An unknown authentication error occurred.', 'auth/unknown');
}

// Retry functionality for flaky operations
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delayMs = 500): Promise<T> {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      // Don't retry user errors like wrong password
      if (error.code && (
        error.code.includes('auth/wrong-password') || 
        error.code.includes('auth/user-not-found') ||
        error.code.includes('auth/email-already-in-use')
      )) {
        throw error;
      }
      
      // Only retry network errors or emulator connectivity issues
      if (error.code && (
        error.code.includes('network') || 
        error.code.includes('unavailable')
      )) {
        console.warn(`Auth operation failed (attempt ${attempt}/${maxRetries}), retrying...`, error.code);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      
      // Don't retry other errors
      throw error;
    }
  }
  
  // If we get here, all retries have failed
  throw lastError;
}

/**
 * Firebase authentication service
 * Provides methods for common auth operations
 */
export const AuthService = {
  /**
   * Sign up a new user with email and password
   */
  async signUpWithEmail(email: string, password: string): Promise<User> {
    try {
      const result = await withRetry(() => 
        createUserWithEmailAndPassword(auth, email, password)
      );
      
      await sendEmailVerification(result.user);
      return result.user;
    } catch (error) {
      handleAuthError(error);
    }
  },
  
  /**
   * Sign in an existing user with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const result = await withRetry(() => 
        signInWithEmailAndPassword(auth, email, password)
      );
      return result.user;
    } catch (error) {
      handleAuthError(error);
    }
  },
  
  /**
   * Sign in a user with Google
   */
  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });
      
      const result = await withRetry(() => 
        signInWithPopup(auth, provider)
      );
      return result.user;
    } catch (error) {
      handleAuthError(error);
    }
  },
  
  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await withRetry(() => signOut(auth));
    } catch (error) {
      handleAuthError(error);
    }
  },
  
  /**
   * Send a password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await withRetry(() => 
        sendPasswordResetEmail(auth, email)
      );
    } catch (error) {
      handleAuthError(error);
    }
  },
  
  /**
   * Confirm password reset with code and new password
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      await withRetry(() => 
        confirmPasswordReset(auth, code, newPassword)
      );
    } catch (error) {
      handleAuthError(error);
    }
  },
  
  /**
   * Update a user's profile information
   */
  async updateUserProfile(user: User, profile: { displayName?: string; photoURL?: string }): Promise<void> {
    try {
      await withRetry(() => 
        updateProfile(user, profile)
      );
    } catch (error) {
      handleAuthError(error);
    }
  },
  
  /**
   * Update a user's email address
   * Requires recent authentication
   */
  async updateUserEmail(user: User, newEmail: string): Promise<void> {
    try {
      await withRetry(() => 
        updateEmail(user, newEmail)
      );
    } catch (error) {
      handleAuthError(error);
    }
  },
  
  /**
   * Update a user's password
   * Requires recent authentication
   */
  async updateUserPassword(user: User, newPassword: string): Promise<void> {
    try {
      await withRetry(() => 
        updatePassword(user, newPassword)
      );
    } catch (error) {
      handleAuthError(error);
    }
  },
  
  /**
   * Re-authenticate a user with email and password
   * Required for sensitive operations
   */
  async reauthenticateWithPassword(user: User, password: string): Promise<UserCredential> {
    try {
      const credential = EmailAuthProvider.credential(user.email || '', password);
      return await withRetry(() => 
        reauthenticateWithCredential(user, credential)
      );
    } catch (error) {
      handleAuthError(error);
    }
  },
  
  /**
   * Send email verification to the current user
   */
  async sendEmailVerification(user: User): Promise<void> {
    try {
      await withRetry(() => 
        sendEmailVerification(user)
      );
    } catch (error) {
      handleAuthError(error);
    }
  },
  
  /**
   * Get the current user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },
  
  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },
};

export default AuthService;

