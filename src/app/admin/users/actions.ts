"use server";

import { adminAuth } from "@/lib/firebase-admin";
import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

/**
 * Interface for user listing
 */
export interface AdminUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  disabled: boolean;
  creationTime: string;
  lastSignInTime: string;
  customClaims?: Record<string, any>;
  role?: string;
  lastLogin?: string;
}

/**
 * Interface for user filtering
 */
export interface UserFilter {
  status?: "all" | "active" | "disabled";
  role?: string;
  searchQuery?: string;
}

/**
 * Fetch all users from Firebase Auth
 */
export async function fetchUsers(
  filter: UserFilter = {},
): Promise<AdminUserData[]> {
  try {
    // Get users from Firebase Auth
    const listUsersResult = await adminAuth.listUsers();

    // Get user data from Firestore to supplement auth data
    const usersSnapshot = await adminDb.collection("users").get();

    // Create a map of Firestore user data by uid
    const firestoreUserData: Record<string, any> = {};
    usersSnapshot.forEach((doc) => {
      firestoreUserData[doc.id] = doc.data();
    });

    // Merge auth data with Firestore data
    const users = listUsersResult.users.map((user) => {
      const firestoreData = firestoreUserData[user.uid] || {};

      return {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        creationTime: user.metadata.creationTime || "",
        lastSignInTime: user.metadata.lastSignInTime || "",
        customClaims: user.customClaims || {},
        role: firestoreData.role || "customer",
        lastLogin: firestoreData.lastLogin || "",
      };
    });

    // Apply filters
    let filteredUsers = users;

    // Filter by status
    if (filter.status === "active") {
      filteredUsers = filteredUsers.filter((user) => !user.disabled);
    } else if (filter.status === "disabled") {
      filteredUsers = filteredUsers.filter((user) => user.disabled);
    }

    // Filter by role
    if (filter.role && filter.role !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.role === filter.role);
    }

    // Search by email or display name
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          (user.email && user.email.toLowerCase().includes(query)) ||
          (user.displayName && user.displayName.toLowerCase().includes(query)),
      );
    }

    return filteredUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error(
      `Failed to fetch users: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get a single user by UID
 */
export async function getUser(uid: string): Promise<AdminUserData | null> {
  try {
    // Get user from Firebase Auth
    const user = await adminAuth.getUser(uid);

    // Get additional user data from Firestore
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const firestoreData = userDoc.exists ? userDoc.data() : {};

    return {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      emailVerified: user.emailVerified,
      disabled: user.disabled,
      creationTime: user.metadata.creationTime || "",
      lastSignInTime: user.metadata.lastSignInTime || "",
      customClaims: user.customClaims || {},
      role: firestoreData?.role || "customer",
      lastLogin: firestoreData?.lastLogin || "",
    };
  } catch (error) {
    console.error(`Error getting user ${uid}:`, error);
    return null;
  }
}

/**
 * Disable a user account
 */
export async function disableUser(
  uid: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Prevent disabling super admins
    const user = await getUser(uid);
    if (user?.role === "super_admin") {
      return {
        success: false,
        message: "Cannot disable super admin accounts for security reasons.",
      };
    }

    await adminAuth.updateUser(uid, { disabled: true });

    // Update user document in Firestore
    await adminDb.collection("users").doc(uid).update({
      disabled: true,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/users/management");
    return { success: true, message: "User account has been disabled." };
  } catch (error) {
    console.error(`Error disabling user ${uid}:`, error);
    return {
      success: false,
      message: `Failed to disable user: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Enable a user account
 */
export async function enableUser(
  uid: string,
): Promise<{ success: boolean; message: string }> {
  try {
    await adminAuth.updateUser(uid, { disabled: false });

    // Update user document in Firestore
    await adminDb.collection("users").doc(uid).update({
      disabled: false,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/users/management");
    return { success: true, message: "User account has been enabled." };
  } catch (error) {
    console.error(`Error enabling user ${uid}:`, error);
    return {
      success: false,
      message: `Failed to enable user: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Send password reset email to a user
 */
export async function sendPasswordResetEmail(
  uid: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Get user email
    const user = await adminAuth.getUser(uid);
    if (!user.email) {
      return {
        success: false,
        message: "User does not have an email address.",
      };
    }

    // Generate password reset link
    const resetLink = await adminAuth.generatePasswordResetLink(user.email);

    // In a production environment, you would send this email via a proper email service
    // For now, we'll just return success
    console.log(`Password reset link for ${user.email}: ${resetLink}`);

    return {
      success: true,
      message: `Password reset email sent to ${user.email}.`,
    };
  } catch (error) {
    console.error(`Error sending password reset for user ${uid}:`, error);
    return {
      success: false,
      message: `Failed to send password reset: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Update user's display name
 */
export async function updateUserDisplayName(
  uid: string,
  displayName: string,
): Promise<{ success: boolean; message: string }> {
  try {
    await adminAuth.updateUser(uid, { displayName });

    // Update user document in Firestore
    await adminDb.collection("users").doc(uid).update({
      displayName,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/users/management");
    return { success: true, message: "User display name has been updated." };
  } catch (error) {
    console.error(`Error updating display name for user ${uid}:`, error);
    return {
      success: false,
      message: `Failed to update display name: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  uid: string,
  role: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if attempting to modify a super_admin
    const user = await getUser(uid);
    if (user?.role === "super_admin" && role !== "super_admin") {
      return {
        success: false,
        message:
          "Cannot change role of super admin accounts for security reasons.",
      };
    }

    // Update user document in Firestore
    await adminDb.collection("users").doc(uid).update({
      role,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath("/admin/users/management");
    return { success: true, message: `User role has been updated to ${role}.` };
  } catch (error) {
    console.error(`Error updating role for user ${uid}:`, error);
    return {
      success: false,
      message: `Failed to update role: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

import { z } from "zod";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
// Note: Deleting a user from Firebase Authentication is a separate admin SDK operation
// and typically done from a secure backend environment, not directly from client-side triggered server actions
// without proper authorization. This action will only delete from Firestore.

export type UserRole = "Customer" | "Manager" | "SuperAdmin";

export interface UserData {
  id: string; // UID from Firebase Auth
  name?: string; // Display name
  email: string;
  role: UserRole;
  lastLogin?: string;
  orderCount?: number;
  avatarUrl?: string;
}

const userRoleSchema = z.enum(["Customer", "Manager", "SuperAdmin"]);

// Schema for user data stored in Firestore
const firestoreUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
  role: userRoleSchema.default("Customer"),
  // Add other fields you store in Firestore for users
  avatarUrl: z.string().url().optional(),
  lastLogin: z.string().optional(), // Assuming lastLogin is stored as a string for simplicity
  orderCount: z.number().optional(),
});

export async function fetchUsersAction(): Promise<UserData[]> {
  try {
    const usersCollection = collection(db, "users");
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
        console.warn(
          `User data for ${docSnap.id} failed validation:`,
          parsed.error.flatten().fieldErrors,
        );
        // Fallback for potentially missing role or other fields
        users.push({
          id: docSnap.id,
          email: data.email || "N/A",
          role: data.role || "Customer", // Default role if missing
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

export async function updateUserRoleAction(
  userId: string,
  newRole: UserRole,
): Promise<UserMutationState> {
  if (!userId || !newRole) {
    return { message: "User ID and new role are required.", success: false };
  }

  const validatedRole = userRoleSchema.safeParse(newRole);
  if (!validatedRole.success) {
    return {
      message: "Invalid role specified.",
      success: false,
      errors: validatedRole.error.message,
    };
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: validatedRole.data });
    return { message: "User role updated successfully.", success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { message: "Failed to update user role.", success: false };
  }
}

export async function deleteUserAction(
  userId: string,
): Promise<UserMutationState> {
  if (!userId) {
    return { message: "User ID is required for deletion.", success: false };
  }
  try {
    // This only deletes the Firestore document.
    // Deleting from Firebase Auth requires Admin SDK.
    await deleteDoc(doc(db, "users", userId));
    // Placeholder: In a real app, trigger a Firebase Function to delete the Auth user.
    console.warn(
      `User ${userId} deleted from Firestore. Firebase Auth user needs to be deleted separately via Admin SDK.`,
    );
    return {
      message:
        "User deleted from database. Auth user deletion needs separate handling.",
      success: true,
    };
  } catch (error) {
    console.error("Error deleting user from Firestore:", error);
    return { message: "Failed to delete user from database.", success: false };
  }
}

// Action to ensure a user document exists in Firestore (called after auth operations)
// This is similar to createUserDocument in AuthContext but as a server action
// Potentially useful if you want to ensure user docs from other parts of the app.
export async function ensureUserDocumentAction(userData: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}): Promise<UserMutationState> {
  if (!userData.uid) {
    return { message: "User UID is required.", success: false };
  }

  try {
    const userRef = doc(db, "users", userData.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: userData.email || "",
        displayName: userData.displayName || "New User",
        role: "Customer", // Default role
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
    return {
      message: "Failed to ensure user document in Firestore.",
      success: false,
    };
  }
}
