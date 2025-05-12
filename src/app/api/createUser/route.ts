import { db } from '@/lib/firebase'; 
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

interface UserPayload {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

interface RequestExtended extends Request {
    json: () => Promise<{ user: UserPayload }>;
}

export async function POST(req: RequestExtended) {
  try {
    const { user } = await req.json();

    if (!user || !user.uid) {
      console.error('API:/api/createUser: No user UID provided in request body.');
      return new Response(JSON.stringify({ message: 'User UID is required.' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    console.log(`API:/api/createUser: Processing user: ${user.uid}, Email: ${user.email}, Name: ${user.displayName}`);

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // User already exists, update displayName if provided and different
      const existingData = userSnap.data();
      const updateData: { displayName?: string; email?: string } = {}; // Specify fields to potentially update

      if (user.displayName && user.displayName !== existingData.displayName) {
        updateData.displayName = user.displayName;
        console.log(`API:/api/createUser: Updating displayName for user ${user.uid} to "${user.displayName}"`);
      }
      if (user.email && user.email !== existingData.email) {
        updateData.email = user.email; // Also update email if it changed (e.g. via Firebase Auth linking)
         console.log(`API:/api/createUser: Updating email for user ${user.uid} to "${user.email}"`);
      }

      if (Object.keys(updateData).length > 0) {
        await updateDoc(userRef, updateData);
        console.log(`API:/api/createUser: User document for ${user.uid} updated in Firestore.`);
      } else {
        console.log(`API:/api/createUser: User document for ${user.uid} already up-to-date in Firestore.`);
      }
      return new Response(JSON.stringify({ message: 'User document ensured/updated successfully in Firestore.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // User does not exist, create new document
      const newUserDocument = {
        email: user.email || "", // Ensure email is always a string
        displayName: user.displayName || "New User",
        role: 'Customer', // Default role for new users
        createdAt: serverTimestamp(), // Use Firestore server timestamp
        // Add other default fields for a new user if necessary
      };
      await setDoc(userRef, newUserDocument);
      console.log(`API:/api/createUser: Created new user document for ${user.uid} in Firestore.`);
      return new Response(JSON.stringify({ message: 'New user document created successfully in Firestore.' }), {
        status: 201, // 201 Created
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (e:any) {
    console.error('API:/api/createUser: Failed to process user document in Firestore:', e);
    let errorMessage = 'Failed to process user document in Firestore.';
    if (e.message) {
        errorMessage += ` Details: ${e.message}`;
    }
    return new Response(JSON.stringify({ message: errorMessage }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json'}
    });
  }
}