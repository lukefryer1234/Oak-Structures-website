// This is a server component
import CategoryConfigClient from './client';

// This function runs at build time to generate static paths
export function generateStaticParams() {
  return [
    { category: 'garages' },
    { category: 'gazebos' },
    { category: 'porches' },
    { category: 'oak-beams' },
    { category: 'oak-flooring' }
  ];
}

export default function CategoryConfigPage() {
  return <CategoryConfigClient />;
}

