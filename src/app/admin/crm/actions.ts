// src/app/admin/crm/actions.ts
'use server';

import { collection, getDocs, query, orderBy, limit, where, doc, getDoc, updateDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface CustomerSummary {
  totalCustomers: number;
  totalLeads: number;
  openInquiries: number;
  averageConversionRate: number;
}

/**
 * Fetches a single lead by ID from the appropriate collection
 */
export async function getLeadAction(
  leadId: string,
  sourceCollection: 'contactSubmissions' | 'customOrderInquiries'
): Promise<Lead | null> {
  try {
    if (!leadId) {
      console.error("Lead ID is required");
      return null;
    }

    const docRef = doc(db, sourceCollection, leadId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.error(`Lead with ID ${leadId} not found in ${sourceCollection}`);
      return null;
    }
    
    const data = docSnap.data();
    
    // Construct the lead object based on the collection type
    if (sourceCollection === 'contactSubmissions') {
      return {
        id: docSnap.id,
        name: data.name || 'Unknown',
        email: data.email || 'No email',
        source: 'Contact Form',
        status: data.status || 'New',
        createdAt: data.submittedAt ?
          (data.submittedAt.toDate ? data.submittedAt.toDate().toISOString() : new Date(data.submittedAt).toISOString()) :
          new Date().toISOString(),
        notes: data.message || undefined
      };
    } else {
      return {
        id: docSnap.id,
        name: data.fullName || 'Unknown',
        email: data.email || 'No email',
        source: 'Custom Order',
        status: data.status || 'New',
        createdAt: data.submittedAt ?
          (data.submittedAt.toDate ? data.submittedAt.toDate().toISOString() : new Date(data.submittedAt).toISOString()) :
          new Date().toISOString(),
        notes: data.description || undefined
      };
    }
  } catch (error) {
    console.error("Error fetching lead:", error);
    return null;
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
  try {
    if (!leadId) {
      return {
        success: false,
        message: "Lead ID is required."
      };
    }

    const docRef = doc(db, sourceCollection, leadId);
    
    // Map the Lead interface fields to the appropriate collection fields
    const updateFields: Record<string, any> = {
      lastUpdated: new Date().toISOString()
    };
    
    if (sourceCollection === 'contactSubmissions') {
      if (updateData.name) updateFields.name = updateData.name;
      if (updateData.email) updateFields.email = updateData.email;
      if (updateData.status) updateFields.status = updateData.status;
      if (updateData.notes) updateFields.message = updateData.notes;
    } else {
      if (updateData.name) updateFields.fullName = updateData.name;
      if (updateData.email) updateFields.email = updateData.email;
      if (updateData.status) updateFields.status = updateData.status;
      if (updateData.notes) updateFields.description = updateData.notes;
    }
    
    await updateDoc(docRef, updateFields);

    return {
      success: true,
      message: "Lead updated successfully."
    };
  } catch (error: unknown) {
    console.error("Error updating lead:", error);
    let message = "Failed to update lead. Please try again.";
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      success: false,
      message
    };
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
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'Customer')
    );
    const usersSnapshot = await getCountFromServer(usersQuery);
    const totalCustomers = usersSnapshot.data().count;

    const contactsSnapshot = await getCountFromServer(collection(db, 'contactSubmissions'));
    const inquiriesSnapshot = await getCountFromServer(collection(db, 'customOrderInquiries'));

    const totalContacts = contactsSnapshot.data().count;
    const totalInquiries = inquiriesSnapshot.data().count;

    const totalLeads = totalContacts + totalInquiries;

    // Placeholder for open inquiries until status field is consistently implemented
    const openInquiries = Math.round(totalLeads * 0.25); // Assuming 25% are open

    const averageConversionRate = totalCustomers > 0 && totalLeads > 0
      ? Math.round((totalCustomers / (totalLeads + totalCustomers)) * 100)
      : 0;

    return {
      totalCustomers,
      totalLeads,
      openInquiries,
      averageConversionRate
    };
  } catch (error) {
    console.error("Error fetching customer summary:", error);
    return {
      totalCustomers: 0,
      totalLeads: 0,
      openInquiries: 0,
      averageConversionRate: 0
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
