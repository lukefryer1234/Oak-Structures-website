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
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);
    const users: UserData[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Validate data against schema before returning
      const parsed = firestoreUserSchema.safeParse(data);
      if (parsed.success) {
         users.push({
           id: docSnap.id, // This is the UID
           name: parsed.data.displayName,
           email: parsed.data.email,
           role: parsed.data.role,
           avatarUrl: parsed.data.avatarUrl,
           lastLogin: parsed.data.lastLogin,
           orderCount: parsed.data.orderCount,
         });
      } else {
          console.warn(`User data for ${docSnap.id} failed validation:`, parsed.error.flatten().fieldErrors);
          // Fallback for potentially missing role or other fields
          users.push({
            id: docSnap.id,
            email: data.email || 'N/A',
            role: data.role || 'Customer', // Default role if missing
            name: data.displayName,
            avatarUrl: data.avatarUrl,
          });
      }
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export interface UserMutationState {
  message: string;
  success: boolean;
  errors?: string;
}

export async function updateUserRoleAction(userId: string, newRole: UserRole): Promise<UserMutationState> {
  if (!userId || !newRole) {
    return { message: "User ID and new role are required.", success: false };
  }

  const validatedRole = userRoleSchema.safeParse(newRole);
  if (!validatedRole.success) {
    return { message: "Invalid role specified.", success: false, errors: validatedRole.error.message };
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role: validatedRole.data });
    return { message: "User role updated successfully.", success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { message: "Failed to update user role.", success: false };
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
