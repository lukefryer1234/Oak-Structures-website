
// This is a server component
import CategoryConfigClient from './client';
import type { Metadata } from 'next';

type Props = {
  params: { category: string };
  // searchParams: { [key: string]: string | string[] | undefined }; // searchParams not used for metadata here
};

// Valid categories for dynamic metadata and static params
const validCategoriesForMeta = ['garages', 'gazebos', 'porches', 'oak-beams', 'oak-flooring']; // Re-added oak-flooring

export async function generateMetadata(
  { params }: Props,
  // _parent: ResolvingMetadata // parent can be used to inherit metadata
): Promise<Metadata> {
  const category = params.category;

  if (!validCategoriesForMeta.includes(category)) {
    return {
      title: "Product Not Found",
      description: "The requested product category could not be found.",
    };
  }

  const categoryTitle = category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Simplified description for minimal launch
  return {
    title: `${categoryTitle} | Timberline Commerce`,
    description: `Learn more about our high-quality, bespoke ${categoryTitle}. Contact us for a custom quote.`,
  };
}


// This function runs at build time to generate static paths
export function generateStaticParams() {
  return [
    { category: 'garages' },
    { category: 'gazebos' },
    { category: 'porches' },
    { category: 'oak-beams' },
    { category: 'oak-flooring' }, // Ensured oak-flooring is included
  ];
}

export default function CategoryConfigPage() {
  // The actual rendering of the client component that handles specific category logic
  // For a minimal launch, CategoryConfigClient might simply render children or a placeholder
  return <CategoryConfigClient />;
}
