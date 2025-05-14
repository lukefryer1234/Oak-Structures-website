import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { CustomError } from "@/lib/error-utils";

/**
 * Authenticates a request to ensure it's coming from an admin user
 * @param request The NextRequest object
 * @returns The authenticated admin user session
 * @throws Error if user is not authenticated or not an admin
 */
export async function authenticateAdmin(request: NextRequest) {
  try {
    // Get the session token from cookies
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      throw new CustomError("No session cookie found", "UNAUTHORIZED");
    }

    // Verify session with Firebase Admin
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    if (!uid) {
      throw new CustomError("Invalid session", "UNAUTHORIZED");
    }

    // Get user data to check role
    const userRecord = await adminAuth.getUser(uid);
    
    // Check if user is disabled
    if (userRecord.disabled) {
      throw new CustomError("User account is disabled", "UNAUTHORIZED");
    }

    // Get custom claims
    const customClaims = userRecord.customClaims || {};
    
    // Get user document from Firestore for role check
    const userSnapshot = await adminAuth.getUser(uid);
    
    // Check additional information from Firestore
    // You can implement this based on your specific role storage strategy
    
    // For now, consider the user authenticated as admin based on available information
    // This should be replaced with your specific admin role checking logic
    const isAdmin = 
      customClaims.admin === true || 
      customClaims.role === "admin" || 
      customClaims.role === "SuperAdmin";
    
    if (!isAdmin) {
      throw new CustomError("User is not authorized to perform this action", "FORBIDDEN");
    }

    return {
      uid,
      email: userRecord.email,
      customClaims,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    
    if (error instanceof CustomError) {
      throw error;
    }
    
    throw new CustomError("Failed to authenticate request", "UNAUTHORIZED");
  }
}

