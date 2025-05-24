// src/hooks/firebase/useFirestoreDocument.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect } from 'react';

// Generic type for document data
export type DocumentData = Record<string, any>;

/**
 * Hook for fetching a Firestore document once
 * @param collectionName - The name of the Firestore collection
 * @param documentId - The ID of the document to fetch
 * @param options - Additional options for the query
 */
export function useFirestoreDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string | null | undefined,
  options: {
    enabled?: boolean;
    staleTime?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { enabled = true, staleTime, onSuccess, onError } = options;

  return useQuery<T, Error>({
    queryKey: ['firestore', collectionName, documentId],
    queryFn: async () => {
      if (!documentId) {
        throw new Error('Document ID is required');
      }
      
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Document ${documentId} does not exist in ${collectionName}`);
      }
      
      return { id: docSnap.id, ...docSnap.data() } as T;
    },
    enabled: !!documentId && enabled,
    staleTime,
    onSuccess,
    onError,
  });
}

/**
 * Hook for real-time subscription to a Firestore document
 * @param collectionName - The name of the Firestore collection
 * @param documentId - The ID of the document to subscribe to
 * @param options - Additional options for the subscription
 */
export function useFirestoreDocumentRealtime<T extends DocumentData>(
  collectionName: string,
  documentId: string | null | undefined,
  options: {
    enabled?: boolean;
    onData?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { enabled = true, onData, onError } = options;
  const queryClient = useQueryClient();
  const queryKey = ['firestore', 'realtime', collectionName, documentId];
  
  // Initial fetch (will be used until subscription provides first value)
  const query = useQuery<T, Error>({
    queryKey,
    queryFn: async () => {
      if (!documentId) {
        throw new Error('Document ID is required');
      }
      
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Document ${documentId} does not exist in ${collectionName}`);
      }
      
      return { id: docSnap.id, ...docSnap.data() } as T;
    },
    enabled: !!documentId && enabled,
  });
  
  // Set up the real-time listener
  useEffect(() => {
    if (!documentId || !enabled) return;
    
    const docRef = doc(db, collectionName, documentId);
    
    console.log(`Setting up realtime listener for ${collectionName}/${documentId}`);
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as T;
          queryClient.setQueryData(queryKey, data);
          if (onData) onData(data);
        } else {
          // Document deleted or doesn't exist
          const error = new Error(`Document ${documentId} no longer exists in ${collectionName}`);
          queryClient.setQueryData(queryKey, null);
          if (onError) onError(error);
        }
      },
      (error) => {
        console.error(`Error in realtime listener for ${collectionName}/${documentId}:`, error);
        if (onError) onError(error);
      }
    );
    
    return () => {
      console.log(`Removing realtime listener for ${collectionName}/${documentId}`);
      unsubscribe();
    };
  }, [collectionName, documentId, enabled, queryClient, onData, onError]);
  
  return query;
}

/**
 * Hook for updating a Firestore document
 * @param collectionName - The name of the Firestore collection
 * @param documentId - The ID of the document to update
 */
export function useUpdateFirestoreDocument(
  collectionName: string,
  documentId: string | null | undefined
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: DocumentData) => {
      if (!documentId) {
        throw new Error('Document ID is required');
      }
      
      const docRef = doc(db, collectionName, documentId);
      await setDoc(docRef, data, { merge: true });
      return { success: true, data };
    },
    onSuccess: (result, variables) => {
      // Invalidate the regular document query
      queryClient.invalidateQueries({ 
        queryKey: ['firestore', collectionName, documentId] 
      });
      
      // Invalidate the realtime document query
      queryClient.invalidateQueries({ 
        queryKey: ['firestore', 'realtime', collectionName, documentId]
      });
      
      // Optimistically update the cache
      queryClient.setQueryData(['firestore', collectionName, documentId], {
        id: documentId,
        ...variables,
      });
      
      queryClient.setQueryData(['firestore', 'realtime', collectionName, documentId], {
        id: documentId,
        ...variables,
      });
    },
  });
}

/**
 * Hook for deleting a Firestore document
 * @param collectionName - The name of the Firestore collection
 */
export function useDeleteFirestoreDocument(collectionName: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (documentId: string) => {
      if (!documentId) {
        throw new Error('Document ID is required');
      }
      
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      return { success: true, documentId };
    },
    onSuccess: (result) => {
      // Remove document from cache
      queryClient.removeQueries({ 
        queryKey: ['firestore', collectionName, result.documentId]
      });
      
      // Remove realtime query from cache
      queryClient.removeQueries({ 
        queryKey: ['firestore', 'realtime', collectionName, result.documentId]
      });
    },
  });
}

