'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useFirestoreCollection } from '@/hooks/firebase/useFirestoreCollection';
import { useFirestoreDocument } from '@/hooks/firebase/useFirestoreDocument';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorDisplay } from '@/components/error/error-display';

// Product configuration component
export function ProductConfigClient() {
  const params = useParams();
  const category = params.category as string;
  
  // Use React Query hooks instead of direct Firebase access
  const { 
    data: productOptions,
    isLoading: isLoadingOptions,
    error: optionsError
  } = useFirestoreCollection(
    `productOptions`,
    {
      where: [['category', '==', category]],
      orderBy: [['displayOrder', 'asc']],
      enabled: !!category
    }
  );
  
  // Additional queries for product-specific data
  const {
    data: categoryConfig,
    isLoading: isLoadingConfig,
    error: configError
  } = useFirestoreDocument(
    'productCategories',
    category,
    { enabled: !!category }
  );
  
  // Handle loading state
  if (isLoadingOptions || isLoadingConfig) {
    return <LoadingSpinner size="lg" />;
  }
  
  // Handle errors
  if (optionsError || configError) {
    return <ErrorDisplay error={optionsError || configError} />;
  }
  
  // Render product configuration UI
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{category} Configuration</h1>
      
      {categoryConfig && (
        <div className="mb-8">
          <p className="text-gray-700">{categoryConfig.description}</p>
        </div>
      )}
      
      {productOptions && productOptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {productOptions.map((option) => (
            <div key={option.id} className="border rounded-lg p-4 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{option.name}</h3>
              <p className="mb-4 text-gray-600">{option.description}</p>
              
              {/* Option selection UI would go here */}
              <div className="mt-4">
                {/* Example option UI */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No configuration options available for this product.</p>
      )}
    </div>
  );
}

// Wrap with error boundary
export default function ProductConfigPage() {
  return (
    <ErrorBoundary fallback={<ErrorDisplay />}>
      <ProductConfigClient />
    </ErrorBoundary>
  );
}

