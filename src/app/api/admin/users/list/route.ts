// src/app/api/admin/users/list/route.ts
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { UserData, firestoreUserSchema } from '@/app/admin/users/actions'; // Assuming actions.ts is the correct location for these
import { collection, getDocs } from 'firebase-admin/firestore';

export async function GET() {
  try {
    const usersCollectionRef = collection(adminDb, 'users');
    const querySnapshot = await getDocs(usersCollectionRef);
    const users: UserData[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const parsed = firestoreUserSchema.safeParse(data);

      if (parsed.success) {
        // Map Firestore data to UserData, ensuring all fields from UserData are covered
        users.push({
          id: docSnap.id,
          name: parsed.data.displayName, // Assuming displayName maps to name
          email: parsed.data.email,
          role: parsed.data.role, // Zod schema default handles if missing
          avatarUrl: parsed.data.avatarUrl,
          lastLogin: parsed.data.lastLogin, // Ensure this field exists in firestoreUserSchema and is handled
          orderCount: parsed.data.orderCount, // Ensure this field exists in firestoreUserSchema and is handled
          // Additional fields from UserData that might not be in firestoreUserSchema need defaults or optional handling:
          // e.g. totalSpent, accountStatus might not be in firestoreUserSchema's direct parse output
          // For now, we assume they are optional or handled by Zod defaults if not present.
          // If UserData has more fields than firestoreUserSchema produces, this will need adjustment.
        });
      } else {
        console.warn(`API: User data for ${docSnap.id} failed validation:`, parsed.error.flatten().fieldErrors);
        // Fallback for potentially missing role or other fields, if desired, or skip.
        // This fallback should also aim to satisfy the UserData interface.
        users.push({
           id: docSnap.id,
           email: data.email || 'N/A', // Provide a default if email is absolutely critical
           role: data.role || 'Customer', // Default role if not specified or invalid
           name: data.displayName || `User ${docSnap.id}`, // Default name
           avatarUrl: data.avatarUrl || undefined,
           lastLogin: data.lastLogin ? (data.lastLogin.toDate ? data.lastLogin.toDate().toISOString() : new Date(data.lastLogin).toISOString()) : undefined,
           orderCount: typeof data.orderCount === 'number' ? data.orderCount : 0,
           // Ensure all UserData fields are present with fallbacks
           // totalSpent: 0,
           // accountStatus: 'Active',
        });
      }
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users via API:", error);
    return NextResponse.json({ message: "Error fetching users", error: (error as Error).message || 'Unknown error' }, { status: 500 });
  }
}
