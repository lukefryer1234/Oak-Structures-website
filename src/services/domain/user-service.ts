// src/services/domain/user-service.ts

import { z } from "zod";
import { FirestoreService } from "../firebase/firestore-service";
import { CustomError, handleError } from "@/lib/error-utils";

// Schema definitions
export const UserRoleSchema = z.enum([
  "USER",
  "ADMIN",
  "EDITOR",
  "Customer",
  "Manager",
  "SuperAdmin"
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  uid: z.string().optional(), // UID from Firebase Auth, may be same as id
  email: z.string().email(),
  displayName: z.string().nullish(),
  photoURL: z.string().url().nullish(),
  role: UserRoleSchema.default("USER"),
  lastLogin: z.string().optional(), // ISO date string
  orderCount: z.number().int().optional(),
  avatarUrl: z.string().url().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  disabled: z.boolean().optional(),
  // Addresses will be a subcollection, so not directly on UserSchema for main user doc.
  // Default billing/shipping address IDs could be stored here if desired.
  // defaultBillingAddressId: z.string().optional(),
  // defaultShippingAddressId: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Address Schemas
export const AddressTypeSchema = z.enum(["Billing", "Shipping", "Both"]);
export type AddressType = z.infer<typeof AddressTypeSchema>;

export const AddressSchema = z.object({
  id: z.string(), // Firestore document ID from the subcollection
  // userId: z.string(), // Implicit from subcollection path users/{userId}/addresses
  type: AddressTypeSchema,
  isDefault: z.boolean().default(false),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  addressLine1: z.string().min(1, "Address Line 1 is required"),
  addressLine2: z.string().optional(),
  town: z.string().min(1, "Town/City is required"),
  county: z.string().optional(),
  postcode: z.string().min(1, "Postcode is required"), // Basic validation, can be improved
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Address = z.infer<typeof AddressSchema>;

export const CreateAddressDataSchema = AddressSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
export type CreateAddressData = z.infer<typeof CreateAddressDataSchema>;

export const UpdateAddressDataSchema = CreateAddressDataSchema.partial();
export type UpdateAddressData = z.infer<typeof UpdateAddressDataSchema>;


// Input schemas for update operations
export const UpdateUserInputSchema = UserSchema.partial().omit({
  id: true,
  uid: true,
  createdAt: true,
  updatedAt: true,
  email: true // Email shouldn't be updated here
});

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;

// Get Users Params
export const GetUsersParamsSchema = z.object({
  role: UserRoleSchema.optional(),
  limit: z.number().int().positive().optional(),
  startAfter: z.string().optional(),
  disabled: z.boolean().optional(),
  searchQuery: z.string().optional(),
});

export type GetUsersParams = z.infer<typeof GetUsersParamsSchema>;

/**
 * Domain service for user operations
 */
class UserService {
  private firestoreService: FirestoreService;
  private readonly collectionName = "users";

  constructor() {
    this.firestoreService = new FirestoreService();
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<User | null> {
    try {
      const userData = await this.firestoreService.getDocument(
        this.collectionName,
        id
      );

      if (!userData) {
        return null;
      }

      // Validate the data against our schema
      const user = UserSchema.parse({
        id,
        ...userData,
      });

      return user;
    } catch (error) {
      throw handleError(
        error,
        "Failed to retrieve user",
        "UserService.getUser"
      );
    }
  }

  /**
   * Get users with optional filtering
   */
  async getUsers(params: GetUsersParams = {}): Promise<{
    users: User[];
    lastDoc: any | null;
  }> {
    try {
      // Validate params
      const validParams = GetUsersParamsSchema.parse(params);
      
      // Build query constraints
      const constraints: any[] = [];
      
      if (validParams.role) {
        constraints.push(["role", "==", validParams.role]);
      }
      
      if (validParams.disabled !== undefined) {
        constraints.push(["disabled", "==", validParams.disabled]);
      }
      
      // Always sort by creation date, descending
      constraints.push(["createdAt", "desc"]);

      // Execute the query
      const { documents: userDocs, lastDoc } = await this.firestoreService.getDocuments(
        this.collectionName,
        constraints,
        validParams.limit || 50,
        validParams.startAfter ? { 
          field: "createdAt", 
          direction: "desc", 
          value: validParams.startAfter 
        } : undefined
      );

      // Map and validate documents
      const users: User[] = [];
      
      for (const doc of userDocs) {
        try {
          // If searchQuery is provided, filter by displayName or email
          if (validParams.searchQuery) {
            const query = validParams.searchQuery.toLowerCase();
            const email = doc.email?.toLowerCase() || '';
            const name = doc.displayName?.toLowerCase() || '';
            
            if (!email.includes(query) && !name.includes(query)) {
              continue;
            }
          }
          
          const user = UserSchema.parse({
            id: doc.id,
            ...doc,
          });
          users.push(user);
        } catch (e) {
          console.error(`Invalid user document ${doc.id}:`, e);
          // Skip invalid documents
        }
      }

      return { users, lastDoc };
    } catch (error) {
      throw handleError(
        error,
        "Failed to retrieve users",
        "UserService.getUsers"
      );
    }
  }

  /**
   * Update a user's role
   */
  async updateUserRole(id: string, role: UserRole): Promise<User> {
    try {
      // Validate the role
      const validRole = UserRoleSchema.parse(role);
      
      // Get current user to make sure it exists
      const existingUser = await this.getUser(id);
      
      if (!existingUser) {
        throw new CustomError("User not found", "NOT_FOUND");
      }

      // Prevent modifying super admins
      if (existingUser.role === "SuperAdmin" && role !== "SuperAdmin") {
        throw new CustomError(
          "Cannot change role of super admin accounts for security reasons",
          "FORBIDDEN"
        );
      }
      
      // Update the user
      const updateData = {
        role: validRole,
        updatedAt: new Date().toISOString(),
      };
      
      await this.firestoreService.updateDocument(
        this.collectionName,
        id,
        updateData
      );
      
      // Return the updated user
      return {
        ...existingUser,
        ...updateData,
      };
    } catch (error) {
      throw handleError(
        error,
        "Failed to update user role",
        "UserService.updateUserRole"
      );
    }
  }

  /**
   * Update a user
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    try {
      // Validate input data
      const validData = UpdateUserInputSchema.parse(data);
      
      // Get current user to make sure it exists
      const existingUser = await this.getUser(id);
      
      if (!existingUser) {
        throw new CustomError("User not found", "NOT_FOUND");
      }

      // Prevent modifying super admins role
      if (
        existingUser.role === "SuperAdmin" && 
        validData.role && 
        validData.role !== "SuperAdmin"
      ) {
        throw new CustomError(
          "Cannot change role of super admin accounts for security reasons",
          "FORBIDDEN"
        );
      }
      
      // Add updated timestamp
      const updateData = {
        ...validData,
        updatedAt: new Date().toISOString(),
      };
      
      await this.firestoreService.updateDocument(
        this.collectionName,
        id,
        updateData
      );
      
      // Return the updated user
      return {
        ...existingUser,
        ...updateData,
      };
    } catch (error) {
      throw handleError(
        error,
        "Failed to update user",
        "UserService.updateUser"
      );
    }
  }

  /**
   * Delete a user from Firestore
   * Note: This only deletes the user's document in Firestore
   * Deleting from Firebase Auth requires Admin SDK
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      // Check if user exists
      const existingUser = await this.getUser(id);
      
      if (!existingUser) {
        throw new CustomError("User not found", "NOT_FOUND");
      }

      // Prevent deleting super admins
      if (existingUser.role === "SuperAdmin") {
        throw new CustomError(
          "Cannot delete super admin accounts for security reasons",
          "FORBIDDEN"
        );
      }
      
      // Delete the user document
      await this.firestoreService.deleteDocument(this.collectionName, id);
      
      return true;
    } catch (error) {
      throw handleError(
        error,
        "Failed to delete user",
        "UserService.deleteUser"
      );
    }
  }

  /**
   * Ensure a user document exists in Firestore
   * Helpful when creating users with the Auth service
   */
  async ensureUserDocument(userData: {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  }): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.getUser(userData.id).catch(() => null);
      
      if (existingUser) {
        // User exists, return existing data
        return existingUser;
      }
      
      // Create new user document
      const now = new Date().toISOString();
      const newUser = {
        email: userData.email,
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        role: "USER" as UserRole,
        createdAt: now,
        updatedAt: now,
        disabled: false,
      };
      
      await this.firestoreService.setDocument(
        this.collectionName,
        userData.id,
        newUser
      );
      
      // Return the new user
      return {
        id: userData.id,
        ...newUser,
      };
    } catch (error) {
      throw handleError(
        error,
        "Failed to ensure user document",
        "UserService.ensureUserDocument"
      );
    }
  }

  /**
   * Toggle a user's disabled status
   */
  async toggleUserDisabled(id: string, disabled: boolean): Promise<User> {
    try {
      // Get current user to make sure it exists
      const existingUser = await this.getUser(id);
      
      if (!existingUser) {
        throw new CustomError("User not found", "NOT_FOUND");
      }

      // Prevent disabling super admins
      if (existingUser.role === "SuperAdmin" && disabled) {
        throw new CustomError(
          "Cannot disable super admin accounts for security reasons",
          "FORBIDDEN"
        );
      }
      
      // Update disabled status
      const updateData = {
        disabled,
        updatedAt: new Date().toISOString(),
      };
      
      await this.firestoreService.updateDocument(
        this.collectionName,
        id,
        updateData
      );
      
      // Return the updated user
      return {
        ...existingUser,
        ...updateData,
      };
    } catch (error) {
      throw handleError(
        error,
        "Failed to update user disabled status",
        "UserService.toggleUserDisabled"
      );
    }
  }

  /**
   * Update roles for multiple users in a single batch operation
   * @param updates - Array of objects with userId and new role
   * @returns Array of updated user objects
   */
  async batchUpdateUserRoles(updates: Array<{ userId: string; role: UserRole }>): Promise<User[]> {
    try {
      if (!updates.length) {
        return [];
      }

      // First, fetch all users to validate they exist and check permissions
      const userIds = updates.map(update => update.userId);
      const existingUsers: Record<string, User> = {};
      
      // Fetch each user to verify they exist and check permissions
      for (const userId of userIds) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new CustomError(`User with ID ${userId} not found`, "NOT_FOUND");
        }
        existingUsers[userId] = user;
      }
      
      // Validate role changes and create batch operations
      const operations = [];
      const updatedUsers: User[] = [];
      
      for (const update of updates) {
        const { userId, role } = update;
        const user = existingUsers[userId];
        
        // Validate the role
        const validRole = UserRoleSchema.parse(role);
        
        // Prevent modifying super admins
        if (user.role === "SuperAdmin" && validRole !== "SuperAdmin") {
          throw new CustomError(
            `Cannot change role of super admin account (${userId}) for security reasons`,
            "FORBIDDEN"
          );
        }
        
        // Add update operation
        const updateData = {
          role: validRole,
          updatedAt: new Date().toISOString(),
        };
        
        operations.push({
          type: 'update' as const,
          collectionName: this.collectionName,
          docId: userId,
          data: updateData,
        });
        
        // Add to updated users list
        updatedUsers.push({
          ...user,
          ...updateData,
        });
      }
      
      // Perform batch update
      await this.firestoreService.batchOperation(operations);
      
      return updatedUsers;
    } catch (error) {
      throw handleError(
        error,
        "Failed to batch update user roles",
        "UserService.batchUpdateUserRoles"
      );
    }
  }

  // --- Address Management Methods ---

  private async _updateDefaultAddresses(
    userId: string,
    newDefaultAddressId: string,
    newAddressType: AddressType
  ): Promise<void> {
    const addressesSnapshot = await this.firestoreService.getDocuments(
      `${this.collectionName}/${userId}/addresses`,
      [["isDefault", "==", true]]
    );

    const batch = this.firestoreService.createBatch();
    let defaultUpdated = false;

    addressesSnapshot.documents.forEach(doc => {
      const address = { id: doc.id, ...doc } as Address;
      if (address.id === newDefaultAddressId) return; // Don't unset the one we are setting

      let shouldUnsetDefault = false;
      if (newAddressType === "Both") {
        shouldUnsetDefault = true;
      } else if (address.type === newAddressType || address.type === "Both") {
        shouldUnsetDefault = true;
      }

      if (shouldUnsetDefault) {
        const addressRef = this.firestoreService.getDocRef(
          `${this.collectionName}/${userId}/addresses`,
          address.id
        );
        batch.update(addressRef, { isDefault: false, updatedAt: new Date().toISOString() });
        defaultUpdated = true;
      }
    });

    if (defaultUpdated) {
      await batch.commit();
    }
  }

  async getUserAddresses(userId: string): Promise<Address[]> {
    try {
      if (!userId) throw new CustomError("User ID is required.", "INVALID_ARGUMENT");
      const { documents } = await this.firestoreService.getDocuments(
        `${this.collectionName}/${userId}/addresses`,
        [["isDefault", "desc"], ["createdAt", "desc"]] // Default first, then newest
      );
      return documents.map(doc => AddressSchema.parse({ id: doc.id, ...doc })).filter(Boolean) as Address[];
    } catch (error) {
      throw handleError(error, "Failed to retrieve user addresses", "UserService.getUserAddresses");
    }
  }

  async addUserAddress(userId: string, addressData: CreateAddressData): Promise<Address> {
    try {
      if (!userId) throw new CustomError("User ID is required.", "INVALID_ARGUMENT");
      const validatedData = CreateAddressDataSchema.parse(addressData);
      const now = new Date().toISOString();

      const newAddressPayload = {
        ...validatedData,
        createdAt: now,
        updatedAt: now,
      };

      // Firestore addDocument will generate an ID
      const docId = await this.firestoreService.addDocument(
        `${this.collectionName}/${userId}/addresses`,
        newAddressPayload
      );

      const finalAddressData: Address = {
        id: docId,
        ...newAddressPayload,
      };

      if (finalAddressData.isDefault) {
        await this._updateDefaultAddresses(userId, docId, finalAddressData.type);
      }

      return AddressSchema.parse(finalAddressData); // Validate before returning
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new CustomError("Invalid address data.", "INVALID_ARGUMENT", error.flatten().fieldErrors);
      }
      throw handleError(error, "Failed to add user address", "UserService.addUserAddress");
    }
  }

  async updateUserAddress(userId: string, addressId: string, addressData: UpdateAddressData): Promise<Address> {
    try {
      if (!userId || !addressId) throw new CustomError("User ID and Address ID are required.", "INVALID_ARGUMENT");
      const validatedData = UpdateAddressDataSchema.parse(addressData);

      if (Object.keys(validatedData).length === 0) {
        throw new CustomError("No fields to update provided.", "INVALID_ARGUMENT");
      }

      const addressRef = this.firestoreService.getDocRef(`${this.collectionName}/${userId}/addresses`, addressId);
      const docSnap = await this.firestoreService.getRawDoc(addressRef); // get raw snapshot
      if (!docSnap.exists()) {
        throw new CustomError("Address not found.", "NOT_FOUND");
      }

      const payload = { ...validatedData, updatedAt: new Date().toISOString() };

      if (payload.isDefault) {
        // Type needs to be known to correctly update other defaults.
        // If type is not part of payload, use existing type.
        const currentType = payload.type || (docSnap.data() as Address).type;
        await this._updateDefaultAddresses(userId, addressId, currentType);
      }

      await this.firestoreService.updateDocument(
        `${this.collectionName}/${userId}/addresses`,
        addressId,
        payload
      );

      const updatedDocData = await this.firestoreService.getDocument(`${this.collectionName}/${userId}/addresses`, addressId);
      if (!updatedDocData) throw new CustomError("Failed to retrieve updated address.", "INTERNAL_ERROR");

      return AddressSchema.parse({ id: addressId, ...updatedDocData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new CustomError("Invalid address data for update.", "INVALID_ARGUMENT", error.flatten().fieldErrors);
      }
      throw handleError(error, "Failed to update user address", "UserService.updateUserAddress");
    }
  }

  async deleteUserAddress(userId: string, addressId: string): Promise<void> {
    try {
      if (!userId || !addressId) throw new CustomError("User ID and Address ID are required.", "INVALID_ARGUMENT");
      // Optional: Check if address exists before deleting, or let deleteDocument handle it (it might not throw if not found)
      await this.firestoreService.deleteDocument(`${this.collectionName}/${userId}/addresses`, addressId);
    } catch (error) {
      throw handleError(error, "Failed to delete user address", "UserService.deleteUserAddress");
    }
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    try {
      if (!userId || !addressId) throw new CustomError("User ID and Address ID are required.", "INVALID_ARGUMENT");

      const addressRef = this.firestoreService.getDocRef(`${this.collectionName}/${userId}/addresses`, addressId);
      const docSnap = await this.firestoreService.getRawDoc(addressRef);
      if (!docSnap.exists()) {
        throw new CustomError("Address not found to set as default.", "NOT_FOUND");
      }
      const addressToSetDefault = AddressSchema.parse({id: docSnap.id, ...docSnap.data()});

      await this._updateDefaultAddresses(userId, addressId, addressToSetDefault.type);

      await this.firestoreService.updateDocument(
        `${this.collectionName}/${userId}/addresses`,
        addressId,
        { isDefault: true, updatedAt: new Date().toISOString() }
      );
    } catch (error) {
      throw handleError(error, "Failed to set default address", "UserService.setDefaultAddress");
    }
  }
}

// Export a singleton instance of the service
export const userService = new UserService();
