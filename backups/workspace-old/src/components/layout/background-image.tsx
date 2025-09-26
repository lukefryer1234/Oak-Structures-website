
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Placeholder types - match the structure in admin/products/photos/page.tsx
interface ProductImage {
  id: string;
  type: string; // Should be 'background'
  target: string; // Page key (e.g., 'home', 'about')
  url: string;
  altText: string;
  opacity?: number;
}

// Placeholder fetch function - replace with actual API call
const fetchBackgroundImages = async (): Promise<ProductImage[]> => {
    // Simulate fetching data, potentially from localStorage or an API
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

    let storedData = null;
    // Ensure localStorage is only accessed on the client-side
    if (typeof window !== 'undefined') {
        try {
            storedData = localStorage.getItem('productImages');
        } catch (e) {
            console.error("Error accessing localStorage:", e);
            // Fallback or handle error appropriately if localStorage is blocked/unavailable
        }
    }

    if (storedData) {
        try {
            const allImages: ProductImage[] = JSON.parse(storedData);
            return allImages.filter(img => img.type === 'background');
        } catch (e) {
            console.error("Failed to parse background images from localStorage", e);
        }
    }
     // Fallback data if nothing stored or if server-side
    return [
      { id: 'img7', type: 'background', target: 'home', url: '/images/backgrounds/home-bg.jpg', altText: 'Homepage Background Image', opacity: 5 },
      { id: 'img8', type: 'background', target: 'about', url: '/images/backgrounds/about-bg.jpg', altText: 'About Page Background Image', opacity: 5 },
        { id: 'bg-admin', type: 'background', target: 'admin', url: '/images/backgrounds/admin-bg.jpg', altText: 'Admin Area Background', opacity: 5 },
        { id: 'bg-login', type: 'background', target: 'login', url: '/images/backgrounds/login-bg.jpg', altText: 'Login Page Background', opacity: 10 },
        { id: 'bg-basket', type: 'background', target: 'basket', url: '/images/backgrounds/basket-bg.jpg', altText: 'Basket Background', opacity: 5 },
        { id: 'bg-checkout', type: 'background', target: 'checkout', url: '/images/backgrounds/checkout-bg.jpg', altText: 'Checkout Background', opacity: 5 },
         { id: 'bg-confirmation', type: 'background', target: 'order-confirmation', url: '/images/backgrounds/confirmation-bg.jpg', altText: 'Order Confirmation Background', opacity: 3 },
         { id: 'bg-contact', type: 'background', target: 'contact', url: '/images/backgrounds/contact-bg.jpg', altText: 'Contact Background', opacity: 5 },
         { id: 'bg-custom-order', type: 'background', target: 'custom-order', url: '/images/backgrounds/custom-order-bg.jpg', altText: 'Custom Order Background', opacity: 5 },
         { id: 'bg-delivery', type: 'background', target: 'delivery', url: '/images/backgrounds/delivery-bg.jpg', altText: 'Delivery Background', opacity: 5 },
         { id: 'bg-faq', type: 'background', target: 'faq', url: '/images/backgrounds/faq-bg.jpg', altText: 'FAQ Background', opacity: 5 },
         { id: 'bg-gallery', type: 'background', target: 'gallery', url: '/images/backgrounds/gallery-bg.jpg', altText: 'Gallery Background', opacity: 5 },
         { id: 'bg-privacy', type: 'background', target: 'privacy', url: '/images/backgrounds/privacy-bg.jpg', altText: 'Privacy Background', opacity: 5 },
         { id: 'bg-terms', type: 'background', target: 'terms', url: '/images/backgrounds/terms-bg.jpg', altText: 'Terms Background', opacity: 5 },
         { id: 'bg-account', type: 'background', target: 'account', url: '/images/backgrounds/account-bg.jpg', altText: 'Account Background', opacity: 5 },
         { id: 'bg-products', type: 'background', target: 'products', url: '/images/backgrounds/products-bg.jpg', altText: 'Products Background', opacity: 5 },
          { id: 'bg-special-deals', type: 'background', target: 'special-deals', url: '/images/backgrounds/special-deals-bg.jpg', altText: 'Special Deals Background', opacity: 5 },
    ];
};


export function BackgroundImage({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [backgroundImage, setBackgroundImage] = useState<ProductImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBackgrounds = async () => {
        setIsLoading(true);
        const backgrounds = await fetchBackgroundImages();
        // Determine the target page key from the pathname
        let targetPage = pathname === '/' ? 'home' : pathname.split('/')[1] || 'home';

        if (targetPage === 'products' && pathname.includes('/configure')) {
            const categorySlug = pathname.split('/')[2];
            // Ensure categorySlug is one of the expected ones before appending -config
            const validCategoriesForConfigBg = ['garages', 'gazebos', 'porches', 'oak-beams', 'oak-flooring_COMPLETELY_DISABLED']; // Match the disabled name
            if (categorySlug && validCategoriesForConfigBg.includes(categorySlug)) {
                 targetPage = `${categorySlug}-config`;
            } else {
                targetPage = 'products'; // Fallback for general /products or unknown sub-paths
            }
        } else if (pathname.startsWith('/account')) {
            targetPage = 'account';
        } else if (pathname.startsWith('/admin')) {
            targetPage = 'admin';
        }


        const matchingBg = backgrounds.find(bg => bg.target === targetPage);
        setBackgroundImage(matchingBg || null);
        setIsLoading(false);
    };

    loadBackgrounds();
  }, [pathname]);

  return (
    <div className="relative isolate overflow-hidden">
       {!isLoading && backgroundImage && (
           <Image
             src={backgroundImage.url}
             alt={backgroundImage.altText || 'Background image'}
             fill // Changed from layout="fill" to fill for Next.js 13+ Image component
             sizes="100vw" // Recommended when using fill
             className={cn(
                "absolute inset-0 -z-10 transition-opacity duration-500"
             )}
             style={{ // Consolidated style prop
               objectFit: 'cover',
               opacity: (backgroundImage.opacity ?? 5) / 100,
             }}
             aria-hidden="true"
             priority
           />
       )}
        <div className="relative z-10">
            {children}
        </div>
    </div>
  );
}
