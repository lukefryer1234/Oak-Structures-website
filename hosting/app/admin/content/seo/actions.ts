'use server';

import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SETTINGS_COLLECTION = 'siteSettings';
const SEO_SETTINGS_DOC_ID = 'seoSettings'; // Store all SEO settings in one document

export interface PageSEO {
  pageKey: string;
  pageName: string;
  titleTag: string;
  metaDescription: string;
}

const pageSEOSchema = z.object({
  pageKey: z.string(),
  pageName: z.string(),
  titleTag: z.string().max(70, "Title tag is too long (max 70 characters)."),
  metaDescription: z.string().max(160, "Meta description is too long (max 160 characters)."),
});

const allPageSEOSchema = z.array(pageSEOSchema);

const defaultSEOData: PageSEO[] = [
    { pageKey: 'home', pageName: 'Homepage', titleTag: 'Timberline Commerce | Bespoke Oak Structures & Timber', metaDescription: 'High-quality configurable oak garages, gazebos, porches, beams, and flooring. Design and order online or request a custom quote. UK delivery.' },
    { pageKey: 'garages', pageName: 'Garages Category/Config', titleTag: 'Configure Your Oak Frame Garage | Timberline Commerce', metaDescription: 'Design your bespoke oak frame garage online. Choose size, bays, truss type, and oak finish. Get an instant price estimate. UK delivery.' },
    { pageKey: 'gazebos', pageName: 'Gazebos Category/Config', titleTag: 'Configure Your Oak Gazebo | Timberline Commerce', metaDescription: 'Create your perfect garden gazebo. Select size, leg type, truss, and oak. Real-time pricing for your bespoke timber structure.' },
    { pageKey: 'porches', pageName: 'Porches Category/Config', titleTag: 'Design Your Oak Frame Porch | Timberline Commerce', metaDescription: 'Configure a beautiful and welcoming oak frame porch online. Choose style, size, and oak type. Instant estimate available.' },
    { pageKey: 'oak-beams', pageName: 'Oak Beams Category/Config', titleTag: 'Custom Oak Beams - Cut to Size | Timberline Commerce', metaDescription: 'Order structural or decorative oak beams online. Specify dimensions and oak type (Green, Kilned Dried, Reclaimed). Get instant pricing.' },
    { pageKey: 'oak-flooring', pageName: 'Oak Flooring', titleTag: 'Oak Flooring - Configure & Order | Timberline Commerce', metaDescription: 'High-quality solid oak flooring. Choose reclaimed or kilned dried oak and specify the area required. Get a price per square meter.' },
    { pageKey: 'special-deals', pageName: 'Special Deals', titleTag: 'Special Offers on Oak Structures & Timber | Timberline Commerce', metaDescription: 'Grab a bargain with our limited-time special deals on pre-configured oak garages, gazebo kits, beam bundles, and flooring lots.' },
    { pageKey: 'gallery', pageName: 'Gallery', titleTag: 'Project Gallery | Timberline Commerce Examples', metaDescription: 'View examples of our completed oak frame garages, gazebos, porches, and other bespoke timber projects. Get inspired!' },
];


export async function fetchPageSEOAction(): Promise<PageSEO[]> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SEO_SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // The data in Firestore should be an object like { seoEntries: PageSEO[] }
      if (data.seoEntries && Array.isArray(data.seoEntries)) {
        const parsed = allPageSEOSchema.safeParse(data.seoEntries);
        if (parsed.success) {
          return parsed.data;
        } else {
          console.warn("Fetched SEO settings from Firestore are invalid:", parsed.error.flatten().fieldErrors);
        }
      }
    }
    return defaultSEOData; // Default
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    return defaultSEOData; // Default on error
  }
}

export interface UpdatePageSEOState {
  message: string;
  success: boolean;
  errors?: z.ZodIssue[];
}

export async function updatePageSEOAction(
  seoData: PageSEO[]
): Promise<UpdatePageSEOState> {
  const validatedFields = allPageSEOSchema.safeParse(seoData);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      success: false,
      errors: validatedFields.error.errors,
    };
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SEO_SETTINGS_DOC_ID);
    // Store as an object with a key for the array
    await setDoc(docRef, { seoEntries: validatedFields.data }, { merge: true });
    return { message: 'SEO settings updated successfully.', success: true };
  } catch (error) {
    console.error("Error updating SEO settings:", error);
    return { message: 'Failed to update SEO settings.', success: false };
  }
}