import { db } from '@/lib/firebase'; 
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

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
      console.error('No user UID provided in request body for /api/createUser');
      return new Response(JSON.stringify({ message: 'User UID is required.' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    console.log('Received user for Firestore creation/update:', user);

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const userDataToSet: any = { // Use 'any' for flexibility or define a proper FirestoreUser type
      email: user.email || "", 
      displayName: user.displayName || "New User", 
    };

    if (userSnap.exists()) {
      // User already exists, update displayName if provided and different
      const existingData = userSnap.data();
      if (user.displayName && user.displayName !== existingData.displayName) {
        userDataToSet.displayName = user.displayName;
      }
      // Only update if there are actual changes or to ensure critical fields like email are set
      // For simplicity, we'll use setDoc with merge: true which handles both create and update.
      await setDoc(userRef, userDataToSet, { merge: true });
      console.log(`User document for ${user.uid} updated (or ensured to exist) in Firestore.`);
    } else {
      // User does not exist, create new document with default role and timestamp
      userDataToSet.role = 'Customer'; // Default role
      userDataToSet.createdAt = serverTimestamp(); // Firestore server timestamp
      await setDoc(userRef, userDataToSet);
      console.log(`Created new user document for ${user.uid} in Firestore.`);
    }

    return new Response(JSON.stringify({ message: 'User document processed successfully in Firestore.' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e:any) {
    console.error('Failed to process user document in Firestore (/api/createUser):', e);
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
