// src/services/firebase/storage-service.ts
import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  list,
  UploadTask,
  UploadTaskSnapshot,
  StorageReference,
  getMetadata,
  updateMetadata,
} from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Error handling helper
export class StorageError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
  }
}

// Helper function to handle Storage errors
function handleStorageError(error: any): never {
  if (error.code) {
    // Map Storage error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'storage/object-not-found': 'The file does not exist.',
      'storage/unauthorized': 'You do not have permission to access this file.',
      'storage/canceled': 'The file upload was canceled.',
      'storage/unknown': 'An unknown error occurred during file operation.',
      'storage/invalid-argument': 'Invalid argument provided to file operation.',
      'storage/no-default-bucket': 'No default Storage bucket found.',
      'storage/cannot-slice-blob': 'Cannot slice the file for upload.',
      'storage/server-file-wrong-size': 'File uploaded was different size than expected.',
      'storage/quota-exceeded': 'Storage quota has been exceeded.',
      'storage/unauthenticated': 'User is not authenticated.',
      'storage/retry-limit-exceeded': 'Maximum retry limit exceeded.',
      'storage/invalid-checksum': 'File checksum mismatch.',
      'storage/network-error': 'Network error during file operation.',
    };
    
    const message = errorMessages[error.code] || error.message || 'A file storage error occurred.';
    throw new StorageError(message, error.code);
  }
  
  throw new StorageError(error.message || 'An unknown storage error occurred.', 'storage/unknown');
}

// Retry functionality for flaky operations
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delayMs = 500): Promise<T> {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry permission errors
      if (error.code === 'storage/unauthorized' || error.code === 'storage/unauthenticated') {
        throw error;
      }
      
      // Only retry network errors or emulator connectivity issues
      if (error.code && (
        error.code === 'storage/network-error' || 
        error.code === 'storage/retry-limit-exceeded' || 
        error.code === 'storage/server-file-wrong-size'
      )) {
        console.warn(`Storage operation failed (attempt ${attempt}/${maxRetries}), retrying...`, error.code);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      
      // Don't retry other errors
      throw error;
    }
  }
  
  // If we get here, all retries have failed
  throw lastError;
}

// File metadata type
export interface FileMetadata {
  name: string;
  fullPath: string;
  size: number;
  contentType: string;
  timeCreated: Date;
  updated: Date;
  md5Hash?: string;
  customMetadata?: Record<string, string>;
}

// Upload progress type
export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

/**
 * Firebase Storage service
 * Provides methods for common Storage operations
 */
export const StorageService = {
  /**
   * Upload a file to storage with progress tracking
   */
  uploadFile(
    path: string, 
    file: File | Blob | Uint8Array | ArrayBuffer,
    metadata?: { contentType?: string; customMetadata?: Record<string, string> },
    onProgress?: (progress: UploadProgress) => void
  ): { task: UploadTask; promise: Promise<string> } {
    try {
      const storageRef = ref(storage, path);
      
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      // Create a promise that resolves with the download URL when the upload is complete
      const promise = new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            if (onProgress) {
              onProgress({
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress: snapshot.bytesTransferred / snapshot.totalBytes,
                state: snapshot.state,
              });
            }
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
      
      return { task: uploadTask, promise };
    } catch (error) {
      handleStorageError(error);
    }
  },
  
  /**
   * Upload a file without progress tracking (simpler API)
   */
  async uploadFileSimple(
    path: string, 
    file: File | Blob | Uint8Array | ArrayBuffer,
    metadata?: { contentType?: string; customMetadata?: Record<string, string> }
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      
      await withRetry(() => uploadBytes(storageRef, file, metadata));
      
      return await withRetry(() => getDownloadURL(storageRef));
    } catch (error) {
      handleStorageError(error);
    }
  },
  
  /**
   * Get the download URL for a file
   */
  async getFileUrl(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await withRetry(() => getDownloadURL(storageRef));
    } catch (error) {
      handleStorageError(error);
    }
  },
  
  /**
   * Delete a file
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await withRetry(() => deleteObject(storageRef));
    } catch (error) {
      handleStorageError(error);
    }
  },
  
  /**
   * List all files in a directory
   */
  async listFiles(path: string): Promise<string[]> {
    try {
      const storageRef = ref(storage, path);
      const result = await withRetry(() => listAll(storageRef));
      
      return result.items.map(item => item.fullPath);
    } catch (error) {
      handleStorageError(error);
    }
  },
  
  /**
   * List files in a directory with pagination
   */
  async listFilesPaginated(
    path: string, 
    options: { maxResults: number; pageToken?: string }
  ): Promise<{ files: string[]; nextPageToken?: string }> {
    try {
      const storageRef = ref(storage, path);
      const result = await withRetry(() => 
        list(storageRef, { maxResults: options.maxResults, pageToken: options.pageToken })
      );
      
      return {
        files: result.items.map(item => item.fullPath),
        nextPageToken: result.nextPageToken,
      };
    } catch (error) {
      handleStorageError(error);
    }
  },
  
  /**
   * Get metadata for a file
   */
  async getFileMetadata(path: string): Promise<FileMetadata> {
    try {
      const storageRef = ref(storage, path);
      const metadata = await withRetry(() => getMetadata(storageRef));
      
      return {
        name: metadata.name,
        fullPath: metadata.fullPath,
        size: metadata.size,
        contentType: metadata.contentType,
        timeCreated: new Date(metadata.timeCreated),
        updated: new Date(metadata.updated),
        md5Hash: metadata.md5Hash,
        customMetadata: metadata.customMetadata,
      };
    } catch (error) {
      handleStorageError(error);
    }
  },
  
  /**
   * Update metadata for a file
   */
  async updateFileMetadata(
    path: string, 
    metadata: { contentType?: string; customMetadata?: Record<string, string> }
  ): Promise<FileMetadata> {
    try {
      const storageRef = ref(storage, path);
      const updatedMetadata = await withRetry(() => updateMetadata(storageRef, metadata));
      
      return {
        name: updatedMetadata.name,
        fullPath: updatedMetadata.fullPath,
        size: updatedMetadata.size,
        contentType: updatedMetadata.contentType,
        timeCreated: new Date(updatedMetadata.timeCreated),
        updated: new Date(updatedMetadata.updated),
        md5Hash: updatedMetadata.md5Hash,
        customMetadata: updatedMetadata.customMetadata,
      };
    } catch (error) {
      handleStorageError(error);
    }
  },
  
  /**
   * Get a storage reference
   * Useful for advanced operations
   */
  getStorageRef(path: string): StorageReference {
    return ref(storage, path);
  },
};

export default StorageService;

