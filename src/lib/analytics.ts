import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Initialize Google Analytics
export const initGA = () => {
  window.dataLayer = window.dataLayer || [];
  function gtag(...args) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID, {
    page_path: window.location.pathname,
  });
};

// Track page view
export const pageview = (url) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Track event
export const event = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
};

// Hook to track page views
export const usePageTracking = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (typeof window !== 'undefined' && GA_TRACKING_ID) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      pageview(url);
    }
  }, [pathname, searchParams]);
};

// E-commerce tracking
export const ecommerceEvent = {
  viewItem: (item) => {
    window.gtag('event', 'view_item', {
      currency: 'GBP',
      value: item.price,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category,
        quantity: 1,
      }],
    });
  },
  addToCart: (item, quantity = 1) => {
    window.gtag('event', 'add_to_cart', {
      currency: 'GBP',
      value: item.price * quantity,
      items: [{
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category,
        quantity,
      }],
    });
  },
  purchase: (transaction) => {
    window.gtag('event', 'purchase', {
      transaction_id: transaction.id,
      value: transaction.total,
      tax: transaction.tax,
      shipping: transaction.shipping,
      currency: 'GBP',
      items: transaction.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category,
        quantity: item.quantity,
      })),
    });
  },
};

