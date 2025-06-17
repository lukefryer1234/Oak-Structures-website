// src/app/admin/crm/actions.ts
'use server';

// Client-side Firestore imports - check if all are unused after refactoring
import { collection, getDocs, query, orderBy, limit, where, doc, getDoc, updateDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Client SDK db

// Types
export interface CustomerSummary {
  totalCustomers: number;
  totalLeads: number; // From contactSubmissions + customOrderInquiries
  openInquiries: number; // Placeholder based on totalLeads
  averageConversionRate: number; // Placeholder calculation
}

/**
 * Fetches a single lead by ID from the appropriate collection
 */
export async function getLeadAction(
  leadId: string,
  sourceCollection: 'contactSubmissions' | 'customOrderInquiries'
): Promise<Lead | null> {
  if (!leadId) {
    console.error("Lead ID is required for getLeadAction");
    return null;
  }
  // sourceCollection is validated by its TypeScript type 'contactSubmissions' | 'customOrderInquiries'

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:9002' : 'https://your-production-url.com'); // Replace with actual prod URL
    const apiUrl = `${appUrl}/api/admin/crm/lead/${leadId}?sourceCollection=${sourceCollection}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (response.status === 404) {
      console.log(`Lead with ID ${leadId} not found in ${sourceCollection} via API.`);
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching lead ${leadId} from API: ${response.status} ${response.statusText} - ${errorText}`);
      // Consider not throwing here if the expectation is to return null on any error,
      // or make the error handling more specific. For now, let it fall to the catch block.
      throw new Error(`Failed to fetch lead: API responded with ${response.status}`);
    }

    const lead: Lead = await response.json();
    return lead;

  } catch (error) {
    console.error(`Error in getLeadAction calling API for lead ${leadId} in ${sourceCollection}:`, error);
    return null; // Consistent with original behavior: log error and return null
  }
}

/**
 * Updates lead details in the appropriate collection
 */
export async function updateLeadAction(
  leadId: string,
  updateData: Partial<Lead>,
  sourceCollection: 'contactSubmissions' | 'customOrderInquiries'
): Promise<StatusUpdateResponse> {
  if (!leadId) {
    return { success: false, message: "Lead ID is required for updateLeadAction." };
  }
  // Basic validation for updateData: ensure it's not empty if we expect actual changes.
  // The API route itself also validates this.
  if (!updateData || Object.keys(updateData).length === 0) {
    return { success: false, message: "No update data provided." };
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:9002' : 'https://your-production-url.com'); // Replace with actual prod URL
    const apiUrl = `${appUrl}/api/admin/crm/lead/${leadId}?sourceCollection=${sourceCollection}`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
      // cache: 'no-store', // PUT requests are typically not cached by default
    });

    // Attempt to parse the JSON response, regardless of response.ok status,
    // as our API route is designed to return JSON for errors too.
    let result: StatusUpdateResponse;
    try {
        result = await response.json();
    } catch (e) {
        // If response is not JSON (e.g., HTML error page from a proxy or unexpected server crash)
        const responseText = await response.text(); // Try to get text content
        console.error(`Error updating lead ${leadId} via API: Non-JSON response ${response.status} ${response.statusText} - Body: ${responseText}`);
        return {
            success: false,
            message: `Failed to update lead: API returned non-JSON response (${response.status}). Check server logs.`
        };
    }

    if (!response.ok) {
      console.error(`Error updating lead ${leadId} via API: ${response.status} ${response.statusText} - Response: ${JSON.stringify(result)}`);
      return {
        success: false,
        message: result.message || `Failed to update lead: API responded with ${response.status}`,
        // error field is not part of StatusUpdateResponse in actions.ts, so not assigning result.error
      };
    }
    
    return result; // This should be { success: true, message: "..." } from the API

  } catch (error) {
    console.error(`Error in updateLeadAction calling API for lead ${leadId} in ${sourceCollection}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `An unexpected error occurred: ${errorMessage}` };
  }
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Converted' | 'Lost';
  createdAt: string;
  notes?: string;
}

export interface Contact {
  id: string;
  contactType: 'Contact Form' | 'Custom Order' | 'Email' | 'Phone';
  customerName: string;
  customerEmail: string;
  subject?: string;
  date: string;
  status: 'New' | 'Replied' | 'Closed';
}

export interface StatusUpdateResponse {
  success: boolean;
  message: string;
}

/**
 * Fetches summary statistics for the CRM dashboard
 */
export async function fetchCustomerSummaryAction(): Promise<CustomerSummary> {
  const defaultSummary: CustomerSummary = {
    totalCustomers: 0,
    totalLeads: 0,
    openInquiries: 0,
    averageConversionRate: 0,
  };

  try {
    // Ensure the host is correctly set for server-side fetch
    // For server components, relative URLs might not work as expected without a full host.
    // Using an absolute URL. In a real app, this should come from an environment variable.
    const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'; // Fallback for local dev if not set
    const response = await fetch(`${host}/api/admin/crm/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Consider adding cache-revalidation options if needed, e.g. next: { revalidate: 60 }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty if fail
      console.error(
        `Error fetching customer summary from API: ${response.status} ${response.statusText}`,
        errorData.details || ''
      );
      return defaultSummary;
    }

    const summaryData: CustomerSummary = await response.json();
    return summaryData;

  } catch (error) {
    console.error("Error fetching customer summary via API route:", error);
    return {
      totalCustomers: 0,
      totalLeads: 0,
      openInquiries: 0,
      averageConversionRate: 0,
    };
  }
}

