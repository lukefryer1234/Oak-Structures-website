import { Metadata } from 'next';

type MetadataProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'product';
  canonical?: string;
};

export function generateMetadata({
  title,
  description,
  keywords,
  image,
  type = 'website',
  canonical,
}: MetadataProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oakstructures.com';
  const siteName = 'Oak Structures';
  const defaultDescription = 'Quality oak structures for your home and garden - including garages, gazebos, porches, and beams.';
  const defaultImage = '/images/oak-structures-og.jpg';
  
  return {
    title: title ? `${title} | ${siteName}` : siteName,
    description: description || defaultDescription,
    keywords: keywords,
    openGraph: {
      type,
      title: title ? `${title} | ${siteName}` : siteName,
      description: description || defaultDescription,
      siteName,
      images: [{ url: image || `${baseUrl}${defaultImage}` }],
      url: canonical || baseUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} | ${siteName}` : siteName,
      description: description || defaultDescription,
      images: [image || `${baseUrl}${defaultImage}`],
    },
    alternates: {
      canonical: canonical || baseUrl,
    },
  };
}

