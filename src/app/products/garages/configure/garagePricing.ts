// src/app/products/garages/configure/garagePricing.ts

// --- Configuration Interfaces ---
export interface GarageConfigValue {
  label: string;
  priceImpact?: number;
  priceMultiplier?: number; // Alternative to priceImpact
  perBay?: boolean;
  image?: string;
  dataAiHint?: string;
}

export interface GarageConfigOption {
  id: string;
  label: string;
  type: 'select' | 'slider' | 'radio' | 'checkbox';
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  unit?: string;
  values?: Record<string, GarageConfigValue>; // For select/radio options
  priceImpact?: number; // For checkbox type or simple options
  perBay?: boolean; // For checkbox type or simple options
  dataAiHint?: string;
}

export interface GarageConfigData {
  id?: string; // Document ID, usually not part of the document data itself in Firestore
  title: string;
  basePrice: number;
  options: GarageConfigOption[];
  image?: string;
  dataAiHint?: string;
}

// --- Pricing Logic ---
export const calculatePrice = (
  currentConfig: any,
  quantity: number,
  configData?: GarageConfigData
): number | null => {
  if (!configData) return null;

  let singleGaragePrice = configData.basePrice;
  const numberOfBays = currentConfig.bays?.[0] || 1; // Default to 1 bay if not set

  configData.options.forEach(option => {
    const selectedValue = currentConfig[option.id];
    // Skip if option not selected yet OR if the option is 'bays' itself (handled by numberOfBays multiplier)
    if (selectedValue === undefined || option.id === 'bays') return;

    let optionCost = 0;

    if (option.type === 'checkbox') {
      if (selectedValue && option.priceImpact) {
        optionCost = option.priceImpact;
      }
    } else if (option.values && option.values[selectedValue]) {
      const valueDetails = option.values[selectedValue];
      if (valueDetails.priceImpact) {
        optionCost = valueDetails.priceImpact;
      } else if (valueDetails.priceMultiplier) {
        // This logic needs base for multiplier. For simplicity, let's assume multiplier applies to a portion of base or specific item cost.
        // Advanced: priceMultiplier might apply to (basePrice / number of options of this type) or similar.
        // For now, let's assume priceMultiplier is not the primary mode here or applies to a sub-component price not detailed.
        // Defaulting to 0 if only multiplier is present without clear base.
        optionCost = 0;
      }
    }
    // Note: 'slider' type (other than 'bays') direct price impact is not explicitly handled here unless it follows checkbox or values structure.
    // Typically, a slider's impact would be modeled via its own 'priceImpact' or by affecting other calculations.

    // Apply perBay multiplier if the option itself is perBay, or if the specific selected value within an option is perBay.
    const isPerBay = option.perBay || (option.values && option.values[selectedValue]?.perBay);
    if (isPerBay) {
      optionCost *= numberOfBays;
    }

    singleGaragePrice += optionCost;
  });

  return Math.max(0, singleGaragePrice) * quantity;
};