/**
 * Fetches recent leads from contact submissions and custom order inquiries
 */
export async function fetchRecentLeadsAction(): Promise<Lead[]> {
  try {
    const contactsQuery = query(
      collection(db, 'contactSubmissions'),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );

    const contactsSnapshot = await getDocs(contactsQuery);
    const contactLeads: Lead[] = [];

    contactsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      contactLeads.push({
        id: docSnap.id,
        name: data.name || 'Unknown',
        email: data.email || 'No email',
        source: 'Contact Form',
        status: data.status || 'New', // Assuming a 'status' field
        createdAt: data.submittedAt ?
          (data.submittedAt.toDate ? data.submittedAt.toDate().toISOString() : new Date(data.submittedAt).toISOString()) :
          new Date().toISOString(),
        notes: data.message || undefined
      });
    });

    const inquiriesQuery = query(
      collection(db, 'customOrderInquiries'),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );

    const inquiriesSnapshot = await getDocs(inquiriesQuery);
    const inquiryLeads: Lead[] = [];

    inquiriesSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      inquiryLeads.push({
        id: docSnap.id,
        name: data.fullName || 'Unknown',
        email: data.email || 'No email',
        source: 'Custom Order',
        status: data.status || 'New', // Assuming a 'status' field
        createdAt: data.submittedAt ?
          (data.submittedAt.toDate ? data.submittedAt.toDate().toISOString() : new Date(data.submittedAt).toISOString()) :
          new Date().toISOString(),
        notes: data.description || undefined
      });
    });

    const allLeads = [...contactLeads, ...inquiryLeads].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return allLeads.slice(0, 10);
  } catch (error) {
    console.error("Error fetching recent leads:", error);
    return [];
  }
}

/**
 * Fetches recent contact activities
 */
export async function fetchRecentContactsAction(): Promise<Contact[]> {
  try {
    const contactsQuery = query(
      collection(db, 'contactSubmissions'),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );

    const contactsSnapshot = await getDocs(contactsQuery);
    const contactFormEntries: Contact[] = [];

    contactsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      contactFormEntries.push({
        id: docSnap.id,
        contactType: 'Contact Form',
        customerName: data.name || 'Unknown',
        customerEmail: data.email || 'No email',
        subject: data.subject || 'General Inquiry',
        date: data.submittedAt ?
          (data.submittedAt.toDate ? data.submittedAt.toDate().toISOString() : new Date(data.submittedAt).toISOString()) :
          new Date().toISOString(),
        status: data.status || 'New'
      });
    });

    const inquiriesQuery = query(
      collection(db, 'customOrderInquiries'),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );

    const inquiriesSnapshot = await getDocs(inquiriesQuery);
    const customOrderEntries: Contact[] = [];

    inquiriesSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      customOrderEntries.push({
        id: docSnap.id,
        contactType: 'Custom Order',
        customerName: data.fullName || 'Unknown',
        customerEmail: data.email || 'No email',
        subject: `Custom Order (${data.productType || 'Unspecified'})`,
        date: data.submittedAt ?
         (data.submittedAt.toDate ? data.submittedAt.toDate().toISOString() : new Date(data.submittedAt).toISOString()) :
          new Date().toISOString(),
        status: data.status || 'New'
      });
    });

    const allContacts = [...contactFormEntries, ...customOrderEntries].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return allContacts.slice(0, 10);
  } catch (error) {
    console.error("Error fetching recent contacts:", error);
    return [];
  }
}

/**
 * Updates the status of a lead in the appropriate collection
 */
export async function updateLeadStatusAction(
  leadId: string,
  newStatus: Lead['status'],
  sourceCollection: 'contactSubmissions' | 'customOrderInquiries'
): Promise<StatusUpdateResponse> {
  try {
    if (!leadId || !newStatus) {
      return {
        success: false,
        message: "Lead ID and new status are required."
      };
    }

    const validStatuses: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'];
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        message: "Invalid status provided."
      };
    }

    const docRef = doc(db, sourceCollection, leadId);
    await updateDoc(docRef, {
      status: newStatus, // Ensure this field matches what's in Firestore or is named consistently
      lastUpdated: new Date().toISOString()
    });

    return {
      success: true,
      message: "Lead status updated successfully."
    };
  } catch (error: unknown) {
    console.error("Error updating lead status:", error);
    let message = "Failed to update lead status. Please try again.";
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      success: false,
      message
    };
  }
}
