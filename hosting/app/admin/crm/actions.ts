'use server';

import { collection, getDocs, query, orderBy, limit, where, doc, updateDoc, Timestamp, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface CustomerSummary {
  totalCustomers: number;
  totalLeads: number;
  openInquiries: number;
  averageConversionRate: number;
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
    // Get count of users with 'Customer' role
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'Customer')
    );
    const usersSnapshot = await getCountFromServer(usersQuery);
    const totalCustomers = usersSnapshot.data().count;

    // Get count of contact submissions and custom order inquiries
    const contactsSnapshot = await getCountFromServer(collection(db, 'contactSubmissions'));
    const inquiriesSnapshot = await getCountFromServer(collection(db, 'customOrderInquiries'));
    
    const totalContacts = contactsSnapshot.data().count;
    const totalInquiries = inquiriesSnapshot.data().count;
    
    // Calculate total leads (contacts + inquiries)
    const totalLeads = totalContacts + totalInquiries;
    
    // For open inquiries, we'll approximate with a percentage of total leads
    // In a real implementation, we would query specifically for open/unprocessed leads
    const openInquiries = Math.round(totalLeads * 0.3); // 30% of leads are "open"
    
    // Approximate conversion rate - in a real implementation, this would be calculated
    // based on actual conversion data from leads to customers
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
    // Return default values if there's an error
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
    // Get contact submissions and convert them to leads
    const contactsQuery = query(
      collection(db, 'contactSubmissions'),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );
    
    const contactsSnapshot = await getDocs(contactsQuery);
    const contactLeads: Lead[] = [];
    
    contactsSnapshot.forEach((doc) => {
      const data = doc.data();
      contactLeads.push({
        id: doc.id,
        name: data.name || 'Unknown',
        email: data.email || 'No email',
        source: 'Contact Form',
        status: data.leadStatus || 'New', // Using leadStatus field if it exists
        createdAt: data.submittedAt ? 
          (typeof data.submittedAt === 'string' ? data.submittedAt : data.submittedAt.toDate().toISOString()) :
          new Date().toISOString(),
        notes: data.message || undefined
      });
    });
    
    // Get custom order inquiries and convert them to leads
    const inquiriesQuery = query(
      collection(db, 'customOrderInquiries'),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );
    
    const inquiriesSnapshot = await getDocs(inquiriesQuery);
    const inquiryLeads: Lead[] = [];
    
    inquiriesSnapshot.forEach((doc) => {
      const data = doc.data();
      inquiryLeads.push({
        id: doc.id,
        name: data.fullName || 'Unknown',
        email: data.email || 'No email',
        source: 'Custom Order',
        status: data.leadStatus || 'New', // Using leadStatus field if it exists
        createdAt: data.submittedAt ? 
          (typeof data.submittedAt === 'string' ? data.submittedAt : data.submittedAt.toDate().toISOString()) :
          new Date().toISOString(),
        notes: data.description || undefined
      });
    });
    
    // Combine both types of leads and sort by date (newest first)
    const allLeads = [...contactLeads, ...inquiryLeads].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Return only the top 10 leads
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
    // Get recent contact form submissions
    const contactsQuery = query(
      collection(db, 'contactSubmissions'),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );
    
    const contactsSnapshot = await getDocs(contactsQuery);
    const contactFormEntries: Contact[] = [];
    
    contactsSnapshot.forEach((doc) => {
      const data = doc.data();
      contactFormEntries.push({
        id: doc.id,
        contactType: 'Contact Form',
        customerName: data.name || 'Unknown',
        customerEmail: data.email || 'No email',
        subject: data.subject || 'General Inquiry',
        date: data.submittedAt ? 
          (typeof data.submittedAt === 'string' ? data.submittedAt : data.submittedAt.toDate().toISOString()) :
          new Date().toISOString(),
        status: data.status || 'New'
      });
    });
    
    // Get recent custom order inquiries
    const inquiriesQuery = query(
      collection(db, 'customOrderInquiries'),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );
    
    const inquiriesSnapshot = await getDocs(inquiriesQuery);
    const customOrderEntries: Contact[] = [];
    
    inquiriesSnapshot.forEach((doc) => {
      const data = doc.data();
      customOrderEntries.push({
        id: doc.id,
        contactType: 'Custom Order',
        customerName: data.fullName || 'Unknown',
        customerEmail: data.email || 'No email',
        subject: `Custom Order (${data.productType || 'Unspecified'})`,
        date: data.submittedAt ? 
          (typeof data.submittedAt === 'string' ? data.submittedAt : data.submittedAt.toDate().toISOString()) :
          new Date().toISOString(),
        status: data.status || 'New'
      });
    });
    
    // Combine all contact activities and sort by date (newest first)
    const allContacts = [...contactFormEntries, ...customOrderEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Return the most recent contacts
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
    
    // Validate the status
    const validStatuses: Lead['status'][] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'];


    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        message: "Invalid status provided."
      };
    }
    
    const docRef = doc(db, sourceCollection, leadId);
    await updateDoc(docRef, {
      status: newStatus,
      lastUpdated: new Date().toISOString()
    });
    
    return {
      success: true,
      message: "Lead status updated successfully."
    };
  } catch (error) {
    console.error("Error updating lead status:", error);
    return {
      success: false,
      message: "Failed to update lead status. Please try again."
    };
  }
}
