"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CategoryConfigClient() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;

  // List of valid categories
  const validCategories = ['garages', 'gazebos', 'porches', 'oak-beams', 'oak-flooring'];

  useEffect(() => {
    if (category) {
      if (validCategories.includes(category)) {
        console.log(`Loading configuration page for category: ${category}`);
      } else {
        router.push('/products'); 
      }
    }
  }, [category, router]);

  if (!category || !validCategories.includes(category)) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading or invalid category...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Configure {category.charAt(0).toUpperCase() + category.slice(1)}</h1>
      <p>Configuration options for {category} will be displayed here.</p>
    </div>
  );
}

