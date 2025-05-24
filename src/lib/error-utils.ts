// src/lib/error-utils.ts - Proxy file to fix import issues
export * from '@/utils/error-utils';

// Add CustomError class which is used in auth/server.ts
export class CustomError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = "CustomError";
    this.code = code;
  }
}
