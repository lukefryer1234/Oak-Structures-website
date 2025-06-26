"use client";

import type { CartItem, Product, SelectedConfiguration } from '@/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth-context';
import { 
    useBasket, 
    useAddToBasket, 
    useRemoveBasketItem, 
    useUpdateBasketItem, 
    useClearBasket,
    useMergeLocalBasket
} from '@/hooks/use-basket-mutations';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, configuration: SelectedConfiguration[]) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  isClient: boolean;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateUnitPrice = (basePrice: number, configuration: SelectedConfiguration[]): number => {
  return configuration.reduce((acc, option) => acc + (option.priceModifier || 0), basePrice);
};

// Provider for logged-in users, using Firestore
const FirestoreCartProvider = ({ children }: { children: ReactNode }) => {
    const { data: cartItems = [], isLoading } = useBasket();
    const addToBasketMutation = useAddToBasket();
    const removeFromBasketMutation = useRemoveBasketItem();
    const updateQuantityMutation = useUpdateBasketItem();
    const clearBasketMutation = useClearBasket();

    const addToCart = (product: Product, quantity: number, configuration: SelectedConfiguration[]) => {
        const unitPrice = calculateUnitPrice(product.basePrice, configuration);
        addToBasketMutation.mutate({ product, quantity, configuration, unitPrice });
    };

    const removeFromCart = (cartItemId: string) => {
        removeFromBasketMutation.mutate(cartItemId);
    };

    const updateQuantity = (cartItemId: string, quantity: number) => {
        updateQuantityMutation.mutate({ basketItemId: cartItemId, newQuantity: quantity });
    };

    const clearCart = () => {
        clearBasketMutation.mutate();
    };

    const getCartTotal = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
    }, [cartItems]);

    const getItemCount = useCallback(() => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    }, [cartItems]);

    const contextValue = useMemo(() => ({
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
        isClient: true,
        isLoading,
    }), [cartItems, isLoading, getCartTotal, getItemCount, addToCart, removeFromCart, updateQuantity, clearCart]);

    return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

// Provider for guest users, using localStorage
const LocalCartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const storedCart = localStorage.getItem('swiftcart-cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem('swiftcart-cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isClient]);

    const addToCart = (product: Product, quantity: number, configuration: SelectedConfiguration[]) => {
        const unitPrice = calculateUnitPrice(product.basePrice, configuration);
        const cartItemId = `${product.id}-${configuration.map(c => c.value).join('-')}-${Date.now()}`;
        
        const existingItemIndex = cartItems.findIndex(item => 
          item.product.id === product.id &&
          JSON.stringify(item.configuration.map(c => ({optionId: c.optionId, value: c.value})).sort()) === 
          JSON.stringify(configuration.map(c => ({optionId: c.optionId, value: c.value})).sort())
        );

        if (existingItemIndex > -1) {
            const updatedCartItems = [...cartItems];
            updatedCartItems[existingItemIndex].quantity += quantity;
            setCartItems(updatedCartItems);
            toast({ title: "Cart Updated", description: `${product.name} quantity increased.` });
        } else {
            setCartItems(prevItems => [...prevItems, { cartItemId, product, quantity, configuration, unitPrice }]);
            toast({ title: "Added to Cart", description: `${product.name} has been added to your cart.` });
        }
    };

    const removeFromCart = (cartItemId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
        toast({ title: "Item Removed" });
    };

    const updateQuantity = (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(cartItemId);
        } else {
            setCartItems(prevItems => prevItems.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item));
            toast({ title: "Quantity Updated" });
        }
    };

    const clearCart = () => {
        setCartItems([]);
        toast({ title: "Cart Cleared" });
    };

    const getCartTotal = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
    }, [cartItems]);

    const getItemCount = useCallback(() => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    }, [cartItems]);

    const contextValue = useMemo(() => ({
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
        isClient,
        isLoading: false,
    }), [cartItems, isClient, getCartTotal, getItemCount]);

    return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

// Main provider that switches between local and Firestore
export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { user, loading: authLoading } = useAuth();
    const mergeBasketMutation = useMergeLocalBasket();
    const [isInitialAuthCheckDone, setIsInitialAuthCheckDone] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            setIsInitialAuthCheckDone(true);
        }
    }, [authLoading]);

    useEffect(() => {
        if (user && isInitialAuthCheckDone) {
            const localCartRaw = localStorage.getItem('swiftcart-cart');
            if (localCartRaw) {
                const localCartItems = JSON.parse(localCartRaw);
                if (localCartItems && localCartItems.length > 0) {
                    mergeBasketMutation.mutate(localCartItems, {
                        onSuccess: () => {
                            localStorage.removeItem('swiftcart-cart');
                        }
                    });
                }
            }
        }
    }, [user, isInitialAuthCheckDone, mergeBasketMutation]);

    if (authLoading || !isInitialAuthCheckDone) {
        // Render a loading state or null until we know the auth state
        return null; 
    }

    if (user) {
        return <FirestoreCartProvider>{children}</FirestoreCartProvider>;
    }

    return <LocalCartProvider>{children}</LocalCartProvider>;
};


export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
