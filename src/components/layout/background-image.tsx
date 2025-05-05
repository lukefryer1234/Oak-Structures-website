
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
    const storedData = localStorage.getItem('productImages'); // Assuming data is stored here
    if (storedData) {
        try {
            const allImages: ProductImage[] = JSON.parse(storedData);
            return allImages.filter(img => img.type === 'background');
        } catch (e) {
            console.error("Failed to parse background images", e);
        }
    }
     // Fallback data if nothing stored (should match placeholders in admin page)
    return [
      { id: 'img7', type: 'background', target: 'home', url: 'https://picsum.photos/seed/home-bg/1920/1080', altText: 'Homepage Background Image', opacity: 5 },
      { id: 'img8', type: 'background', target: 'about', url: 'https://picsum.photos/seed/about-bg/1920/1080', altText: 'About Page Background Image', opacity: 5 },
       // Add other default background images used in the app here initially
        { id: 'bg-admin', type: 'background', target: 'admin', url: 'https://picsum.photos/seed/admin-bg/1920/1080', altText: 'Admin Area Background', opacity: 5 },
        { id: 'bg-login', type: 'background', target: 'login', url: 'https://picsum.photos/seed/auth-background/1920/1080', altText: 'Login Page Background', opacity: 10 },
        { id: 'bg-basket', type: 'background', target: 'basket', url: 'https://picsum.photos/seed/basket-bg/1920/1080', altText: 'Basket Background', opacity: 5 },
        { id: 'bg-checkout', type: 'background', target: 'checkout', url: 'https://picsum.photos/seed/checkout-bg/1920/1080', altText: 'Checkout Background', opacity: 5 },
         { id: 'bg-confirmation', type: 'background', target: 'order-confirmation', url: 'https://picsum.photos/seed/confirmation-bg/1920/1080', altText: 'Order Confirmation Background', opacity: 3 },
         { id: 'bg-contact', type: 'background', target: 'contact', url: 'https://picsum.photos/seed/contact-bg/1920/1080', altText: 'Contact Background', opacity: 5 },
         { id: 'bg-custom-order', type: 'background', target: 'custom-order', url: 'https://picsum.photos/seed/custom-order-bg/1920/1080', altText: 'Custom Order Background', opacity: 5 },
         { id: 'bg-delivery', type: 'background', target: 'delivery', url: 'https://picsum.photos/seed/delivery-bg/1920/1080', altText: 'Delivery Background', opacity: 5 },
         { id: 'bg-faq', type: 'background', target: 'faq', url: 'https://picsum.photos/seed/faq-bg/1920/1080', altText: 'FAQ Background', opacity: 5 },
         { id: 'bg-gallery', type: 'background', target: 'gallery', url: 'https://picsum.photos/seed/gallery-bg/1920/1080', altText: 'Gallery Background', opacity: 5 },
         { id: 'bg-privacy', type: 'background', target: 'privacy', url: 'https://picsum.photos/seed/privacy-bg/1920/1080', altText: 'Privacy Background', opacity: 5 },
         { id: 'bg-terms', type: 'background', target: 'terms', url: 'https://picsum.photos/seed/terms-bg/1920/1080', altText: 'Terms Background', opacity: 5 },
         { id: 'bg-account', type: 'background', target: 'account', url: 'https://picsum.photos/seed/account-bg/1920/1080', altText: 'Account Background', opacity: 5 },
         { id: 'bg-products', type: 'background', target: 'products', url: 'https://picsum.photos/seed/products-bg/1920/1080', altText: 'Products Background', opacity: 5 },
          { id: 'bg-special-deals', type: 'background', target: 'special-deals', url: 'https://picsum.photos/seed/deals-bg/1920/1080', altText: 'Special Deals Background', opacity: 5 },
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
        // Simple logic: take the first segment after '/' or use 'home' for root
        // More complex routing might need more specific logic
        let targetPage = pathname === '/' ? 'home' : pathname.split('/')[1] || 'home';

        // Special case for product configuration pages
        if (targetPage === 'products' && pathname.includes('/configure')) {
            targetPage = pathname.split('/')[2] || 'products'; // Use the category slug if available
             targetPage = `${targetPage}-config`; // Append '-config' or similar to differentiate
        } else if (targetPage === 'products') {
             // For general /products/[category] pages, maybe use a default 'products' background
             targetPage = 'products';
        }

        // Add specific checks for other nested routes if needed
        if (pathname.startsWith('/account')) targetPage = 'account';
        if (pathname.startsWith('/admin')) targetPage = 'admin';


        const matchingBg = backgrounds.find(bg => bg.target === targetPage);
        setBackgroundImage(matchingBg || null); // Set to null if no match
        setIsLoading(false);
    };

    loadBackgrounds();
  }, [pathname]); // Re-run when pathname changes

  return (
    <div className="relative isolate overflow-hidden">
       {/* Background Image */}
       {!isLoading && backgroundImage && (
           <Image
             src={backgroundImage.url}
             alt={backgroundImage.altText || 'Background image'}
             layout="fill"
             objectFit="cover"
             className={cn(
                "absolute inset-0 -z-10 transition-opacity duration-500",
                `opacity-${backgroundImage.opacity ?? 5}` // Apply opacity class dynamically
             )}
             style={{ opacity: (backgroundImage.opacity ?? 5) / 100 }} // Inline style for opacity
             aria-hidden="true"
             priority // Consider loading backgrounds early if important
           />
       )}
       {/* Ensure content has relative positioning to appear above background */}
        <div className="relative z-10">
            {children}
        </div>
    </div>
  );
}

    