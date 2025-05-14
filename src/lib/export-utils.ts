import {
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Query,
  DocumentData,
} from "firebase/firestore";
import { collection as firestoreCollection } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Enum defining the available export formats
 */
export enum ExportFormat {
  JSON = "json",
  CSV = "csv",
}

/**
 * Enum defining the data sensitivity levels
 */
export enum DataSensitivity {
  PUBLIC = "public",
  INTERNAL = "internal",
  SENSITIVE = "sensitive",
}

/**
 * Interface for exportable collection field definitions
 */
export interface ExportableField {
  name: string;
  label: string;
  description?: string;
  sensitive?: boolean;
  formatter?: (value: any) => string;
}

/**
 * Interface for exportable collection definitions
 */
export interface ExportableCollection {
  id: string;
  collection: string;
  label: string;
  description: string;
  sensitivity: DataSensitivity;
  fields: ExportableField[];
  defaultSort?: { field: string; direction: "asc" | "desc" };
}

/**
 * Interface for export options
 */
export interface ExportOptions {
  format: ExportFormat;
  collection: string;
  filters?: { field: string; operator: string; value: any }[];
  limit?: number;
  includeHeaders?: boolean; // For CSV
  dateFormat?: string; // For formatting date fields
  includeMetadata?: boolean; // Whether to include additional metadata for storage exports
}

/**
 * Interface for export results
 */
export interface ExportResult {
  success: boolean;
  data?: string | Blob; // CSV string or JSON blob
  filename?: string;
  message?: string;
  error?: any;
  recordCount?: number;
  fileSize?: number;
  id?: string; // Unique identifier for the export
}

/**
 * Definitions of exportable collections
 */
export const EXPORTABLE_COLLECTIONS: ExportableCollection[] = [
  {
    id: "users",
    collection: "users",
    label: "Users",
    description: "All user accounts and their roles",
    sensitivity: DataSensitivity.SENSITIVE,
    defaultSort: { field: "createdAt", direction: "desc" },
    fields: [
      { name: "id", label: "User ID" },
      { name: "email", label: "Email", sensitive: true },
      { name: "displayName", label: "Name" },
      { name: "role", label: "Role" },
      { name: "disabled", label: "Account Disabled" },
      {
        name: "createdAt",
        label: "Created At",
        formatter: (value) => (value ? new Date(value).toISOString() : ""),
      },
      {
        name: "lastLogin",
        label: "Last Login",
        formatter: (value) => (value ? new Date(value).toISOString() : ""),
      },
    ],
  },
  {
    id: "orders",
    collection: "orders",
    label: "Orders",
    description: "Customer orders and their details",
    sensitivity: DataSensitivity.INTERNAL,
    defaultSort: { field: "createdAt", direction: "desc" },
    fields: [
      { name: "id", label: "Order ID" },
      { name: "customerName", label: "Customer Name" },
      { name: "customerEmail", label: "Customer Email", sensitive: true },
      { name: "status", label: "Status" },
      {
        name: "total",
        label: "Total Amount",
        formatter: (value) => `£${parseFloat(value).toFixed(2)}`,
      },
      { name: "itemCount", label: "Item Count" },
      {
        name: "createdAt",
        label: "Order Date",
        formatter: (value) => (value ? new Date(value).toISOString() : ""),
      },
      { name: "paymentMethod", label: "Payment Method" },
      { name: "shippingAddress", label: "Shipping Address", sensitive: true },
    ],
  },
  {
    id: "contactSubmissions",
    collection: "contactSubmissions",
    label: "Contact Form Submissions",
    description: "Submissions from the website contact form",
    sensitivity: DataSensitivity.INTERNAL,
    defaultSort: { field: "submittedAt", direction: "desc" },
    fields: [
      { name: "id", label: "Submission ID" },
      { name: "name", label: "Name" },
      { name: "email", label: "Email", sensitive: true },
      { name: "subject", label: "Subject" },
      { name: "message", label: "Message" },
      { name: "status", label: "Status" },
      {
        name: "submittedAt",
        label: "Submitted At",
        formatter: (value) => {
          if (!value) return "";
          // Handle Firebase Timestamp or string
          if (typeof value === "object" && value.toDate) {
            return value.toDate().toISOString();
          }
          return new Date(value).toISOString();
        },
      },
    ],
  },
  {
    id: "customOrderInquiries",
    collection: "customOrderInquiries",
    label: "Custom Order Inquiries",
    description: "Custom order inquiries from customers",
    sensitivity: DataSensitivity.INTERNAL,
    defaultSort: { field: "submittedAt", direction: "desc" },
    fields: [
      { name: "id", label: "Inquiry ID" },
      { name: "fullName", label: "Customer Name" },
      { name: "email", label: "Email", sensitive: true },
      { name: "phone", label: "Phone", sensitive: true },
      { name: "productType", label: "Product Type" },
      { name: "description", label: "Description" },
      { name: "status", label: "Status" },
      {
        name: "submittedAt",
        label: "Submitted At",
        formatter: (value) => {
          if (!value) return "";
          // Handle Firebase Timestamp or string
          if (typeof value === "object" && value.toDate) {
            return value.toDate().toISOString();
          }
          return new Date(value).toISOString();
        },
      },
    ],
  },
];

