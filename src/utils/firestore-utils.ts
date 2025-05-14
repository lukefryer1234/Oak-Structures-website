import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Interface for product category image data
 */
export interface ProductCategoryImage {
  id: string;
  categoryName: string; // This corresponds to the 'target' field in Firestore
  imageUrl: string;
  altText: string;
}

/**
 * Retrieves product category images from Firestore
 *
 * @returns Promise<ProductCategoryImage[]> Array of product category images
 */
export async function getProductCategoryImages(): Promise<
  ProductCategoryImage[]
> {
  try {
    // Create a query against the 'productImages' collection
    // Filter by type === 'category'
    const q = query(
      collection(db, "productImages"),
      where("type", "==", "category"),
    );

    // Get the query snapshot
    const querySnapshot = await getDocs(q);

    // Map the documents to the required format
    const categoryImages: ProductCategoryImage[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      categoryImages.push({
        id: doc.id,
        categoryName: data.target, // 'target' field contains the category name
        imageUrl: data.url,
        altText: data.altText || data.alt || `${data.target} category`, // Fallback for alt text
      });
    });

    return categoryImages;
  } catch (error) {
    console.error("Error fetching product category images:", error);
    return [];
  }
}
