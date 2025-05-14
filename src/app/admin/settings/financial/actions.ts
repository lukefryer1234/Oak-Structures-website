"use server";

import { z } from "zod";

// Define the interfaces that match our API responses
export interface FinancialSettings {
  currencySymbol: string;
  vatRate: number;
}

export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
}

export interface UpdateFinancialSettingsState {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
}

// Fetch financial settings from our API
export async function fetchFinancialSettingsAction(): Promise<FinancialSettings> {
  try {
    // Use the new API endpoint instead of direct Firestore access
    const response = await fetch('/api/settings/financial', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json() as ApiResponse<FinancialSettings>;

    if (result.success && result.data) {
      return result.data;
    } else {
      console.warn("Failed to fetch financial settings:", result.message);
      // Return default settings if API fails
      return { currencySymbol: "£", vatRate: 20 };
    }
  } catch (error) {
    console.error("Error fetching financial settings:", error);
    // Default on error
    return { currencySymbol: "£", vatRate: 20 };
  }
}

// Update financial settings through our API
export async function updateFinancialSettingsAction(
  settings: FinancialSettings,
): Promise<UpdateFinancialSettingsState> {
  try {
    // Use the new API endpoint instead of direct Firestore access
    const response = await fetch('/api/settings/financial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    const result = await response.json() as ApiResponse<FinancialSettings>;

    return {
      message: result.message || "Request completed",
      success: result.success,
      errors: result.errors,
    };
  } catch (error) {
    console.error("Error updating financial settings:", error);
    return { 
      message: "Failed to update financial settings.", 
      success: false 
    };
  }
}