/**
 * Main function to export data from a collection
 */
export async function exportCollection(
  options: ExportOptions,
): Promise<ExportResult> {
  try {
    // Find the collection definition
    const collectionDef = EXPORTABLE_COLLECTIONS.find(
      (c) => c.id === options.collection,
    );
    if (!collectionDef) {
      throw new Error (
        `Collection '${options.collection}' is not defined as exportable`,
      );
    }

    // Build the query
    let collectionRef = firestoreCollection(db, collectionDef.collection);
    let q = query(collectionRef);

    // Apply filters if provided
    if (options.filters && options.filters.length) {
      // Convert to firebase query with individual where clauses
      const queryFilters = options.filters.map((filter) =>
        where(filter.field, filter.operator as any, filter.value),
      );
      q = query(collectionRef, ...queryFilters);
    }

    // Apply sort if defined
    if (collectionDef.defaultSort) {
      q = query(
        q,
        orderBy(
          collectionDef.defaultSort.field,
          collectionDef.defaultSort.direction,
        ),
      );
    }

    // Apply limit if provided
    if (options.limit && options.limit > 0) {
      q = query(q, limit(options.limit));
    }

    // Execute the query
    const snapshot = await getDocs(q);

    // Transform documents to array of data
    const data = snapshot.docs.map((doc) => {
      const docData = doc.data();
      // Add the ID to the document
      return { id: doc.id, ...docData };
    });

    // Format the data according to requested format
    let result: string | Blob;
    let filename: string;

    if (options.format === ExportFormat.JSON) {
      result = formatAsJSON(data, collectionDef.fields);
      filename = `${collectionDef.id}_export_${new Date().toISOString().split("T")[0]}.json`;
    } else if (options.format === ExportFormat.CSV) {
      result = formatAsCSV(
        data,
        collectionDef.fields,
        options.includeHeaders !== false,
      );
      filename = `${collectionDef.id}_export_${new Date().toISOString().split("T")[0]}.csv`;
    } else {
    throw new Error(`Unsupported export format: ${options.format}`);
    }

    // Generate a unique ID for this export
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Calculate the size of the result in bytes
    const fileSize =
      typeof result === "string"
        ? new Blob([result]).size
        : (result as Blob).size;

    return {
      success: true,
      data: result,
      filename,
      recordCount: data.length,
      fileSize: fileSize,
      id: exportId,
    };
  } catch (error) {
    console.error("Error exporting collection:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error during export",
      error,
      id: `error_${Date.now()}`,
      recordCount: 0,
      fileSize: 0,
      filename: "",
    };
  }
}

/**
 * Format data as JSON
 */
function formatAsJSON(data: any[], fields: ExportableField[]): string {
  // Apply formatters to the fields
  const formattedData = data.map((item) => {
    const result: Record<string, any> = {};

    fields.forEach((field) => {
      const value = item[field.name];
      result[field.name] = field.formatter ? field.formatter(value) : value;
    });

    return result;
  });

  return JSON.stringify(formattedData, null, 2);
}

/**
 * Format data as CSV
 */
function formatAsCSV(
  data: any[],
  fields: ExportableField[],
  includeHeaders: boolean,
): string {
  // Create headers row
  let csv = "";
  if (includeHeaders) {
    csv = fields.map((field) => escapeCSV(field.label)).join(",") + "\n";
  }

  // Add data rows
  data.forEach((item) => {
    const row = fields.map((field) => {
      const value = item[field.name];
      const formattedValue = field.formatter ? field.formatter(value) : value;
      return escapeCSV(
        formattedValue === null || formattedValue === undefined
          ? ""
          : formattedValue,
      );
    });
    csv += row.join(",") + "\n";
  });

  return csv;
}

/**
 * Escape a value for CSV format
 */
function escapeCSV(value: any): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    // Escape double quotes with double quotes and wrap in double quotes
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Get a list of exportable collections the current user has access to
 */
export function getExportableCollections(): ExportableCollection[] {
  // In a real implementation, you would filter by permissions
  // For now, we'll return all collections
  return EXPORTABLE_COLLECTIONS;
}

/**
 * Download the exported data
 */
export function downloadExport(result: ExportResult): void {
  if (!result.success || !result.data || !result.filename) {
    throw new Error("Invalid export result for download");
  }

  let blob: Blob;
  if (typeof result.data === "string") {
    blob = new Blob([result.data], {
      type: result.filename.endsWith(".json")
        ? "application/json"
        : "text/csv;charset=utf-8;",
    });
  } else {
    blob = result.data;
  }

  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = result.filename;

  // Trigger the download
  document.body.appendChild(link);
  link.click();

  // Clean up
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

/**
 * Export Utilities
 *
 * Provides functions for exporting data from Firestore collections
 * and transforming it into various formats (JSON, CSV)
 */
// Import Timestamp type for documentation purposes only
import { Timestamp } from "firebase/firestore";
// Format utility
import { format } from "date-fns";
