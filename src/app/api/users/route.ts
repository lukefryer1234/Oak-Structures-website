import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userService, GetUsersParamsSchema } from "@/services/domain/user-service";
import { authenticateAdmin } from "@/lib/auth/server";

/**
 * GET /api/users
 * Fetch users with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const session = await authenticateAdmin(request);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;
    const startAfter = searchParams.get("startAfter") || undefined;
    const disabled = searchParams.has("disabled") 
      ? searchParams.get("disabled") === "true" 
      : undefined;
    const searchQuery = searchParams.get("search") || undefined;

    // Validate query parameters
    const validationResult = z.object({
      role: z.string().optional(),
      limit: z.number().int().positive().max(100),
      startAfter: z.string().optional(),
      disabled: z.boolean().optional(),
      searchQuery: z.string().optional(),
    }).safeParse({
      role,
      limit,
      startAfter,
      disabled,
      searchQuery,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Get users based on validated parameters
    const result = await userService.getUsers({
      role: role as any, // Type will be validated by the service
      limit,
      startAfter,
      disabled,
      searchQuery,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    
    // Return appropriate error response
    if (error.code === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

