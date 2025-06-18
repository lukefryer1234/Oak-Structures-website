// src/app/api/users/ensure-document/route.ts
import { NextResponse } from 'next/server';
import { userService, UserSchema } from '@/services/domain/user-service'; // Adjust path if needed
import { auth } from '@/lib/auth/server'; // Assuming server-side auth helper to get current session/user
import { z } from 'zod';

// Define a schema for the request body
const EnsureUserRequestSchema = z.object({
  uid: z.string(),
  email: z.string().email().optional().nullable(),
  displayName: z.string().optional().nullable(),
  photoURL: z.string().url().optional().nullable(), // photoURL was in userService version
});

export async function POST(request: Request) {
  try {
    // 1. Check Authentication (optional, but good practice)
    // This depends on your auth setup. If this is called right after user creation by Firebase Auth,
    // the user might be authenticated. Or this could be an admin-only action.
    // For this example, let's assume we need an authenticated user.
    const session = await auth(); // Example server-side auth check
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // If we want to ensure only the authenticated user can ensure their own document,
    // or if an admin can do it for anyone.
    // For now, let's assume the UID in the body is the one to ensure.

    const json = await request.json();
    const parsedRequest = EnsureUserRequestSchema.safeParse(json);

    if (!parsedRequest.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsedRequest.error.flatten().fieldErrors }, { status: 400 });
    }

    const { uid, email, displayName, photoURL } = parsedRequest.data;

    // The userService.ensureUserDocument expects { id, email, displayName, photoURL }
    // The 'id' for userService.ensureUserDocument is the auth UID.
    const userToEnsure = {
        id: uid, // This is the auth UID
        email: email || undefined, // Convert null to undefined for service
        displayName: displayName || undefined,
        photoURL: photoURL || undefined,
    };

    const userDocument = await userService.ensureUserDocument(userToEnsure);

    return NextResponse.json({ message: 'User document ensured successfully.', user: userDocument }, { status: 200 });

  } catch (error: any) {
    console.error('Error in ensure-user-document API route:', error);
    // Check if it's a CustomError from userService for specific status codes
    if (error.isCustomError) { // Assuming CustomError has an 'isCustomError' property
         return NextResponse.json({ message: error.message, details: error.details }, { status: error.statusCode || 500 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
