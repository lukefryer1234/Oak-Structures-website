import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userService, UserRoleSchema } from "@/services/domain/user-service";
import { authenticateAdmin } from "@/lib/auth/server";
import { CustomError } from "@/lib/error-utils";

// Input validation schema
const BatchUpdateUserRolesSchema = z.object({
  updates: z.array(
    z.object({
      userId: z.string().min(1),
      role: UserRoleSchema,
    })
  ),
});

type BatchUpdateUserRolesInput = z.infer<typeof BatchUpdateUserRolesSchema>;

/**
 * POST /api/users/batch-update-roles
 * Update roles for multiple users in a single operation
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin user
    const session = await authenticateAdmin(request);

    // Parse and validate the request body
    const body = await request.json();
    const validationResult = BatchUpdateUserRolesSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { updates } = validationResult.data;

    // No updates to process
    if (updates.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Perform batch update
    const updatedUsers = await userService.batchUpdateUserRoles(updates);

    return NextResponse.json({ users: updatedUsers });
  } catch (error: any) {
    console.error("Error batch updating user roles:", error);
    
    // Handle different error types
    if (error instanceof CustomError) {
      if (error.code === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 401 }
        );
      }
      
      if (error.code === "NOT_FOUND") {
        return NextResponse.json(
          { error: error.message || "One or more users not found" },
          { status: 404 }
        );
      }
      
      if (error.code === "FORBIDDEN") {
        return NextResponse.json(
          { error: error.message || "Operation not permitted" },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to update user roles" },
      { status: 500 }
    );
  }
}

