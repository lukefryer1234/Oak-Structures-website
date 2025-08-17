import * as admin from 'firebase-admin';

// This interface is not strictly necessary but helps with type-checking and clarity
interface FirebaseAdminEnv {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

// Read environment variables for the service account
const serviceAccount: FirebaseAdminEnv = {
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  // When passing private key from .env, newlines must be escaped
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

// Ensure all required service account details are present before initializing
const canInitialize = serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey;

// Initialize the app only if it hasn't been initialized yet and we have credentials
if (canInitialize && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
} else if (!canInitialize) {
    console.warn('Firebase Admin SDK not initialized. Missing environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
}

// Export the admin services
export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
