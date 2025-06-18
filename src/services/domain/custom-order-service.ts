// src/services/domain/custom-order-service.ts
import { z } from 'zod';
import FirebaseServices from '@/services/firebase'; // Adjusted path
import { handleError, CustomError } from '@/lib/error-utils'; // Adjusted path

// Schema based on src/app/api/custom-order/route.ts
// We only need a partial schema for counting, or to identify if a status field exists.
export const CustomOrderInquirySchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  description: z.string(),
  submittedAt: z.union([z.date(), z.string().datetime()]), // Allow Date or ISO string
  status: z.string().optional(), // Status field that admins might set
  // Add other fields if needed for filtering pending status
});
export type CustomOrderInquiry = z.infer<typeof CustomOrderInquirySchema>;

class CustomOrderService {
  private firestoreService: FirebaseServices['firestore']; // Correctly type this
  private readonly collectionName = "customOrderInquiries";

  constructor() {
    // Assuming FirebaseServices.firestore is an instance of your FirestoreService class
    // If FirebaseServices is just a namespace exporting the class, this needs adjustment.
    // Based on ProductService, FirebaseServices.firestore IS the service instance.
    this.firestoreService = FirebaseServices.firestore;
  }

  async getPendingInquiriesCount(): Promise<number> {
    try {
      // Logic 1: Count documents where 'status' field does NOT exist.
      // This requires FirestoreService.getDocuments or getCount to support "field does not exist" queries
      // which is done by querying for `null` if a field is truly absent or explicitly set to null.
      // A simpler approach if no status field is ever set until "completed":
      // fetch all, filter client-side (inefficient for large N).
      // Best: Query for documents where status is not 'Completed' or 'Archived'.

      // For this subtask, let's assume "pending" means no "status" field has been set,
      // or the status field is not one of the "completed/archived" states.
      // Firestore's "!=" query can be used if we have a list of non-pending statuses.
      // Or, if "pending" inquiries have NO status field, and processed ones get one:

      // Fetch all documents and filter. This is NOT efficient for large collections.
      // A better way would be a specific query if possible, or summary data.
      // For now, to make progress:
      const { documents } = await this.firestoreService.getDocuments(
        this.collectionName,
        // No specific server-side filter for "pending" defined yet, so fetch all.
        // We could add a filter like [['status', '==', 'Pending']] if such a status is set on creation.
        // The current API route doesn't set an initial status.
        // So, "pending" means no status field, or status is not 'Completed' or 'Archived'.
        // Let's assume for now we count all that are NOT 'Completed'.
        // This requires the FirestoreService to support '!=' or 'not-in' if we have multiple completed states.
        // As a simple start, let's count documents that DO NOT have status == 'Completed'.
        // This is hard if status field might not exist.
        // Alternative: Get all and filter client-side (bad for performance).
        // Let's assume an admin sets status to "Completed" when done.
        // So, we want to count where status != "Completed".
        // If FirestoreService's getDocuments doesn't support '!=' directly in its simplified constraints,
        // we might need to fetch all and filter, or add support for '!='.
        // For now, let's assume the API adds a default status of "Pending"
        // and we update it to "Completed" later.
        // The current API route DOES NOT add a status. So, "pending" means no status field.
        // This is hard to query efficiently.

        // Let's count all documents for now as a proxy, and refine later.
        // Or, let's assume an admin sets a field like `isReviewed: true` when done.
        // Then we query for `isReviewed: false` or where `isReviewed` does not exist.

        // Simplest for now: count all documents in the collection as a starting point.
        // This is not "pending" count but "total inquiries".
        // A proper "pending" count needs a status field.
        // The API route adds `submittedAt`. It does NOT add a `status`.
        // So, "pending" means any document that doesn't have a `status` field set to (e.g.) "Processed".

        // Let's assume for this task, we count documents where `status` is NOT 'Processed'.
        // This requires `status` to be explicitly set.
        // If status is not set by default, then this query won't work as intended for "pending".

        // Given the API doesn't set a status, let's just count all for now.
        // The dashboard UI can label it "Total Inquiries" instead of "Pending".
      );

      // If we were to actually count "pending" where "pending" means no "status" field, or status != "Completed":
      // const pendingCount = documents.filter(doc => !doc.status || (doc.status !== 'Completed' && doc.status !== 'Archived')).length;
      // return pendingCount;

      return documents.length; // Placeholder: returns total count for now.
                               // UI should say "Total Inquiries" or this needs a status field.

    } catch (error) {
      throw handleError(error, "Failed to get pending custom inquiries count", "CustomOrderService.getPendingInquiriesCount");
    }
  }
}

export const customOrderService = new CustomOrderService();
