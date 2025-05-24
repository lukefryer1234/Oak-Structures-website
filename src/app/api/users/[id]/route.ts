import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userService, UpdateUserInputSchema, UserRoleSchema } from "@/services/domain/user-service";
import { authenticateAdmin } from "@/lib/auth/server";

/**
 * GET /api/users/[id]
 * Get a single user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin user
    const session = await authenticateAdmin(request);

    const { id } = params;

    // Validate id parameter
    const validationResult = z
      .object({
        id: z.string().min(1),
      })
      .safeParse({ id });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid user ID",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Get user
    const user = await userService.getUser(id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error(`Error fetching user with ID ${params.id}:`, error);
    
    // Return appropriate error response
    if (error.code === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Update a user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin user
    const session = await authenticateAdmin(request);

    const { id } = params;
    const body = await request.json();

    // Check if this is a role update operation
    const isRoleUpdate = Object.keys(body).length === 1 && body.role !== undefined;
    
    // Check if this is a disabled toggle operation
    const isDisabledToggle = Object.keys(body).length === 1 && body.disabled !== undefined;

    // Validate id parameter
    const idValidation = z
      .object({
        id: z.string().min(1),
      })
      .safeParse({ id });

    if (!idValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid user ID",
          details: idValidation.error.format(),
        },
        { status: 400 }
      );
    }

    // Handle specific update types
    if (isRoleUpdate) {
      // Validate role
      const roleValidation = z
        .object({
          role: UserRoleSchema,
        })
        .safeParse(body);

      if (!roleValidation.success) {
        return NextResponse.json(
          {
            error: "Invalid role value",
            details: roleValidation.error.format(),
          },
          { status: 400 }
        );
      }

      // Update user role
      const updatedUser = await userService.updateUserRole(id, body.role);
      return NextResponse.json(updatedUser);
    } 
    else if (isDisabledToggle) {
      // Validate disabled flag
      const disabledValidation = z
        .object({
          disabled: z.boolean(),
        })
        .safeParse(body);

      if (!disabledValidation.success) {
        return NextResponse.json(
          {
            error: "Invalid disabled value",
            details: disabledValidation.error.format(),
          },
          { status: 400 }
        );
      }

      // Toggle user disabled status
      const updatedUser = await userService.toggleUserDisabled(id, body.disabled);
      return NextResponse.json(updatedUser);
    } 
    else {
      // Regular user update with multiple fields
      const validation = UpdateUserInputSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Invalid user data",
            details: validation.error.format(),
          },
          { status: 400 }
        );
      }

      // Update user
      const updatedUser = await userService.updateUser(id, body);
      return NextResponse.json(updatedUser);
    }
  } catch (error: any) {
    console.error(`Error updating user with ID ${params.id}:`, error);
    
    // Handle different error types
    if (error.code === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
    
    if (error.code === "NOT_FOUND") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    if (error.code === "FORBIDDEN") {
      return NextResponse.json(
        { error: error.message || "Operation not permitted" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin user
    const session = await authenticateAdmin(request);

    const { id } = params;

    // Validate id parameter
    const validationResult = z
      .object({
        id: z.string().min(1),
      })
      .safeParse({ id });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid user ID",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Delete user
    await userService.deleteUser(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Error deleting user with ID ${params.id}:`, error);
    
    // Handle different error types
    if (error.code === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
    
    if (error.code === "NOT_FOUND") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    if (error.code === "FORBIDDEN") {
      return NextResponse.json(
        { error: error.message || "Operation not permitted" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}

