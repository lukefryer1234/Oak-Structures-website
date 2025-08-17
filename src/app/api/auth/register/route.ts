import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  // Check if the adminAuth service is available
  if (!adminAuth) {
    return NextResponse.json({ error: 'Firebase Admin SDK not initialized.' }, { status: 500 });
  }

  try {
    const { email, password, displayName } = await request.json();

    // Basic validation
    if (!email || !password || !displayName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use the Firebase Admin SDK to create the user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });

    // Optionally, you could set custom claims or perform other actions here

    // Return a success response
    return NextResponse.json({ uid: userRecord.uid, email: userRecord.email });

  } catch (error: any) {
    console.error('Error creating user:', error);

    // Provide a more specific error message based on the Firebase error code
    let errorMessage = 'An unexpected error occurred.';
    let statusCode = 500;

    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'The email address is already in use by another account.';
      statusCode = 409; // Conflict
    } else if (error.code === 'auth/invalid-password') {
      errorMessage = 'The password must be a string with at least six characters.';
      statusCode = 400;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
