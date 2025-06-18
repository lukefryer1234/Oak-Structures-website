'use server';

import { z } from 'zod';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore imports reduced as some actions were removed
import { db } from '@/lib/firebase';
// Note: Deleting a user from Firebase Authentication is a separate admin SDK operation
// and typically done from a secure backend environment, not directly from client-side triggered server actions
// without proper authorization. This action will only delete from Firestore.

export type UserRole = 'Customer' | 'Manager' | 'SuperAdmin';

const userRoleSchema = z.enum(['Customer', 'Manager', 'SuperAdmin']);

export interface UserMutationState {
  message: string;
  success: boolean;
  errors?: string;
}

// Action to ensure a user document exists in Firestore (called after auth operations)
// This is similar to createUserDocument in AuthContext but as a server action
// Potentially useful if you want to ensure user docs from other parts of the app.
/**
 * @deprecated Prefer using the API route POST /api/users/ensure-document
 */
export async function ensureUserDocumentAction(userData: { uid: string; email?: string | null; displayName?: string | null }): Promise<UserMutationState> {
  console.warn("DEPRECATED: ensureUserDocumentAction is called. Use POST /api/users/ensure-document instead.");
  if (!userData.uid) {
    return { message: "User UID is required.", success: false };
  }

  try {
    const userRef = doc(db, 'users', userData.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: userData.email || "",
        displayName: userData.displayName || "New User",
        role: 'Customer', // Default role
        createdAt: new Date().toISOString(), // Add a creation timestamp
      });
      return { message: "User document created in Firestore.", success: true };
    }
    // Optionally update existing user document if displayName or email changed
    // else {
    //   await updateDoc(userRef, {
    //     email: userData.email,
    //     displayName: userData.displayName
    //   });
    //   return { message: "User document already exists.", success: true };
    // }
    return { message: "User document already exists.", success: true };


  } catch (error) {
    console.error("Error ensuring user document:", error);
    return { message: "Failed to ensure user document in Firestore.", success: false };
  }
}
