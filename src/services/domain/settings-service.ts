// src/services/domain/settings-service.ts
import FirebaseServices from '@/services/firebase';
import { withRetry } from '@/utils/error-utils';
import { z } from "zod";

// Constants
const SETTINGS_COLLECTION = "siteSettings";

/**
 * Payment settings interface
 */
export interface PaymentSettings {
  stripeEnabled: boolean;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  paypalEnabled: boolean;
  paypalClientId?: string;
  paypalClientSecret?: string;
  paypalSandboxMode: boolean;
}

/**
 * Financial settings interface
 */
export interface FinancialSettings {
  currencySymbol: string;
  vatRate: number;
}

/**
 * Financial settings schema for validation
 */
export const financialSettingsSchema = z.object({
  currencySymbol: z.string().min(1, "Currency symbol is required").max(5),
  vatRate: z
    .number()
    .min(0, "VAT rate cannot be negative")
    .max(100, "VAT rate seems too high"),
});

/**
 * Default financial settings
 */
export const DEFAULT_FINANCIAL_SETTINGS: FinancialSettings = {
  currencySymbol: "£",
  vatRate: 20,
};

/**
 * Payment settings schema for validation
 */
export const paymentSettingsSchema = z
  .object({
    stripeEnabled: z.boolean(),
    stripePublishableKey: z.string().optional(),
    stripeSecretKey: z.string().optional(),
    paypalEnabled: z.boolean(),
    paypalClientId: z.string().optional(),
    paypalClientSecret: z.string().optional(),
    paypalSandboxMode: z.boolean(),
  })
  .refine(
    (data) =>
      !data.stripeEnabled ||
      (data.stripePublishableKey && data.stripeSecretKey),
    {
      message: "Stripe keys are required if Stripe is enabled.",
      path: ["stripePublishableKey", "stripeSecretKey"],
    },
  )
  .refine(
    (data) =>
      !data.paypalEnabled || (data.paypalClientId && data.paypalClientSecret),
    {
      message: "PayPal credentials are required if PayPal is enabled.",
      path: ["paypalClientId", "paypalClientSecret"],
    },
  );

/**
 * Default payment settings
 */
export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  stripeEnabled: false,
  stripePublishableKey: "",
  stripeSecretKey: "",
  paypalEnabled: false,
  paypalClientId: "",
  paypalClientSecret: "",
  paypalSandboxMode: true,
};

/**
 * Delivery settings interface
 */
export interface DeliverySettings {
  freeDeliveryThreshold: number;
  ratePerM3: number;
  minimumDeliveryCharge: number;
}

/**
 * Delivery settings schema for validation
 */
export const deliverySettingsSchema = z.object({
  freeDeliveryThreshold: z
    .number()
    .min(0, "Free delivery threshold must be non-negative"),
  ratePerM3: z
    .number()
    .min(0, "Rate per cubic meter must be non-negative"),
  minimumDeliveryCharge: z
    .number()
    .min(0, "Minimum delivery charge must be non-negative"),
});

/**
 * Default delivery settings
 */
export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  freeDeliveryThreshold: 1000,
  ratePerM3: 50,
  minimumDeliveryCharge: 25,
};

/**
 * Response interface for settings operations
 */
export interface SettingsResponse<T> {
  data?: T;
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
}

/**
 * Domain service for site settings
 */
