
"use client";

import React, { useEffect } from 'react'; // Added React
import { useParams, useRouter, notFound } from 'next/navigation';
import SimplifiedGaragePage from '@/app/products/garages/configure/page';
import SimplifiedGazeboPage from '@/app/products/gazebos/configure/page';
import SimplifiedPorchPage from '@/app/products/porches/configure/page';
import SimplifiedOakBeamsPage from '@/app/products/oak-beams/configure/page';
// Minimal placeholder for the disabled oak flooring page
const SimplifiedOakFlooringPageDisabled = () => (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Oak Flooring</h1>
      <p>Information about our Oak Flooring products is coming soon. Please contact us for details.</p>
    </div>
);


// This component acts as a router to the specific simplified category page
export default function CategoryConfigClient() {
  const params = useParams();
  const router = useRouter(); // Added router
  const category = params.category as string;

  // List of valid categories - should match generateStaticParams
  // IMPORTANT: oak-flooring is excluded as its directory is disabled
  const validCategories = ['garages', 'gazebos', 'porches', 'oak-beams'];

  useEffect(() => {
    if (category && !validCategories.includes(category)) {
      // Check against the active categories. If not found, and it's not the known disabled one, then 404.
      // If it IS the known disabled one, we let it render its specific placeholder.
      if (category !== 'oak-flooring_COMPLETELY_DISABLED' && category !== 'oak-flooring') {
          notFound();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, router]); // Removed validCategories from deps

  if (!category) {
    return null; 
  }

  // Render the appropriate simplified informational component based on the category
  switch (category) {
    case 'garages':
      return <SimplifiedGaragePage />;
    case 'gazebos':
      return <SimplifiedGazeboPage />;
    case 'porches':
      return <SimplifiedPorchPage />;
    case 'oak-beams':
      return <SimplifiedOakBeamsPage />;
    case 'oak-flooring_COMPLETELY_DISABLED': // Handle the disabled path specifically
    case 'oak-flooring': // Also handle if somehow accessed via old path
      return <SimplifiedOakFlooringPageDisabled />;
    default:
      // If not a known category (and not caught by useEffect's notFound),
      // render a generic placeholder or notFound()
      if (validCategories.includes(category)) {
        // This case should ideally not be hit if the switch covers all validCategories
        return <div>Loading configuration for {category}...</div>;
      }
      return notFound();
  }
}
