'use server';

import { z } from 'zod';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SETTINGS_COLLECTION = 'siteSettings';
const COMPANY_INFO_DOC_ID = 'companyInformation';

export interface CompanyInfo {
  name: string;
  address: string;
  contactEmail: string;
  phone: string;
  vatNumber?: string;
}

const companyInfoSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  contactEmail: z.string().email("Invalid contact email"),
  phone: z.string().min(1, "Phone number is required"),
  vatNumber: z.string().optional(),
});

export async function fetchCompanyInfoAction(): Promise<CompanyInfo> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, COMPANY_INFO_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Validate data against schema before returning
      const data = docSnap.data();
      const parsed = companyInfoSchema.safeParse(data);
      if (parsed.success) {
        return parsed.data;
      } else {
        console.warn("Fetched company info from Firestore is invalid:", parsed.error.flatten().fieldErrors);
        // Return default or throw error if critical
      }
    }
    // Return default if not found or invalid
    return {
      name: "Timberline Commerce",
      address: "12 Timber Yard\nForest Industrial Estate\nBristol\nBS1 1AD",
      contactEmail: "info@timberline.com",
      phone: "01234 567 890",
      vatNumber: "GB123456789",
    };
  } catch (error) {
    console.error("Error fetching company info:", error);
    // Fallback to default in case of error
     return {
      name: "Timberline Commerce",
      address: "12 Timber Yard\nForest Industrial Estate\nBristol\nBS1 1AD",
      contactEmail: "info@timberline.com",
      phone: "01234 567 890",
      vatNumber: "GB123456789",
    };
  }
}

export interface UpdateCompanyInfoState {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
}

export async function updateCompanyInfoAction(
  info: CompanyInfo
): Promise<UpdateCompanyInfoState> {
  const validatedFields = companyInfoSchema.safeParse(info);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      success: false,
      errors: validatedFields.error.errors,
    };
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, COMPANY_INFO_DOC_ID);
    // Use setDoc with merge:true to create if not exists, or update if exists
    await setDoc(docRef, validatedFields.data, { merge: true }); 
    return { message: 'Company information updated successfully.', success: true };
  } catch (error) {
    console.error("Error updating company info:", error);
    return { message: 'Failed to update company information.', success: false };
  }
}