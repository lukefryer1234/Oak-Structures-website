
"use client";

import { useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import SimplifiedGaragePage from '@/app/products/garages/configure/page';
import SimplifiedGazeboPage from '@/app/products/gazebos/configure/page';
import SimplifiedPorchPage from '@/app/products/porches/configure/page';
import SimplifiedOakBeamsPage from '@/app/products/oak-beams/configure/page';
import SimplifiedOakFlooringPage from '@/app/products/oak-flooring/configure/page'; // Assuming this is the simplified version

// This component acts as a router to the specific simplified category page
export default function CategoryConfigClient() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;

  // List of valid categories - should match generateStaticParams
  const validCategories = ['garages', 'gazebos', 'porches', 'oak-beams', 'oak-flooring'];

  useEffect(() => {
    if (category && !validCategories.includes(category)) {
      notFound();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, router]); // router is included as it's used, though notFound is the key effect

  if (!category || !validCategories.includes(category)) {
    return null; // Or a generic loading/error component, notFound will handle if server-side
  }

  // Render the appropriate simplified informational component based on the category
  // These imports now point to the simplified static pages.
  switch (category) {
    case 'garages':
      return <SimplifiedGaragePage />;
    case 'gazebos':
      return <SimplifiedGazeboPage />;
    case 'porches':
      return <SimplifiedPorchPage />;
    case 'oak-beams':
      return <SimplifiedOakBeamsPage />;
    case 'oak-flooring':
      return <SimplifiedOakFlooringPage />; // Now points to the simplified page
    default:
      return notFound();
  }
}
