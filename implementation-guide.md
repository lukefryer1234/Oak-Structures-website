# Comprehensive Implementation Guide for Oak Structures Website

This guide provides detailed steps and code examples for implementing the improvements to the Oak Structures website. Each section covers a specific aspect of the plan with concrete, actionable examples.

## Table of Contents
1. [Setting up React Query with Firebase](#1-setting-up-react-query-with-firebase)
2. [Creating reusable Firebase hooks](#2-creating-reusable-firebase-hooks)
3. [Fixing server/client boundary issues](#3-fixing-serverclient-boundary-issues)
4. [Setting up proper service layers](#4-setting-up-proper-service-layers)
5. [Implementing better error handling](#5-implementing-better-error-handling)
6. [Improving the development environment](#6-improving-the-development-environment)
7. [Enhancing admin dashboard reliability](#7-enhancing-admin-dashboard-reliability)

## 1. Setting up React Query with Firebase

React Query provides a powerful data fetching, caching, and state management solution that works excellently with Firebase.

### Step 1: Install React Query and related dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Step 2: Set up React Query provider in your application

Create a new file at `src/lib/react-query.tsx`:

```tsx
// src/lib/react-query.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

// Define props for the provider component
interface ReactQueryProviderProps {
  children: ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Create a query client with configuration that persists between renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Configure reasonable defaults
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: import.meta.env.PROD, // Only in production
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Step 3: Add the provider to your app's layout

Update `src/app/layout.tsx`:

```tsx
// src/app/layout.tsx
import { ReactQueryProvider } from '@/lib/react-query'; // Import the provider

// ...existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interSans.variable} ${interMono.variable} font-sans antialiased`}
      >
        <ReactQueryProvider>
          <SiteProvider>
            <AuthProvider>
              <BackgroundImage>
                <div className="relative flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                </div>
              </BackgroundImage>
            </AuthProvider>
            <Toaster />
          </SiteProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

### Step 4: Example of using React Query with Firebase

Before (with direct Firebase calls):

```tsx
// Before: Manual data fetching with useState/useEffect
export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // ... other state

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchPaymentSettingsAction();
      setSettings(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // ... rest of the component
}
```

After (with React Query):

```tsx
// After: Using React Query for data fetching, caching, and state management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaymentSettings, updatePaymentSettings } from '@/services/settings-service';

export default function PaymentSettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  
  // Fetch payment settings with React Query
  const { 
    data: settings, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: getPaymentSettings,
  });
  
  // Create a mutation for saving settings
  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: updatePaymentSettings,
    onSuccess: (result) => {
      // Invalidate and refetch the settings after update
      queryClient.invalidateQueries({ queryKey: ['paymentSettings'] });
      toast({
        title: "Success",
        description: result.message,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update payment settings.",
      });
    },
  });

  // Form state derived from query data
  const [formData, setFormData] = useState<PaymentSettings | null>(null);
  
  // Update form state when data is loaded
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  // Form change handler
  const handleInputChange = (
    field: keyof PaymentSettings,
    value: string | boolean,
  ) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  // Submit handler with optimistic updates
  const handleSave = () => {
    if (!formData) return;
    
    if (
      formData.stripeEnabled &&
      (!formData.stripePublishableKey || !formData.stripeSecretKey)
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Stripe is enabled but keys are missing.",
      });
      return;
    }
    
    if (
      formData.paypalEnabled &&
      (!formData.paypalClientId || !formData.paypalClientSecret)
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "PayPal is enabled but credentials are missing.",
      });
      return;
    }

    // Optimistically update the UI
    queryClient.setQueryData(['paymentSettings'], formData);
    
    // Call the mutation
    saveSettings(formData);
  };

  // Rest of your component remains similar but uses the React Query state
  // ...
}
```

## 2. Creating reusable Firebase hooks

Create custom hooks that encapsulate Firebase logic for reuse across your application.

### Step 1: Create a directory for custom hooks

```bash
mkdir -p src/hooks/firebase
```

### Step 2: Create reusable document and collection hooks

```tsx
// src/hooks/firebase/useFirestoreDocument.ts
import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Type for document data
type DocumentData = Record<string, any>;

// Hook for getting a Firestore document once
export function useFirestoreDocument<T extends DocumentData>(
  collection: string,
  documentId: string
) {
  return useQuery<T>({
    queryKey: ['firestore', collection, documentId],
    queryFn: async () => {
      const docRef = doc(db, collection, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Document ${documentId} does not exist in ${collection}`);
      }
      
      return docSnap.data() as T;
    },
    enabled: !!collection && !!documentId, // Only run if both params are provided
  });
}

// Hook for real-time updates to a Firestore document
export function useFirestoreDocumentRealtime<T extends DocumentData>(
  collection: string,
  documentId: string
) {
  const queryClient = useQueryClient();
  
  // Setup the query
  const query = useQuery<T>({
    queryKey: ['firestore', 'realtime', collection, documentId],
    queryFn: async () => {
      const docRef = doc(db, collection, documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Document ${documentId} does not exist in ${collection}`);
      }
      
      return docSnap.data() as T;
    },
    enabled: !!collection && !!documentId,
  });
  
  // Setup the realtime listener
  useEffect(() => {
    if (!collection || !documentId) return;
    
    const docRef = doc(db, collection, documentId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        queryClient.setQueryData(
          ['firestore', 'realtime', collection, documentId],
          docSnap.data()
        );
      }
    }, (error) => {
      console.error("Realtime subscription error:", error);
    });
    
    return () => unsubscribe();
  }, [collection, documentId, queryClient]);
  
  return query;
}

// Hook for updating a Firestore document
export function useUpdateFirestoreDocument(
  collection: string,
  documentId: string
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: DocumentData) => {
      const docRef = doc(db, collection, documentId);
      await setDoc(docRef, data, { merge: true });
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate both regular and realtime queries
      queryClient.invalidateQueries({ 
        queryKey: ['firestore', collection, documentId]
      });
      queryClient.invalidateQueries({ 
        queryKey: ['firestore', 'realtime', collection, documentId]
      });
    }
  });
}
```

### Step 3: Create a collection hook for querying multiple documents

```tsx
// src/hooks/firebase/useFirestoreCollection.ts
import { collection, query, where, getDocs, orderBy, limit, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useQuery } from '@tanstack/react-query';

// Type for collection options
interface CollectionOptions {
  constraints?: QueryConstraint[];
  idField?: string;
  refetchInterval?: number | false;
}

// Hook for querying a Firestore collection
export function useFirestoreCollection<T>(
  collectionName: string,
  options: CollectionOptions = {}
) {
  const { constraints = [], idField = 'id', refetchInterval = false } = options;
  
  return useQuery<T[]>({
    queryKey: ['firestore', 'collection', collectionName, ...constraints],
    queryFn: async () => {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        [idField]: doc.id,
        ...doc.data()
      })) as T[];
    },
    refetchInterval,
  });
}

// Helper functions to build query constraints
export const createQueryConstraints = {
  where: (field: string, operator: string, value: any) => where(field, operator as any, value),
  orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => orderBy(field, direction),
  limit: (n: number) => limit(n),
};
```

### Step 4: Example of using the hooks

```tsx
// Example: Using the Firebase hooks in a component
import { useFirestoreDocument, useUpdateFirestoreDocument } from '@/hooks/firebase/useFirestoreDocument';
import { useFirestoreCollection, createQueryConstraints } from '@/hooks/firebase/useFirestoreCollection';

// Example: Fetching a single document
function ProductDetail({ productId }: { productId: string }) {
  const { data: product, isLoading, error } = useFirestoreDocument('products', productId);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
    </div>
  );
}

// Example: Fetching a collection with constraints
function ProductList({ category }: { category: string }) {
  const constraints = [
    createQueryConstraints.where('category', '==', category),
    createQueryConstraints.orderBy('name'),
    createQueryConstraints.limit(20)
  ];
  
  const { data: products, isLoading } = useFirestoreCollection('products', {
    constraints
  });
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      <h1>{category} Products</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name} - ${product.price}</li>
        ))}
      </ul>
    </div>
  );
}

// Example: Updating a document
function ProductEditForm({ productId }: { productId: string }) {
  const { data: product, isLoading } = useFirestoreDocument('products', productId);
  const updateProduct = useUpdateFirestoreDocument('products', productId);
  
  const handleSubmit = (formData) => {
    updateProduct.mutate(formData);
  };
  
  // Rest of the component
}
```

## 3. Fixing server/client boundary issues

The key issue with server/client boundaries is that Firebase should not be directly accessed in server components or actions, as it's a client-side library. Here's how to fix this.

### Step 1: Move Firebase operations from server components to API routes

Replace server actions with proper API routes:

Before:
```tsx
// src/app/admin/settings/payments/actions.ts
"use server";

import { doc, get

