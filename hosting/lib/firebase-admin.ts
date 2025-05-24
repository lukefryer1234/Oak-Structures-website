import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize the Firebase Admin SDK
function initializeFirebaseAdmin() {
  const apps = getApps();
  
  if (!apps.length) {
    // Get credentials from environment variables
    // In production, these should be securely stored environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials in environment variables');
    }
    
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  
  return {
    db: getFirestore(),
    auth: getAuth(),
  };
}

// Export initialized services
export const { db, auth } = initializeFirebaseAdmin();

// Helper functions for server-side operations

/**
 * Verify and decode a Firebase ID token
 */
export async function verifyIdToken(token: string) {
  try {
    return await auth.verifyIdToken(token);
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid authentication token');
  }
}

/**
 * Get a user by their UID
 */
export async function getUserById(uid: string) {
  try {
    return await auth.getUser(uid);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new Error('User not found');
  }
}

/**
 * Create a user in Firebase Auth
 */
export async function createUser(email: string, password: string, displayName?: string) {
  try {
    return await auth.createUser({
      email,
      password,
      displayName,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

