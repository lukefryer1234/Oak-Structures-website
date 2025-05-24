import { initializeApp, getApps, cert, getApp, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

// Check if environment variables exist
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Global variables to store instances
let _adminDb: Firestore | null = null;
let _adminAuth: Auth | null = null;
let _adminApp: App | null = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebaseAdmin(): App {
  if (_adminApp) {
    return _adminApp;
  }

  try {
    // Check if already initialized
    if (getApps().length > 0) {
      _adminApp = getApp();
      return _adminApp;
    }

    // Try to use application default credentials first (works in Cloud Functions)
    try {
      _adminApp = initializeApp();
      console.log("Firebase Admin SDK initialized with default credentials");
      return _adminApp;
    } catch (e) {
      console.log("Could not initialize with default credentials, trying explicit credentials");
    }

    // Fall back to explicit credentials if available
    if (projectId) {
      const appConfig: any = { projectId };
      
      // Only add credential if we have all the required parts
      if (clientEmail && privateKey) {
        try {
          appConfig.credential = cert({
            projectId,
            clientEmail,
            // Handle various private key formats
            privateKey: privateKey?.replace(/\\n/g, "\n"),
          });
          console.log("Using explicit service account credentials");
        } catch (e) {
          console.warn("Failed to parse private key, continuing without admin credentials:", e);
        }
      }
      
      _adminApp = initializeApp(appConfig);
      console.log("Firebase Admin SDK initialized with project ID");
    } else {
      _adminApp = initializeApp({});
      console.log("Firebase Admin SDK initialized without explicit credentials");
    }

    return _adminApp;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    // Continue without admin SDK rather than crashing
    _adminApp = {} as App;
    return _adminApp;
  }
}

/**
 * Get Firestore instance with lazy initialization
 */
export function getAdminDb(): Firestore {
  if (!_adminDb) {
    initializeFirebaseAdmin();
    _adminDb = getFirestore();
  }
  return _adminDb;
}

/**
 * Get Auth instance with lazy initialization
 */
export function getAdminAuth(): Auth {
  if (!_adminAuth) {
    initializeFirebaseAdmin();
    _adminAuth = getAuth();
  }
  return _adminAuth;
}

/**
 * Get Admin App instance
 */
export function getAdminApp(): App {
  if (!_adminApp) {
    _adminApp = initializeFirebaseAdmin();
  }
  return _adminApp;
}

// Export lazy-loaded instances
export const adminDb = new Proxy({} as Firestore, {
  get: (target, prop) => {
    const db = getAdminDb();
    const value = (db as any)[prop];
    return typeof value === 'function' ? value.bind(db) : value;
  }
});

export const adminAuth = new Proxy({} as Auth, {
  get: (target, prop) => {
    const auth = getAdminAuth();
    const value = (auth as any)[prop];
    return typeof value === 'function' ? value.bind(auth) : value;
  }
});
