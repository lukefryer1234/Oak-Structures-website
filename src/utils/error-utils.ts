// src/utils/error-utils.ts
import { FirestoreError } from '@/services/firebase/firestore-service';
import { AuthError } from '@/services/firebase/auth-service';
import { StorageError } from '@/services/firebase/storage-service';

/**
 * Error codes that might be recoverable with a retry
 */
export const RETRYABLE_ERROR_CODES = [
  'network-error',
  'unavailable',
  'internal',
  'timeout',
  'resource-exhausted',
];

/**
 * Helper to check if an error is of a Firebase type
 */
export function isFirebaseError(error: unknown): boolean {
  return (
    error instanceof FirestoreError ||
    error instanceof AuthError ||
    error instanceof StorageError
  );
}

/**
 * Returns a user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (isFirebaseError(error)) {
    // Firebase errors already have user-friendly messages
    return error.message;
  }
  
  if (error instanceof Error) {
    // Regular errors may have technical details, clean them up
    const message = error.message;
    
    // Remove common technical prefixes and make the message more user-friendly
    return message
      .replace(/^Error: /, '')
      .replace(/Firebase: /i, '')
      .replace(/FirebaseError: /i, '');
  }
  
  // For unknown error types, provide a generic message
  return "An unexpected error occurred. Please try again.";
}

/**
 * Determines if an error might be resolved by retrying the operation
 */
export function isRetryableError(error: unknown): boolean {
  if (isFirebaseError(error)) {
    // Check if the error code is in our list of retryable errors
    const errorCode = (error as any).code || '';
    return RETRYABLE_ERROR_CODES.some(code => errorCode.includes(code));
  }
  
  if (error instanceof Error) {
    // Check if the error message suggests a network or temporary issue
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('unavailable') ||
      errorMessage.includes('econnrefused') ||
      errorMessage.includes('econnreset')
    );
  }
  
  return false;
}

/**
 * Logs errors to console with additional context
 */
export function logError(error: unknown, context?: string): void {
  // In a real app, you might send this to an error tracking service
  const errorMessage = getErrorMessage(error);
  const errorContext = context ? ` (${context})` : '';
  
  console.error(`Error${errorContext}:`, error);
  console.error(`User message: ${errorMessage}`);
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    context?: string;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 500, context } = options;
  
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Only retry if the error is retryable
      if (!isRetryableError(error)) {
        logError(error, context);
        throw error;
      }
      
      if (attempt < maxRetries) {
        // Log the retry
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(`Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`, error);
        
        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Log the final error
        logError(error, `${context} (after ${maxRetries} attempts)`);
        throw error;
      }
    }
  }
  
  // This should never happen, but TypeScript requires it
  throw lastError;
}

/**
 * A wrapper function to handle errors in async functions
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  options: {
    context?: string;
    fallback?: T;
  } = {}
): Promise<T> {
  const { context, fallback } = options;
  
  try {
    return await fn();
  } catch (error) {
    logError(error, context);
    
    // Rethrow if no fallback is provided
    if (fallback === undefined) {
      throw error;
    }
    
    return fallback;
  }
}

