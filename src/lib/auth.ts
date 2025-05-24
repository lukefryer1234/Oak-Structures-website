// src/lib/auth.ts - Proxy file to fix import issues
import { authenticateAdmin } from '@/lib/auth/server';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Middleware to require admin authentication for API routes
 * Wrapper around authenticateAdmin that provides request context
 */
export async function requireAdmin(request?: NextRequest) {
  try {
    if (request) {
      // If request is provided, pass it directly to authenticateAdmin
      return await authenticateAdmin(request);
    } else {
      // If no request is provided, we'll have to assume we're in a route handler
      // where the cookies API from next/headers can be used
      // We create a minimal request object that authenticateAdmin can use
      const dummyRequest = {
        cookies: {
          get: (name: string) => {
            const cookieStore = cookies();
            return cookieStore.get(name);
          }
        }
      } as unknown as NextRequest;

      return await authenticateAdmin(dummyRequest);
    }
  } catch (error) {
    // Rethrow the error to be handled by the caller
    throw error;
  }
}

// Re-export the authenticateAdmin function
export { authenticateAdmin };

