import { auth, db } from '@/lib/firebase'; // Assuming auth is not directly used here but db is
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth'; // Firebase Auth User type

interface CreateUserPayload {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  // You can add other fields that might come from Firebase Auth user object
}

interface RequestExtended extends Request {
    // The `json` method on `Request` by default returns `Promise<any>`.
    // We are specializing it here to `Promise<{ user: CreateUserPayload }>`
    // to match the expected structure of the request body.
    json: () => Promise<{ user: CreateUserPayload }>;
}

export async function POST(req: RequestExtended) {
  try {
    const { user } = await req.json();

    if (!user || !user.uid) {
      console.error('No user UID provided in request body');
      return new Response(JSON.stringify({ message: 'User UID is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    console.log('Received user for Firestore creation:', user);

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const userDataToSet = {
      email: user.email || "", // Ensure email is not null/undefined
      displayName: user.displayName || "New User", // Default display name
      role: 'Customer', // Default role for new users
      createdAt: new Date().toISOString(), // Timestamp for user creation
      // Add any other relevant user data from the `user` payload or defaults
    };

    if (userSnap.exists()) {
      // User already exists, potentially update some fields if necessary
      // For now, we'll just log it. Or, you could merge new data.
      console.log(`User document for ${user.uid} already exists. No update performed by default.`);
       // Example: Update displayName if it's different and provided
      // const existingData = userSnap.data();
      // if (user.displayName && user.displayName !== existingData.displayName) {
      //    await setDoc(userRef, { displayName: user.displayName }, { merge: true });
      //    console.log(`Updated displayName for user ${user.uid}.`);
      // }
    } else {
      // User does not exist, create new document
      await setDoc(userRef, userDataToSet);
      console.log(`Created new user document for ${user.uid}.`);
    }

    return new Response(JSON.stringify({ message: 'User document processed successfully in Firestore.' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e:any) {
    console.error('Failed to process user document in Firestore:', e);
    // It's good practice to not expose raw error messages to the client
    // unless they are specifically crafted for client consumption.
    return new Response(JSON.stringify({ message: 'Failed to process user document in Firestore.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json'}
    });
  }
}
