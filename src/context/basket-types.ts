// src/context/basket-types.ts

export type ProductCategory =
  | 'garages'
  | 'gazebos'
  | 'porches'
  | 'oak-beams'
  | 'oak-flooring'
  | 'special-deals'
  | string; // Allow other strings for future or custom product types

export interface ConfiguredProductOptions {
  [key: string]: any; // e.g., { bays: [2], trussType: "curved", beamSize: "6x6", ... }
}

// This is what a component (e.g., a product configurator) passes to an `addItem` function
export interface AddToBasketPayload {
  productId: string; // A unique identifier for the base product type, e.g., "GARAGE_CONFIGURABLE" or a specific SKU
  productName: string; // User-friendly name, e.g., "Custom Oak Garage"
  category: ProductCategory; // e.g., "garages"
  configuration: ConfiguredProductOptions; // The specific options selected by the user
  configurationSummary?: string; // An optional human-readable summary of the configuration
  quantity: number;
  unitPrice: number; // Price of ONE unit of this fully configured item
  imageSrc?: string; // Optional URL for an image to display in the basket
}

// This is the core data structure for an item as it is stored IN THE BASKET
export interface BasketItem {
  id: string; // Unique ID for this specific basket entry (e.g., UUID or timestamp-based, generated on add)
  productId: string;
  productName: string;
  category: ProductCategory;
  configuration: ConfiguredProductOptions;
  configurationSummary?: string;
  quantity: number;
  unitPrice: number;
  totalItemPrice: number; // Calculated as quantity * unitPrice
  imageSrc?: string;
}

// Describes the overall state of the basket
export interface BasketState {
  items: BasketItem[];
  itemCount: number; // Total number of individual units across all items
  subtotal: number;  // Total price of all items before VAT and shipping
  vatAmount: number; // Calculated VAT amount
  shippingCost: number; // Calculated shipping cost
  grandTotal: number; // The final total: subtotal + vatAmount + shippingCost
}

// Describes the value provided by the BasketContext (state + actions)
export interface BasketContextValue extends BasketState {
  addItem: (payload: AddToBasketPayload) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, newQuantity: number) => void;
  clearBasket: () => void;
  isItemInBasket: (productId: string, configuration: ConfiguredProductOptions) => BasketItem | undefined;
  // Totals (itemCount, subtotal, etc.) are directly available from BasketState
}
