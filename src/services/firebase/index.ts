// src/services/firebase/index.ts
export * from './auth-service';
export * from './firestore-service';
export * from './storage-service';

import AuthService from './auth-service';
import FirestoreService from './firestore-service';
import StorageService from './storage-service';

// Export the services as a single object
export const FirebaseServices = {
  auth: AuthService,
  firestore: FirestoreService,
  storage: StorageService,
};

// Default export for convenient importing
export default FirebaseServices;
