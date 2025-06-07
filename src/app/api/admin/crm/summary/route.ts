// src/app/api/admin/crm/summary/route.ts
import { NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore'; // Removed unused FieldValue, Filter
import { adminDb } from '@/lib/firebase-admin';
// Ensure this path is correct and CustomerSummary interface matches the one in actions.ts
import type { CustomerSummary } from '@/app/admin/crm/actions';

export async function GET() {
  try {
    const usersCol = adminDb.collection('users');
    const contactSubmissionsCol = adminDb.collection('contactSubmissions');
    const customOrderInquiriesCol = adminDb.collection('customOrderInquiries');

    // Fetch counts
    const customersSnapshot = await usersCol.where('role', '==', 'Customer').count().get(); // Corrected role to 'Customer'
    const totalCustomers = customersSnapshot.data().count;

    const contactSubmissionsCountSnapshot = await contactSubmissionsCol.count().get();
    const customOrderInquiriesCountSnapshot = await customOrderInquiriesCol.count().get();

    const totalLeads = contactSubmissionsCountSnapshot.data().count + customOrderInquiriesCountSnapshot.data().count;

    // Placeholder for open inquiries until status field is consistently implemented
    // This logic is directly from the original actions.ts
    const openInquiries = Math.round(totalLeads * 0.25); // Assuming 25% are open

    // Placeholder calculation from original actions.ts
    const averageConversionRate = totalCustomers > 0 && totalLeads > 0
      ? Math.round((totalCustomers / (totalLeads + totalCustomers)) * 100)
      : 0;

    const summary: CustomerSummary = {
      totalCustomers,
      totalLeads,
      openInquiries,
      averageConversionRate,
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Error fetching customer summary in API route:', error);
    let errorMessage = 'An unexpected error occurred while fetching customer summary.';
    if (error instanceof Error) {
      // Avoid exposing sensitive details from Firestore errors if possible
      errorMessage = `Failed to retrieve summary data. ${error.name}: ${error.message}`;
    }
    return NextResponse.json({ error: 'Failed to fetch customer summary data.', details: errorMessage }, { status: 500 });
  }
}
