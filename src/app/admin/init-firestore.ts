/**
 * This script initializes the Firestore database with default settings documents.
 * It can be imported and executed on application startup or run manually when needed.
 */

import { doc, getDoc, setDoc, Firestore } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Collection name for all settings
const SETTINGS_COLLECTION = "siteSettings";

// Document IDs for different settings
const COMPANY_INFO_DOC_ID = "companyInformation";
const FINANCIAL_SETTINGS_DOC_ID = "financialSettings";
const DELIVERY_SETTINGS_DOC_ID = "deliverySettings";
const PAYMENT_SETTINGS_DOC_ID = "paymentSettings";
const ANALYTICS_SETTINGS_DOC_ID = "analyticsSettings";
const NOTIFICATION_SETTINGS_DOC_ID = "notificationSettings";

// Default values for each settings document
const defaultSettings = {
  [COMPANY_INFO_DOC_ID]: {
    name: "Timberline Commerce",
    address: "12 Timber Yard\nForest Industrial Estate\nBristol\nBS1 1AD",
    contactEmail: "info@timberline.com",
    phone: "01234 567 890",
    vatNumber: "GB123456789",
  },
  [FINANCIAL_SETTINGS_DOC_ID]: {
    currencySymbol: "£",
    vatRate: 20,
  },
  [DELIVERY_SETTINGS_DOC_ID]: {
    freeDeliveryThreshold: 1000,
    ratePerM3: 50,
    minimumDeliveryCharge: 25,
  },
  [PAYMENT_SETTINGS_DOC_ID]: {
    stripeEnabled: true,
    stripePublishableKey: "pk_test_...",
    stripeSecretKey: "sk_test_...",
    paypalEnabled: true,
    paypalClientId: "PayPalClientID...",
    paypalClientSecret: "PayPalSecret...",
    paypalSandboxMode: true,
  },
  [ANALYTICS_SETTINGS_DOC_ID]: {
    googleAnalyticsId: "",
  },
  [NOTIFICATION_SETTINGS_DOC_ID]: {
    adminEmailAddresses: "admin@timberline.com",
  },
};

/**
 * Initialize a single settings document if it doesn't exist
 */
async function initSettingsDoc(db: Firestore, docId: string): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, docId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    try {
      // Only create if document doesn't exist
      await setDoc(
        docRef,
        defaultSettings[docId as keyof typeof defaultSettings],
      );
      console.log(`Initialized ${docId} with default values.`);
    } catch (error) {
      console.error(`Error initializing ${docId}:`, error);
    }
  } else {
    console.log(`${docId} already exists, skipping initialization.`);
  }
}

/**
 * Initialize all settings documents
 */
export async function initializeFirestoreSettings(): Promise<void> {
  console.log("Starting Firestore settings initialization...");

  try {
    // Initialize each settings document
    await initSettingsDoc(db, COMPANY_INFO_DOC_ID);
    await initSettingsDoc(db, FINANCIAL_SETTINGS_DOC_ID);
    await initSettingsDoc(db, DELIVERY_SETTINGS_DOC_ID);
    await initSettingsDoc(db, PAYMENT_SETTINGS_DOC_ID);
    await initSettingsDoc(db, ANALYTICS_SETTINGS_DOC_ID);
    await initSettingsDoc(db, NOTIFICATION_SETTINGS_DOC_ID);

    console.log("Firestore settings initialization complete.");
  } catch (error) {
    console.error("Error initializing Firestore settings:", error);
  }
}

// You can call this function directly to initialize:
// initializeFirestoreSettings();
