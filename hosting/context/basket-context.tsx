"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  BasketItem, 
  getBasketItems, 
  addToBasket,
  updateBasketItemQuantity,
  removeFromBasket,
  clearBasket,
  getBasketTotal,
  ConfigState,
  ProductCategory
} from '@/services/product-service';
import { useAuth } from './auth-context';
import { toast } from '@/hooks/use-toast';

// Interface for basket context state
interface BasketContextState {
  items: BasketItem[];
  subtotal: number;
  vat: number;
  shippingCost: number;
  total: number;
  itemCount: number;
  loading: boolean;
  addingToBasket: boolean;
  removingFromBasket: boolean;
  clearingBasket: boolean;
  error: string | null;
}

// Interface for basket context value
interface BasketContextValue extends BasketContextState {
  addItem: (
    productId: string,
    quantity?: number,
    configuration?: ConfigState,
    category?: ProductCategory
  ) => Promise<boolean>;
  updateItemQuantity: (basketItemId: string, quantity: number) => Promise<boolean>;
  removeItem: (basketItemId: string) => Promise<boolean>;
  emptyBasket: () => Promise<boolean>;
  refreshBasket: () => Promise<void>;
}

// Create the context with a default value
const BasketContext = createContext<BasketContextValue | null>(null);

// VAT rate - could be moved to a configuration
const VAT_RATE = 0.20; // 20% VAT

// Calculate shipping based on order total
const calculateShipping = (subtotal: number): number => {
  // Free shipping over £1000
  if (subtotal >= 1000) {
    return 0;
  }
  
  // Base shipping cost of £50
  let shipping = 50;
  
  // For orders between £500 and £1000, reduce shipping
  if (subtotal >= 500) {
    shipping = 25;
  }
  
  return shipping;
};

// Provider component
export const BasketProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  
  // Initialize basket state
  const [basketState, setBasketState] = useState<BasketContextState>({
    items: [],
    subtotal: 0,
    vat: 0,
    shippingCost: 0,
    total: 0,
    itemCount: 0,
    loading: false,
    addingToBasket: false,
    removingFromBasket: false,
    clearingBasket: false,
    error: null,
  });
  
  // Calculate derived values when items change
  const calculateTotals = (items: BasketItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = subtotal * VAT_RATE;
    const shippingCost = calculateShipping(subtotal);
    const total = subtotal + vat + shippingCost;
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    
    return { subtotal, vat, shippingCost, total, itemCount };
  };
  
  // Load basket items when user changes
  useEffect(() => {
    if (user) {
      refreshBasket();
    } else {
      // Clear basket when user logs out
      setBasketState(prev => ({
        ...prev,
        items: [],
        subtotal: 0,
        vat: 0,
        shippingCost: 0,
        total: 0,
        itemCount: 0,
        loading: false,
        error: null,
      }));
    }
  }, [user]);
  
  // Function to refresh basket data from Firestore
  const refreshBasket = async (): Promise<void> => {
    if (!user) return;
    
    setBasketState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const items = await getBasketItems(user.uid);
      const { subtotal, vat, shippingCost, total, itemCount } = calculateTotals(items);
      
      setBasketState(prev => ({
        ...prev,
        items,
        subtotal,
        vat,
        shippingCost,
        total,
        itemCount,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching basket items:', error);
      setBasketState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load your basket. Please try again.',
      }));
    }
  };
  
  // Function to add an item to the basket
  const addItem = async (
    productId: string,
    quantity: number = 1,
    configuration?: ConfigState,
    category?: ProductCategory
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or create an account to add items to your basket.",
        variant: "destructive"
      });
      return false;
    }
    
    setBasketState(prev => ({ ...prev, addingToBasket: true, error: null }));
    
    try {
      const result = await addToBasket(user.uid, productId, quantity, configuration, category);
      
      if (result) {
        // Refresh basket after adding item
        await refreshBasket();
        toast({
          title: "Added to Basket",
          description: "Item has been added to your basket."
        });
        return true;
      } else {
        setBasketState(prev => ({
          ...prev,
          addingToBasket: false,
          error: 'Failed to add item to basket.',
        }));
        toast({
          title: "Error",
          description: "Failed to add item to basket. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error adding item to basket:', error);
      setBasketState(prev => ({
        ...prev,
        addingToBasket: false,
        error: 'An unexpected error occurred. Please try again.',
      }));
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Function to update item quantity
  const updateItemQuantity = async (basketItemId: string, quantity: number): Promise<boolean> => {
    if (!user) return false;
    
    setBasketState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await updateBasketItemQuantity(basketItemId, quantity);
      
      if (result) {
        // Refresh basket after updating
        await refreshBasket();
        return true;
      } else {
        setBasketState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to update item quantity.',
        }));
        toast({
          title: "Error",
          description: "Failed to update item quantity. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
      setBasketState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred. Please try again.',
      }));
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Function to remove an item from the basket
  const removeItem = async (basketItemId: string): Promise<boolean> => {
    if (!user) return false;
    
    setBasketState(prev => ({ ...prev, removingFromBasket: true, error: null }));
    
    try {
      const result = await removeFromBasket(basketItemId);
      
      if (result) {
        // Refresh basket after removing item
        await refreshBasket();
        toast({
          title: "Item Removed",
          description: "Item has been removed from your basket."
        });
        return true;
      } else {
        setBasketState(prev => ({
          ...prev,
          removingFromBasket: false,
          error: 'Failed to remove item from basket.',
        }));
        toast({
          title: "Error",
          description: "Failed to remove item from basket. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error removing item from basket:', error);
      setBasketState(prev => ({
        ...prev,
        removingFromBasket: false,
        error: 'An unexpected error occurred. Please try again.',
      }));
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Function to empty the basket
  const emptyBasket = async (): Promise<boolean> => {
    if (!user) return false;
    
    setBasketState(prev => ({ ...prev, clearingBasket: true, error: null }));
    
    try {
      const result = await clearBasket(user.uid);
      
      if (result) {
        setBasketState(prev => ({
          ...prev,
          items: [],
          subtotal: 0,
          vat: 0,
          shippingCost: 0,
          total: 0,
          itemCount: 0,
          clearingBasket: false,
        }));
        toast({
          title: "Basket Cleared",
          description: "All items have been removed from your basket."
        });
        return true;
      } else {
        setBasketState(prev => ({
          ...prev,
          clearingBasket: false,
          error: 'Failed to clear basket.',
        }));
        toast({
          title: "Error",
          description: "Failed to clear basket. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error clearing basket:', error);
      setBasketState(prev => ({
        ...prev,
        clearingBasket: false,
        error: 'An unexpected error occurred. Please try again.',
      }));
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Create context value
  const contextValue: BasketContextValue = {
    ...basketState,
    addItem,
    updateItemQuantity,
    removeItem,
    emptyBasket,
    refreshBasket,
  };
  
  return (
    <BasketContext.Provider value={contextValue}>
      {children}
    </BasketContext.Provider>
  );
};

// Custom hook to use the basket context
export const useBasket = (): BasketContextValue => {
  const context = useContext(BasketContext);
  
  if (!context) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  
  return context;
};

