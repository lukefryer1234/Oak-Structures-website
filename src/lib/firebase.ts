
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Replace with your actual Firebase project configuration
// These should ideally be stored in environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "fake-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "timberline-commerce.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "timberline-commerce",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "timberline-commerce.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "fake-messaging-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "fake-app-id",
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

if (process.env.NODE_ENV === 'development') {
  try {
    // Check if emulators are already connected
    if (!(auth as any).emulatorConfig) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    }
    if (!(db as any)._settings.host.includes('127.0.0.1')) {
      connectFirestoreEmulator(db, '127.0.0.1', 9090);
    }
    if (!(storage as any).emulator) {
      connectStorageEmulator(storage, '127.0.0.1', 9191);
    }
    console.log("Successfully connected to Firebase emulators.");
  } catch (error) {
    console.error("Failed to connect to Firebase emulators:", error);
  }
}

export { app, auth, db, storage };
