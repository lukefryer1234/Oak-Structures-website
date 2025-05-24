"use server";

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

// Type definitions
export interface Address {
  id: string;
  userId: string;
  type: "Billing" | "Shipping" | "Both";
  isDefault: boolean;
  line1: string;
  line2?: string;
  town: string;
  county?: string;
  postcode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  type: "Billing" | "Shipping" | "Both";
  isDefault: boolean;
  line1: string;
  line2?: string;
  town: string;
  county?: string;
  postcode: string;
  country: string;
}

/**
 * Fetches all addresses for a specific user
 */
export async function getUserAddresses(userId: string): Promise<Address[]> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const addressesQuery = query(
      collection(db, "userAddresses"),
      where("userId", "==", userId),
    );

    const snapshot = await getDocs(addressesQuery);
    const addresses: Address[] = [];

    snapshot.forEach((doc) => {
      addresses.push({
        id: doc.id,
        ...doc.data(),
      } as Address);
    });

    // Sort by default status (default addresses first) and then by type
    return addresses.sort((a, b) => {
      if (a.isDefault === b.isDefault) {
        return a.type.localeCompare(b.type);
      }
      return a.isDefault ? -1 : 1;
    });
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    throw error;
  }
}

/**
 * Adds a new address for a user
 */
export async function addUserAddress(
  userId: string,
  addressData: AddressInput,
): Promise<string> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // If this is set as a default address, unset any other default addresses of the same type
    if (addressData.isDefault) {
      await updateExistingDefaultAddresses(userId, addressData.type);
    }

    const now = new Date().toISOString();

    const newAddress = {
      userId,
      ...addressData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, "userAddresses"), newAddress);
    return docRef.id;
  } catch (error) {
    console.error("Error adding user address:", error);
    throw error;
  }
}

/**
 * Updates an existing address
 */
export async function updateUserAddress(
  addressId: string,
  userId: string,
  addressData: AddressInput,
): Promise<void> {
  try {
    if (!addressId || !userId) {
      throw new Error("Address ID and User ID are required");
    }

    // Verify the address belongs to the user
    const addressRef = doc(db, "userAddresses", addressId);
    const addressDoc = await getDoc(addressRef);

    if (!addressDoc.exists()) {
      throw new Error("Address not found");
    }

    const existingAddress = addressDoc.data();
    if (existingAddress.userId !== userId) {
      throw new Error("You do not have permission to update this address");
    }

    // If being set as default, update other default addresses
    if (addressData.isDefault) {
      await updateExistingDefaultAddresses(userId, addressData.type);
    }

    // Update the address
    await updateDoc(addressRef, {
      ...addressData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating user address:", error);
    throw error;
  }
}

/**
 * Deletes a user address
 */
export async function deleteUserAddress(
  addressId: string,
  userId: string,
): Promise<void> {
  try {
    if (!addressId || !userId) {
      throw new Error("Address ID and User ID are required");
    }

    // Verify the address belongs to the user
    const addressRef = doc(db, "userAddresses", addressId);
    const addressDoc = await getDoc(addressRef);

    if (!addressDoc.exists()) {
      throw new Error("Address not found");
    }

    const existingAddress = addressDoc.data();
    if (existingAddress.userId !== userId) {
      throw new Error("You do not have permission to delete this address");
    }

    // Delete the address
    await deleteDoc(addressRef);
  } catch (error) {
    console.error("Error deleting user address:", error);
    throw error;
  }
}

/**
 * Helper function to update existing default addresses when setting a new default
 */
async function updateExistingDefaultAddresses(
  userId: string,
  addressType: AddressInput["type"],
): Promise<void> {
  try {
    let addressQuery;

    if (addressType === "Both") {
      // If the new default is 'Both', unset default for all types
      addressQuery = query(
        collection(db, "userAddresses"),
        where("userId", "==", userId),
        where("isDefault", "==", true),
      );
    } else {
      // Otherwise, only unset defaults of the same type or 'Both' type
      addressQuery = query(
        collection(db, "userAddresses"),
        where("userId", "==", userId),
        where("isDefault", "==", true),
        where("type", "in", [addressType, "Both"]),
      );
    }

    const snapshot = await getDocs(addressQuery);

    const updates = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, {
        isDefault: false,
        updatedAt: new Date().toISOString(),
      }),
    );

    await Promise.all(updates);
  } catch (error) {
    console.error("Error updating existing default addresses:", error);
    throw error;
  }
}
