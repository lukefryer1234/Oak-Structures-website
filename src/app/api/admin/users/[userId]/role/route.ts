// src/app/api/admin/users/[userId]/role/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { UserRole, userRoleSchema, UserMutationState } from '@/app/admin/users/actions'; // Assuming types are exported from actions.ts
import { doc, getDoc, updateDoc } from 'firebase-admin/firestore';

interface RouteParams {
  params: {
    userId: string;
  };
}

// Handler for PATCH requests to update a user's role
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json({
      success: false,
      message: "User ID is required in the path"
    } as UserMutationState, { status: 400 });
  }

  try {
    const body = await request.json();
    const newRole = body.role;

    if (!newRole) {
      return NextResponse.json({
        success: false,
        message: "New role is required in the request body (e.g., { \"role\": \"Manager\" })."
      } as UserMutationState, { status: 400 });
    }

    const validatedRole = userRoleSchema.safeParse(newRole);
    if (!validatedRole.success) {
      return NextResponse.json({
        success: false,
        message: "Invalid role specified. Must be one of: " + userRoleSchema.options.join(', '),
        // UserMutationState in actions.ts has 'errors?: string'. Flattening to string.
        errors: JSON.stringify(validatedRole.error.flatten().fieldErrors)
      } as UserMutationState, { status: 400 });
    }
    const roleToUpdate = validatedRole.data as UserRole; // Cast after successful validation

    const userRef = doc(adminDb, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({
        success: false,
        message: "User not found."
      } as UserMutationState, { status: 404 });
    }

    // Check if the current role is the same as the new role
    if (userSnap.data()?.role === roleToUpdate) {
        return NextResponse.json({
            success: true, // Or false if you consider this a no-op error/warning
            message: "User already has the specified role. No update performed."
        } as UserMutationState, { status: 200 }); // 200 OK or 304 Not Modified, or even 400
    }

    await updateDoc(userRef, { role: roleToUpdate });

    console.log(`API PATCH: Successfully updated role for user ${userId} to ${roleToUpdate}`);
    return NextResponse.json({
      success: true,
      message: "User role updated successfully."
    } as UserMutationState, { status: 200 });

  } catch (error) {
    console.error(`API PATCH Error for user ${userId} role update:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    let responseBody: UserMutationState = {
        success: false,
        message: "Error updating user role",
        errors: errorMessage // Adding the error message to the 'errors' field
    };

    if (error instanceof SyntaxError) {
        responseBody.message = "Invalid JSON in request body";
        responseBody.errors = errorMessage;
        return NextResponse.json(responseBody, { status: 400 });
    }

    return NextResponse.json(responseBody, { status: 500 });
  }
}
