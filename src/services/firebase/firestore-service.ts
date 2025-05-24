import { 
  collection, doc, getDoc, getDocs, query, 
  where, orderBy, limit, setDoc, updateDoc, 
  deleteDoc, writeBatch, runTransaction,
  QueryConstraint,
  DocumentReference,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  Timestamp,
  Unsubscribe,
  addDoc,
  startAfter,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Error handling helper
export class FirestoreError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'FirestoreError';
    this.code = code;
  }
}

// Helper function to handle Firestore errors
function handleFirestoreError(error: any): never {
  if (error.code) {
    // Map Firestore error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'permission-denied': 'You do not have permission to access this data.',
      'not-found': 'The requested document does not exist.',
      'already-exists': 'The document already exists.',
      'resource-exhausted': 'The operation was rejected because the system is out of resources.',
      'failed-precondition': 'The operation was rejected because the system is not in a state required for the operation.',
      'aborted': 'The operation was aborted.',
      'out-of-range': 'The operation was attempted past the valid range.',
      'unimplemented': 'The operation is not implemented or supported.',
      'internal': 'An internal error occurred.',
      'unavailable': 'The service is currently unavailable.',
      'data-loss': 'Unrecoverable data loss or corruption.',
      'unauthenticated': 'The request does not have valid authentication credentials.',
    };
    
    const message = errorMessages[error.code] || error.message || 'A Firestore error occurred.';
    throw new FirestoreError(message, error.code);
  }
  
  throw new FirestoreError(error.message || 'An unknown Firestore error occurred.', 'unknown');
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
      if (error.code === 'permission-denied') {
        throw error;
      }
      
      // Only retry network errors or emulator connectivity issues
      if (error.code && (
        error.code === 'unavailable' || 
        error.code === 'internal' || 
        error.code === 'resource-exhausted'
      )) {
        console.warn(`Firestore operation failed (attempt ${attempt}/${maxRetries}), retrying...`, error.code);
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

// Helper to convert Firestore timestamps to Date objects recursively
function convertTimestamps<T>(data: any): T {
  if (!data) return data;
  
  if (data instanceof Timestamp) {
    return data.toDate() as any;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertTimestamps(item)) as any;
  }
  
  if (typeof data === 'object') {
    const result: any = {};
    Object.keys(data).forEach(key => {
      result[key] = convertTimestamps(data[key]);
    });
    return result;
  }
  
  return data as T;
}

