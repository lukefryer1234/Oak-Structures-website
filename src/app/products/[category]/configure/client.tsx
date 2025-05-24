"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CategoryConfigClient() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;

  // List of valid categories - these should redirect to specific pages
  const validCategories = ['garages', 'gazebos', 'porches', 'oak-beams', 'oak-flooring'];

  useEffect(() => {
    if (category && validCategories.includes(category)) {
      console.log(`Redirecting to specific configuration page for category: ${category}`);
      // Redirect to the specific product configuration page
      router.replace(`/products/${category}/configure`);
    } else if (category) {
      router.push('/products'); 
    }
  }, [category, router]);

  // Show loading while redirecting
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p>Loading configuration...</p>
    </div>
  );
}
