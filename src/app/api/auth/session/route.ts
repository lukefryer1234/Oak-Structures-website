import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  // Check if the adminAuth service is available
  if (!adminAuth) {
    return NextResponse.json({ error: 'Firebase Admin SDK not initialized.' }, { status: 500 });
  }

  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: 'No session cookie found.' }, { status: 401 });
    }

    // Verify the session cookie.
    // The `true` second argument checks for revocation.
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);

    // The decoded token contains all the user's claims and basic info.
    const user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name, // 'name' is a standard claim for display name
    };

    return NextResponse.json(user);

  } catch (error: any) {
    // Session cookie is invalid or expired.
    // This is an expected error path for non-authenticated users.
    return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
  }
}
