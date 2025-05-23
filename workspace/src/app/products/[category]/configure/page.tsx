
// This is a server component
import CategoryConfigClient from './client';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { category: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Valid categories for dynamic metadata and static params
const validCategoriesForMeta = ['garages', 'gazebos', 'porches', 'oak-beams', 'oak-flooring'];

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata // parent can be used to inherit metadata
): Promise<Metadata> {
  const category = params.category;

  if (!validCategoriesForMeta.includes(category)) {
    return {
      title: "Product Not Found",
      description: "The requested product category could not be found.",
    };
  }

  const categoryTitle = category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `Configure ${categoryTitle} | Timberline Commerce`,
    description: `Customize and price your bespoke ${categoryTitle}. Choose dimensions, materials, and features to get an instant estimate.`,
    // openGraph: {
    //   images: ['/some-specific-image.jpg'], // Optional: add a specific image for this category
    // },
  };
}


// This function runs at build time to generate static paths
export function generateStaticParams() {
  return [
    { category: 'garages' },
    { category: 'gazebos' },
    { category: 'porches' },
    { category: 'oak-beams' },
    { category: 'oak-flooring' }, // Re-added oak-flooring
  ];
}

export default function CategoryConfigPage() {
  // The actual rendering of the client component that handles specific category logic
  return <CategoryConfigClient />;
}
