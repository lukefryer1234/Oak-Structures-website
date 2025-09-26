
// This is a server component
import CategoryConfigClient from './client';
import type { Metadata } from 'next';

type Props = {
  params: { category: string };
};

// Valid categories for dynamic metadata and static params
// IMPORTANT: oak-flooring is excluded because its directory is currently disabled.
const validCategoriesForMeta = ['garages', 'gazebos', 'porches', 'oak-beams'];

export async function generateMetadata(
  { params }: Props,
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
    title: `${categoryTitle} | Timberline Commerce`,
    description: `Learn more about our high-quality, bespoke ${categoryTitle}. Contact us for a custom quote.`,
  };
}

// This function runs at build time to generate static paths
// IMPORTANT: oak-flooring is excluded.
export function generateStaticParams() {
  return [
    { category: 'garages' },
    { category: 'gazebos' },
    { category: 'porches' },
    { category: 'oak-beams' },
    // { category: 'oak-flooring' }, // Excluded for now
  ];
}

export default function CategoryConfigPage() {
  return <CategoryConfigClient />;
}
