// src/app/products/[category]/page.tsx
'use client';

import { PublicRoute } from '@/components/auth/public-route';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  
  // Format category name for display
  const categoryName = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return (
    <PublicRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{categoryName}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Browse Our {categoryName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">This is a public page that anyone can view without authentication.</p>
            <p>Our selection of {categoryName.toLowerCase()} products will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </PublicRoute>
  );
}

