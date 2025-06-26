export interface ProductOptionValue {
  label: string;
  value: string;
  priceModifier?: number;
  imageUrl?: string; // For radio options with images
}

export interface ProductOption {
  id: string;
  name: string;
  type: 'select' | 'radio' | 'slider' | 'checkbox' | 'number_input'; // Added 'number_input'
  values?: ProductOptionValue[]; 
  defaultValue?: string | number | boolean;
  description?: string; // Optional description for the option
  
  // For slider & number_input
  min?: number;
  max?: number;
  step?: number;
  unit?: string; 
  
  // For checkbox
  checkboxLabel?: string; 
  priceModifier?: number; 
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  options: ProductOption[];
  garagePricingParams?: GaragePricingParams;
}

export interface GaragePricingParams {
  bayPrice: number; 
  catSlidePricePerBay: number;
  beamSizePrices: { [key: string]: number }; 
  trussPrices: { [key: string]: number }; 
  baySizeMultipliers: { [key: string]: number }; 
}

export interface SelectedConfiguration {
  optionId: string;
  optionName: string;
  value: string | number | boolean; 
  label: string; 
  priceModifier: number;
}

export interface CartItem {
  cartItemId: string; 
  product: Product;
  quantity: number;
  configuration: SelectedConfiguration[];
  unitPrice: number; 
}

export interface FirestoreCartItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  configuration: SelectedConfiguration[];
  addedAt: any; // Firestore Timestamp
  configString?: string; // To query for existing items
}