export const SettingsService = {
  /**
   * Get payment settings
   */
  async getPaymentSettings(): Promise<PaymentSettings> {
    return await withRetry(
      async () => {
        try {
          const data = await FirebaseServices.firestore.getDocument<PaymentSettings>(
            SETTINGS_COLLECTION,
            'paymentSettings'
          );
          
          // Apply schema validation to ensure data integrity
          const parsed = paymentSettingsSchema.safeParse(data);
          if (parsed.success) {
            return parsed.data;
          } else {
            console.warn(
              "Fetched payment settings from Firestore are invalid:",
              parsed.error.flatten().fieldErrors,
            );
            // Return default settings if validation fails
            return DEFAULT_PAYMENT_SETTINGS;
          }
        } catch (error) {
          // If document doesn't exist, return default settings
          if ((error as any).code === 'not-found') {
            return DEFAULT_PAYMENT_SETTINGS;
          }
          throw error;
        }
      },
      { context: 'Getting payment settings', maxRetries: 2 }
    );
  },
  
  /**
   * Update payment settings
   */
  async updatePaymentSettings(settings: PaymentSettings): Promise<SettingsResponse<PaymentSettings>> {
    // Validate settings
    const validatedFields = paymentSettingsSchema.safeParse(settings);
    
    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.errors,
      };
    }
    
    try {
      // IMPORTANT: In a real production app, secret keys should NOT be stored directly in Firestore
      // or passed around like this. They should be managed via secure environment variables on the server
      // and Cloud Functions.
      console.warn(
        "Storing payment secret keys in Firestore is insecure for production environments. Use environment variables and secure backend services.",
      );
      
      // Update the settings document
      await FirebaseServices.firestore.setDocument(
        SETTINGS_COLLECTION,
        'paymentSettings',
        validatedFields.data,
        { merge: true }
      );
      
      return {
        data: validatedFields.data,
        success: true,
        message: "Payment settings updated successfully.",
      };
    } catch (error) {
      console.error("Error updating payment settings:", error);
      return {
        success: false,
        message: "Failed to update payment settings.",
      };
    }
  },
  
  /**
   * Get delivery settings
   */
  async getDeliverySettings(): Promise<DeliverySettings> {
    return await withRetry(
      async () => {
        try {
          const data = await FirebaseServices.firestore.getDocument<DeliverySettings>(
            SETTINGS_COLLECTION,
            'deliverySettings'
          );
          
          // Apply schema validation to ensure data integrity
          const parsed = deliverySettingsSchema.safeParse(data);
          if (parsed.success) {
            return parsed.data;
          } else {
            console.warn(
              "Fetched delivery settings from Firestore are invalid:",
              parsed.error.flatten().fieldErrors,
            );
            // Return default settings if validation fails
            return DEFAULT_DELIVERY_SETTINGS;
          }
        } catch (error) {
          // If document doesn't exist, return default settings
          if ((error as any).code === 'not-found') {
            return DEFAULT_DELIVERY_SETTINGS;
          }
          throw error;
        }
      },
      { context: 'Getting delivery settings', maxRetries: 2 }
    );
  },
  
  /**
   * Update delivery settings
   */
  async updateDeliverySettings(settings: DeliverySettings): Promise<SettingsResponse<DeliverySettings>> {
    // Validate settings
    const validatedFields = deliverySettingsSchema.safeParse(settings);
    
    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.errors,
      };
    }
    
    try {
      // Update the settings document
      await FirebaseServices.firestore.setDocument(
        SETTINGS_COLLECTION,
        'deliverySettings',
        validatedFields.data,
        { merge: true }
      );
      
      return {
        data: validatedFields.data,
        success: true,
        message: "Delivery settings updated successfully.",
      };
    } catch (error) {
      console.error("Error updating delivery settings:", error);
      return {
        success: false,
        message: "Failed to update delivery settings.",
      };
    }
  },
  
  /**
   * Get notification settings
   * This is a placeholder for other settings types that could be implemented
   */
  async getNotificationSettings(): Promise<any> {
    // Similar implementation to getPaymentSettings but for notifications
    // Would include a schema, validation, and default values
    return {};
  },
  
  /**
   * Get financial settings
   */
  async getFinancialSettings(): Promise<FinancialSettings> {
    return await withRetry(
      async () => {
        try {
          const data = await FirebaseServices.firestore.getDocument<FinancialSettings>(
            SETTINGS_COLLECTION,
            'financialSettings'
          );
          
          // Apply schema validation to ensure data integrity
          const parsed = financialSettingsSchema.safeParse(data);
          if (parsed.success) {
            return parsed.data;
          } else {
            console.warn(
              "Fetched financial settings from Firestore are invalid:",
              parsed.error.flatten().fieldErrors,
            );
            // Return default settings if validation fails
            return DEFAULT_FINANCIAL_SETTINGS;
          }
        } catch (error) {
          // If document doesn't exist, return default settings
          if ((error as any).code === 'not-found') {
            return DEFAULT_FINANCIAL_SETTINGS;
          }
          throw error;
        }
      },
      { context: 'Getting financial settings', maxRetries: 2 }
    );
  },

  /**
   * Update financial settings
   */
  async updateFinancialSettings(settings: FinancialSettings): Promise<SettingsResponse<FinancialSettings>> {
    // Validate settings
    const validatedFields = financialSettingsSchema.safeParse(settings);
    
    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.errors,
      };
    }
    
    try {
      // Update the settings document
      await FirebaseServices.firestore.setDocument(
        SETTINGS_COLLECTION,
        'financialSettings',
        validatedFields.data,
        { merge: true }
      );
      
      return {
        data: validatedFields.data,
        success: true,
        message: "Financial settings updated successfully.",
      };
    } catch (error) {
      console.error("Error updating financial settings:", error);
      return {
        success: false,
        message: "Failed to update financial settings.",
      };
    }
  },
};

export default SettingsService;

// The default settings are already exported above, no need to re-export them
