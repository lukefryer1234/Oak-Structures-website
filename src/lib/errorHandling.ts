// src/lib/errorHandling.ts - Proxy file to fix import issues
import { NextResponse } from 'next/server';
import { 
  getErrorMessage, 
  logError,
  isRetryableError,
  withRetry,
  handleAsyncError
} from '@/utils/error-utils';

/**
 * Handles API errors in route handlers and returns appropriate NextResponse
 */
export function handleApiError(error: unknown) {
  logError(error, 'API request');
  
  const message = getErrorMessage(error);
  const status = getErrorStatus(error);
  
  return NextResponse.json(
    { 
      success: false, 
      message,
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, 
    { status }
  );
}

/**
 * Determine appropriate HTTP status code based on error
 */
function getErrorStatus(error: unknown): number {
  // Extract status code if present in the error
  const errorObj = error as any;
  
  if (errorObj?.status && typeof errorObj.status === 'number') {
    return errorObj.status;
  }
  
  if (errorObj?.code) {
    const code = String(errorObj.code).toLowerCase();
    
    // Authentication errors
    if (code.includes('auth') || code.includes('permission') || code.includes('unauthorized')) {
      return 401;
    }
    
    // Not found errors
    if (code.includes('not-found') || code.includes('notfound')) {
      return 404;
    }
    
    // Validation errors
    if (code.includes('invalid') || code.includes('validation')) {
      return 400;
    }
  }
  
  // Default to 500 for unknown errors
  return 500;
}

// Re-export other error utilities
export { 
  getErrorMessage, 
  logError,
  isRetryableError,
  withRetry,
  handleAsyncError
};

