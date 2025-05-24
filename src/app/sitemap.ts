import { MetadataRoute } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase-admin';

// Get Firebase Admin app
const getDb = () => {
  try {
    return getFirestore(getAdminApp());
  } catch (error) {
    console.error('Error initializing Firestore admin:', error);
    return null;
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oakstructures.com';
  const db = getDb();
  
  // Base URLs for static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/special-deals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
  
  // Product categories
  const categories = [
    'garages',
    'gazebos',
    'porches',
    'oak-beams',
    'oak-flooring',
  ];
  
  const categoryUrls = categories.map(category => ({
    url: `${baseUrl}/products/${category}/configure`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));
  
  // Get dynamic product URLs from Firestore
  let productUrls: MetadataRoute.Sitemap = [];
  
  if (db) {
    try {
      const productsSnapshot = await db.collection('products').get();
      
      productUrls = productsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          url: `${baseUrl}/products/${data.category}/${doc.id}`,
          lastModified: data.updatedAt ? new Date(data.updatedAt.toDate()) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        };
      });
    } catch (error) {
      console.error('Error fetching products for sitemap:', error);
    }
  }
  
  // Combine all URLs
  return [...staticPages, ...categoryUrls, ...productUrls];
}

