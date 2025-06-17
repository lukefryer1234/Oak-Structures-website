'use server';

import { z } from 'zod';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// Note: Deleting a user from Firebase Authentication is a separate admin SDK operation
// and typically done from a secure backend environment, not directly from client-side triggered server actions
// without proper authorization. This action will only delete from Firestore.

export type UserRole = 'Customer' | 'Manager' | 'SuperAdmin';

export interface UserData {
  id: string; // UID from Firebase Auth
  name?: string; // Display name
  email: string;
  role: UserRole;
  lastLogin?: string;
  orderCount?: number;
  avatarUrl?: string;
}

const userRoleSchema = z.enum(['Customer', 'Manager', 'SuperAdmin']);

// Schema for user data stored in Firestore
const firestoreUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
  role: userRoleSchema.default('Customer'),
  // Add other fields you store in Firestore for users
  avatarUrl: z.string().url().optional(),
  lastLogin: z.string().optional(), // Assuming lastLogin is stored as a string for simplicity
  orderCount: z.number().optional(),
});


export async function fetchUsersAction(): Promise<UserData[]> {
  try {
    // Determine the base URL for server-side fetches
    // Use NEXT_PUBLIC_APP_URL for deployed environments, fallback to localhost for dev.
    // Ensure this var is set in your Vercel/deployment env.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    const response = await fetch(`${appUrl}/api/admin/users/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Server-side fetch can have different caching.
      // 'no-store' ensures fresh data, but consider 'default' or revalidation strategies.
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorDetails = "No error details from API.";
      try {
        const errorData = await response.json(); // Try to parse JSON error from API
        errorDetails = errorData.details || errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorDetails = await response.text(); // Fallback to raw text if not JSON
      }
      console.error(`API responded with ${response.status}: ${errorDetails}`);
      throw new Error(`Failed to fetch users: API responded with ${response.status}. Details: ${errorDetails}`);
    }

    const users: UserData[] = await response.json();
    return users;
  } catch (error) {
    // Log the error with more context if possible
    if (error instanceof Error) {
      console.error("Error in fetchUsersAction calling API route:", error.message, error.stack);
    } else {
      console.error("Unknown error in fetchUsersAction calling API route:", error);
    }
    return []; // Return empty array on error, consistent with original behavior
  }
}

export interface UserMutationState {
  message: string;
  success: boolean;
  errors?: string;
}

export async function updateUserRoleAction(userId: string, newRole: UserRole): Promise<UserMutationState> {
  if (!userId || !newRole) {
    return { success: false, message: "User ID and new role are required." };
  }

  // Optional: Basic client-side type check for role before sending to API,
  // though the API route will perform the robust Zod validation.
  const validRoles: UserRole[] = ['Customer', 'Manager', 'SuperAdmin'];
  if (!validRoles.includes(newRole)) {
      return { success: false, message: `Invalid role specified in action. Must be one of: ${validRoles.join(', ')}`};
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:9002' : 'https://your-production-url.com'); // Replace with actual prod URL
    const apiUrl = `${appUrl}/api/admin/users/${userId}/role`;

    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: newRole }),
    });

    let result: UserMutationState;
    try {
        result = await response.json();
    } catch (e) {
        const responseText = await response.text();
        console.error(`Error updating role for user ${userId} via API: Non-JSON response ${response.status} ${response.statusText} - Body: ${responseText}`);
        return {
            success: false,
            message: `Failed to update role: API returned non-JSON response (${response.status}). Check server logs.`
        };
    }

    if (!response.ok) {
      // Log the detailed error message from the API if available
      console.error(`Error updating role for user ${userId} via API: ${response.status} - ${result.message}${result.errors ? ' Errors: ' + result.errors : ''}`);
      // Return the result from the API, which should already be in UserMutationState format
      return result;
    }

    return result; // This should be { success: true, message: "..." } from the API

  } catch (error) {
    console.error(`Error in updateUserRoleAction calling API for user ${userId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `An unexpected error occurred: ${errorMessage}` };
  }
}

export async function deleteUserAction(userId: string): Promise<UserMutationState> {
  if (!userId) {
    return { message: "User ID is required for deletion.", success: false };
  }
  try {
    // This only deletes the Firestore document.
    // Deleting from Firebase Auth requires Admin SDK.
    await deleteDoc(doc(db, 'users', userId));
    // Placeholder: In a real app, trigger a Firebase Function to delete the Auth user.
    console.warn(`User ${userId} deleted from Firestore. Firebase Auth user needs to be deleted separately via Admin SDK.`);
    return { message: "User deleted from database. Auth user deletion needs separate handling.", success: true };
  } catch (error) {
    console.error("Error deleting user from Firestore:", error);
    return { message: "Failed to delete user from database.", success: false };
  }
}

// Action to ensure a user document exists in Firestore (called after auth operations)
// This is similar to createUserDocument in AuthContext but as a server action
// Potentially useful if you want to ensure user docs from other parts of the app.
export async function ensureUserDocumentAction(userData: { uid: string; email?: string | null; displayName?: string | null }): Promise<UserMutationState> {
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
