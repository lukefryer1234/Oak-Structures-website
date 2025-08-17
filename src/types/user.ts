// Defines the user object that will be used throughout the frontend application.
// This replaces the complex User object from the firebase/auth SDK.

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  // We can add other non-sensitive fields here as needed, e.g., photoURL
}
