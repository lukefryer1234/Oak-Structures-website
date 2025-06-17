// src/context/basket-context.tsx
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import {
  BasketItem,
  AddToBasketPayload,
  ConfiguredProductOptions,
  BasketState,
  BasketContextValue
} from './basket-types';
import { useToast } from '@/hooks/use-toast'; // Assuming useToast hook exists

const VAT_RATE = 0.20; // 20% VAT rate
const LOCAL_STORAGE_KEY = 'oakStructuresBasket';

// --- Helper to calculate all derived state values ---
const calculateDerivedState = (items: BasketItem[]): Omit<BasketState, 'items'> => {
  const subtotal = items.reduce((sum, item) => sum + item.totalItemPrice, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const vatAmount = subtotal * VAT_RATE;

  let shippingCost = 0;
  if (itemCount > 0) { // Only apply shipping if there are items
    if (subtotal < 500) shippingCost = 50;
    else if (subtotal < 1000) shippingCost = 25;
    else shippingCost = 0; // Free shipping for orders £1000 or more
  }

  const grandTotal = subtotal + vatAmount + shippingCost;
  return { itemCount, subtotal, vatAmount, shippingCost, grandTotal };
};

// --- Initial State ---
const initialState: BasketState = {
  items: [],
  ...calculateDerivedState([]), // Initialize derived values for an empty basket
};

// --- Reducer Actions ---
type BasketAction =
  | { type: 'ADD_ITEM'; payload: AddToBasketPayload }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; newQuantity: number } }
  | { type: 'CLEAR_BASKET' }
  | { type: 'LOAD_BASKET'; payload: BasketItem[] };

// --- Reducer Function ---
const basketReducer = (state: BasketState, action: BasketAction): BasketState => {
  let newItems: BasketItem[] = [];
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId &&
                JSON.stringify(item.configuration) === JSON.stringify(action.payload.configuration)
      );

      if (existingItemIndex > -1) {
        newItems = state.items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = item.quantity + action.payload.quantity;
            return { ...item, quantity: newQuantity, totalItemPrice: newQuantity * item.unitPrice };
          }
          return item;
        });
      } else {
        const newItem: BasketItem = {
          ...action.payload, // Spread fields from AddToBasketPayload
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // More robust unique ID
          totalItemPrice: action.payload.quantity * action.payload.unitPrice,
        };
        newItems = [...state.items, newItem];
      }
      return { items: newItems, ...calculateDerivedState(newItems) };

    case 'REMOVE_ITEM':
      newItems = state.items.filter(item => item.id !== action.payload.itemId);
      return { items: newItems, ...calculateDerivedState(newItems) };

    case 'UPDATE_QUANTITY':
      if (action.payload.newQuantity <= 0) {
        newItems = state.items.filter(item => item.id !== action.payload.itemId);
      } else {
        newItems = state.items.map(item =>
          item.id === action.payload.itemId
            ? { ...item, quantity: action.payload.newQuantity, totalItemPrice: action.payload.newQuantity * item.unitPrice }
            : item
        );
      }
      return { items: newItems, ...calculateDerivedState(newItems) };

    case 'CLEAR_BASKET':
      // Return a new object for initialState to ensure all derived values are reset correctly
      return { items: [], ...calculateDerivedState([]) };


    case 'LOAD_BASKET':
      // When loading, ensure items are valid and then calculate derived state
      const validItems = Array.isArray(action.payload) ? action.payload : [];
      return { items: validItems, ...calculateDerivedState(validItems) };

    default:
      // For an unhandled action, you might want to throw an error or return state unchanged
      // For safety, returning state unchanged:
      return state;
  }
};

// --- Context Definition ---
const BasketContext = createContext<BasketContextValue | undefined>(undefined);

// --- Provider Component ---
export const BasketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(basketReducer, initialState, (initial) => {
    // Initializer function for useReducer to load from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedBasketJson = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedBasketJson) {
          const savedItems: BasketItem[] = JSON.parse(savedBasketJson);
          if (Array.isArray(savedItems)) {
            // Dispatch LOAD_BASKET to ensure derived state is also calculated by reducer
            // This will be processed by the reducer after initial render,
            // so we return initial here and dispatch in useEffect for hydration.
            // The reducer itself will handle calculating derived state for LOAD_BASKET.
            return { items: savedItems, ...calculateDerivedState(savedItems) };
          }
        }
      } catch (error) {
        console.error("Error loading basket from localStorage during init:", error);
      }
    }
    return initial; // Return initial if no localStorage or SSR
  });

  const { toast } = useToast();

  // Effect to save to localStorage whenever state.items change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.items));
      } catch (error) {
        console.error("Error saving basket to localStorage:", error);
      }
    }
  }, [state.items]);

  // Effect for initial hydration from localStorage if not handled by reducer's third arg robustly
  // This ensures that if the reducer's initializer didn't fully rehydrate with derived state,
  // or if we prefer explicit dispatch after mount for hydration.
  // However, the third argument to useReducer is generally preferred for initial state setup.
  // The current setup with reducer's third argument should be sufficient.

  const addItem = useCallback((payload: AddToBasketPayload) => {
    dispatch({ type: 'ADD_ITEM', payload });
    toast({ title: "Item Added", description: `${payload.productName} added to basket.` });
  }, [toast]);

  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
    toast({ title: "Item Removed", description: "Item removed from basket." });
  }, [toast]);

  const updateItemQuantity = useCallback((itemId: string, newQuantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, newQuantity } });
    if (newQuantity > 0) {
      toast({ title: "Quantity Updated", description: "Item quantity updated." });
    } else {
      toast({ title: "Item Removed", description: "Item removed as quantity set to 0 or less." });
    }
  }, [toast]);

  const clearBasket = useCallback(() => {
    dispatch({ type: 'CLEAR_BASKET' });
    toast({ title: "Basket Cleared", description: "Your basket is now empty." });
  }, [toast]);

  const isItemInBasket = useCallback((productId: string, configuration: ConfiguredProductOptions): BasketItem | undefined => {
    return state.items.find(
      item => item.productId === productId &&
              JSON.stringify(item.configuration) === JSON.stringify(configuration)
    );
  }, [state.items]);

  return (
    <BasketContext.Provider value={{ ...state, addItem, removeItem, updateItemQuantity, clearBasket, isItemInBasket }}>
      {children}
    </BasketContext.Provider>
  );
};

// --- Custom Hook to use the Basket Context ---
export const useBasket = (): BasketContextValue => {
  const context = useContext(BasketContext);
  if (context === undefined) {
    throw new Error('useBasket must be used within a BasketProvider');
  }
  return context;
};
