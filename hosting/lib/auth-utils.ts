import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserRole } from '@/app/admin/users/actions';

/**
 * Retrieves the role of a user from Firestore.
 * Defaults to 'Customer' if the role is not found or an error occurs.
 * @param uid The user's unique ID.
 * @returns A Promise that resolves to the user's role.
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  if (!uid) {
    console.warn('getUserRole called with empty UID, defaulting to Customer.');
    return 'Customer';
  }

  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const role = userData?.role;
      if (role === 'Customer' || role === 'Manager' || role === 'SuperAdmin') {
        return role as UserRole;
      } else {
        console.warn(`User ${uid} has invalid or missing role in Firestore: "${role}". Defaulting to Customer.`);
        return 'Customer';
      }
    } else {
      console.warn(`User document for UID ${uid} not found in Firestore. Defaulting to Customer.`);
      return 'Customer';
    }
  } catch (error) {
    console.error(`Error fetching user role for UID ${uid}:`, error);
    return 'Customer';
  }
}