// Pagination result type
export interface PaginationResult<T> {
  data: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Firestore service
 * Provides methods for common Firestore operations
 */
export const FirestoreService = {
  /**
   * Get a document from Firestore
   */
  async getDocument<T>(collectionName: string, docId: string): Promise<T> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await withRetry(() => getDoc(docRef));
      
      if (!docSnap.exists()) {
        throw new FirestoreError(`Document ${docId} not found in collection ${collectionName}`, 'not-found');
      }
      
      return convertTimestamps<T>({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
      handleFirestoreError(error);
    }
  },
  
  /**
   * Check if a document exists
   */
  async documentExists(collectionName: string, docId: string): Promise<boolean> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await withRetry(() => getDoc(docRef));
      return docSnap.exists();
    } catch (error) {
      handleFirestoreError(error);
    }
  },
  
  /**
   * Get all documents from a collection
   */
  async getCollection<T>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await withRetry(() => getDocs(q));
      
      return querySnapshot.docs.map(doc => 
        convertTimestamps<T>({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      handleFirestoreError(error);
    }
  },
  
  /**
   * Get a paginated collection
   */
  async getPaginatedCollection<T>(
    collectionName: string, 
    pageSize: number = 10, 
    constraints: QueryConstraint[] = [],
    startAfterDoc?: DocumentSnapshot
  ): Promise<PaginationResult<T>> {
    try {
      const collectionRef = collection(db, collectionName);
      
      let queryConstraints = [...constraints, limit(pageSize)];
      if (startAfterDoc) {
        queryConstraints.push(startAfter(startAfterDoc));
      }
      
      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await withRetry(() => getDocs(q));
      
      const data = querySnapshot.docs.map(doc => 
        convertTimestamps<T>({ id: doc.id, ...doc.data() })
      );
      
      const lastDoc = querySnapshot.docs.length > 0 
        ? querySnapshot.docs[querySnapshot.docs.length - 1] 
        : null;
      
      const hasMore = querySnapshot.docs.length === pageSize;
      
      return { data, lastDoc, hasMore };
    } catch (error) {
      handleFirestoreError(error);
    }
  },
  
  /**
   * Create a document with auto-generated ID
   */
  async addDocument<T extends object>(collectionName: string, data: T): Promise<string> {
    try {
      // Add timestamps
      const dataWithTimestamps = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const collectionRef = collection(db, collectionName);
      const docRef = await withRetry(() => addDoc(collectionRef, dataWithTimestamps));
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error);
    }
  },
  
  /**
   * Create or update a document with known ID
   */
  async setDocument<T extends object>(
    collectionName: string, 
    docId: string, 
    data: T, 
    options = { merge: true }
  ): Promise<void> {
    try {
      // Add timestamps
      const dataWithTimestamps = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      
      // Only add createdAt if it's a new document and we're not doing a merge
      if (!options.merge) {
        dataWithTimestamps.createdAt = serverTimestamp();
      }
      
      const docRef = doc(db, collectionName, docId);
      await withRetry(() => setDoc(docRef, dataWithTimestamps, options));
    } catch (error) {
      handleFirestoreError(error);
    }
  },
  
  /**
   * Update specific fields of a document
   */
  async updateDocument(
    collectionName: string, 
    docId: string, 
    data: Partial<DocumentData>
  ): Promise<void> {
    try {
      // Add updated timestamp
      const dataWithTimestamp = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      
      const docRef = doc(db, collectionName, docId);
      await withRetry(() => updateDoc(docRef, dataWithTimestamp));
    } catch (error) {
      handleFirestoreError(error);
    }
  },
  
  /**
   * Delete a document
   */
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await withRetry(() => deleteDoc(docRef));
    } catch (error) {
      handleFirestoreError(error);
    }
  },
  
  /**
   * Perform multiple write operations in a batch
   */
  async batchOperation(operations: Array<{
    type: 'set' | 'update' | 'delete';
    collectionName: string;
    docId: string;
    data?: any;
    options?: { merge: boolean };
  }>): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      operations.forEach(operation => {
        const docRef = doc(db, operation.collectionName, operation.docId);
        
        if (operation.type === 'set') {
          // Add timestamps
          const dataWithTimestamps = {
            ...operation.data,
            updatedAt: serverTimestamp(),
          };
          
          // Only add createdAt if we're not doing a merge
          if (!operation.options?.merge) {
            dataWithTimestamps.createdAt = serverTimestamp();
          }
          
          batch.set(docRef, dataWithTimestamps, operation.options);
        } else if (operation.type === 'update') {
          // Add updated timestamp
          const dataWithTimestamp = {
            ...operation.data,
            updatedAt: serverTimestamp(),
          };
          
          batch.update(docRef, dataWithTimestamp);
        } else if (operation.type === 'delete') {
          batch.delete(docRef);
        }
      });
      
      await withRetry(() => batch.commit());
    } catch (error) {
      handleFirestoreError(error);
    }
  },
  
  /**
   * Perform multiple operations in a transaction
   */
  async transactionOperation<T>(
    updateFunction: (transaction: any) => Promise<T>
  ): Promise<T> {
    try {
      return await withRetry(() => 
        runTransaction(db, updateFunction)
      );
    } catch (error) {
      handleFirestoreError(error);
    }
  },
  
  /**
   * Listen to a document in real-time
   */
  listenToDocument<T>(
    collectionName: string, 
    docId: string, 
    callback: (data: T | null) => void
  ): Unsubscribe {
    const docRef = doc(db, collectionName, docId);
    
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = convertTimestamps<T>({ id: docSnap.id, ...docSnap.data() });
          callback(data);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(`Error listening to document ${collectionName}/${docId}:`, error);
        callback(null);
      }
    );
  },
  
  /**
   * Listen to a collection in real-time
   */
  listenToCollection<T>(
    collectionName: string, 
    callback: (data: T[]) => void,
    constraints: QueryConstraint[] = []
  ): Unsubscribe {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    
    return onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => 
          convertTimestamps<T>({ id: doc.id, ...doc.data() })
        );
        callback(data);
      },
      (error) => {
        console.error(`Error listening to collection ${collectionName}:`, error);
        callback([]);
      }
    );
  },
  
  /**
   * Query helpers
   */
  constraints: {
    where: (field: string, operator: any, value: any) => where(field, operator, value),
    orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => orderBy(field, direction),
    limit: (n: number) => limit(n),
  },
};

export default FirestoreService;

