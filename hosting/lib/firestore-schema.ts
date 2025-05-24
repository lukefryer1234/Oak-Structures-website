/**
 * This file defines TypeScript interfaces for the Firestore data model.
 * These interfaces provide type safety and documentation for the database schema.
 */

// User Profile
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'Customer' | 'Admin';
  createdAt: Date;
  addresses?: UserAddress[];
  phoneNumber?: string;
}

// User Address
export interface UserAddress {
  id: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  town: string;
  postcode: string;
  isDefault: boolean;
}

// Product Categories
export type ProductCategory = 
  'garages' | 
  'gazebos' | 
  'porches' | 
  'oak-beams' | 
  'oak-flooring' | 
  'special-deals';

// Base Product
export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  images: string[];
  price: number;
  featuredImage?: string;
  isActive: boolean;
  isConfigurable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Configurable Product
export interface ConfigurableProduct extends Product {
  isConfigurable: true;
  basePrice: number;
  options: ProductOption[];
}

// Product Option
export interface ProductOption {
  id: string;
  name: string;
  type: 'select' | 'checkbox' | 'radio' | 'input';
  required: boolean;
  choices?: ProductOptionChoice[];
}

// Product Option Choice
export interface ProductOptionChoice {
  id: string;
  name: string;
  priceAdjustment: number; // Can be positive or negative
  imageUrl?: string;
}

// Order Status
export type OrderStatus = 
  'Pending' | 
  'Processing' | 
  'Paid' | 
  'Shipped' | 
  'Delivered' | 
  'Cancelled' | 
  'Refunded';

// Order Item
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  configuration?: Record<string, any>; // Stores the chosen configuration
  category: ProductCategory;
  imageUrl?: string;
}

// Order
export interface Order {
  id: string;
  userId: string;
  billingAddress: UserAddress;
  shippingAddress?: UserAddress;
  useBillingAsShipping: boolean;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  vat: number;
  total: number;
  paymentMethod: 'paypal';
  paymentId?: string;
  orderNotes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Gallery Item
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  featured: boolean;
  order: number;
  createdAt: Date;
}

// Site Settings
export interface SiteSettings {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  vatRate: number;
  deliveryRates: DeliveryRate[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    pinterest?: string;
  };
}

// Delivery Rate
export interface DeliveryRate {
  id: string;
  name: string;
  description?: string;
  rate: number;
  minDistance?: number;
  maxDistance?: number;
}

