import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Check if environment variables exist
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Check if we're already initialized
if (!getApps().length) {
  // If we have proper credentials, use them
  if (projectId && clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
    console.log("Firebase Admin SDK initialized with credentials");
  } else {
    // Otherwise initialize without credentials (for dev environment)
    // This will use the default credentials or environment variables
    initializeApp({});
    console.log("Firebase Admin SDK initialized without explicit credentials");
  }
}

const adminDb = getFirestore();
const adminAuth = getAuth();

// For the Firebase Admin SDK to connect to emulators,
// the following environment variables need to be set:
// FIRESTORE_EMULATOR_HOST="localhost:8080"
// FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
// FIREBASE_STORAGE_EMULATOR_HOST="localhost:9199"
// The Firebase CLI (e.g., when using `firebase emulators:exec`) usually sets these.
// No explicit `connect...Emulator` calls are needed for the Admin SDK.

/**
 * Returns the Firebase Admin app instance, initializing it if necessary.
 * This is useful for parts of the app that need direct access to the admin app.
 */
export function getAdminApp() {
  try {
    // Try to get an existing app
    return getApp();
  } catch (error) {
    // If no app exists, initialize and return it
    if (projectId && clientEmail && privateKey) {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      // Initialize without credentials for dev environment
      return initializeApp({});
    }
  }
}

export { adminDb, adminAuth };
