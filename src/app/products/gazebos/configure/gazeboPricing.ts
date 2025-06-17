// src/app/products/gazebos/configure/gazeboPricing.ts

// --- Configuration Interfaces ---
export interface GazeboConfigValue {
  label: string;
  priceImpact: number;
  image?: string;
  dataAiHint?: string;
}

export interface GazeboConfigOption {
  id: string;
  label: string;
  type: 'select' | 'radio' | 'checkbox';
  defaultValue?: any;
  values?: Record<string, GazeboConfigValue>; // For select/radio
  priceImpact?: number; // For checkbox type
  notes?: string;
}

export interface GazeboConfigData {
  id?: string; // Document ID
  title: string;
  description?: string;
  basePrice: number;
  options: GazeboConfigOption[];
  image?: string;
  dataAiHint?: string;
}

// --- Pricing Logic ---
export const calculateGazeboPrice = (
  currentConfig: any,
  quantity: number,
  configData?: GazeboConfigData
): number | null => {
  if (!configData) return null;

  let singleUnitPrice = configData.basePrice;

  configData.options.forEach(option => {
    const selectedValue = currentConfig[option.id];
    if (selectedValue === undefined) return; // Skip if option not selected yet

    let optionCost = 0;
    if (option.type === 'checkbox') {
      if (selectedValue && option.priceImpact) { // If checkbox is true and has a priceImpact
        optionCost = option.priceImpact;
      }
    } else if (option.values && option.values[selectedValue]) { // For select/radio
      const valueDetails = option.values[selectedValue];
      if (valueDetails.priceImpact) {
        optionCost = valueDetails.priceImpact;
      }
    }
    singleUnitPrice += optionCost;
  });

  // Ensure price is not negative before multiplying by quantity
  const nonNegativeSinglePrice = Math.max(0, singleUnitPrice);
  return nonNegativeSinglePrice * quantity;
};
