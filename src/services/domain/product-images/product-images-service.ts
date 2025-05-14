// src/services/domain/product-images/product-images-service.ts
import { z } from "zod";
import FirebaseServices from '@/services/firebase';
import { withRetry } from '@/utils/error-utils';

// Constants
const PRODUCT_IMAGES_COLLECTION = "productImages";

/**
 * Product image interface
 */
export interface ProductImage {
  id: string;
  type: "banner" | "thumbnail" | "gallery" | "detail";
  target: string; // can be 'global', product ID, or category ID
  url: string;
  altText: string;
  opacity: number;
  createdAt: string;
}

/**
 * Product image response interface
 */
export interface ProductImageResponse<T> {
  data?: T;
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
}

/**
 * Product image schema for validation
 */
export const ProductImageSchema = z.object({
  id: z.string().min(1, "ID is required"),
  type: z.enum(["banner", "thumbnail", "gallery", "detail"], {
    errorMap: () => ({ message: "Invalid image type" }),
  }),
  target: z.string().min(1, "Target is required"),
  url: z.string().url("Must be a valid URL"),
  altText: z.string().min(1, "Alt text is required"),
  opacity: z.number().min(0, "Opacity must be between 0 and 1").max(1, "Opacity must be between 0 and 1"),
  createdAt: z.string().datetime("Must be a valid ISO date string"),
});

/**
 * Domain service for product images
 */
export const ProductImagesService = {
  /**
   * Get all product images
   * Optionally filtered by type and/or target
   */
  async getAllProductImages(options?: { type?: string; target?: string }): Promise<ProductImage[]> {
    return await withRetry(
      async () => {
        try {
          // Get all documents from the collection
          let images = await FirebaseServices.firestore.getCollection<ProductImage>(
            PRODUCT_IMAGES_COLLECTION
          );
          
          // Apply filters if provided
          if (options?.type) {
            images = images.filter(img => img.type === options.type);
          }
          
          if (options?.target) {
            images = images.filter(img => img.target === options.target);
          }
          
          // Validate each image
          const validImages: ProductImage[] = [];
          
          for (const image of images) {
            const parsedImage = ProductImageSchema.safeParse(image);
            if (parsedImage.success) {
              validImages.push(parsedImage.data);
            } else {
              console.warn(
                `Invalid product image data for ID ${image.id}:`,
                parsedImage.error.flatten().fieldErrors
              );
            }
          }
          
          return validImages;
        } catch (error) {
          console.error("Error fetching product images:", error);
          throw error;
        }
      },
      { context: 'Getting product images', maxRetries: 2 }
    );
  },
  
  /**
   * Get a product image by ID
   */
  async getProductImageById(id: string): Promise<ProductImage | null> {
    return await withRetry(
      async () => {
        try {
          const image = await FirebaseServices.firestore.getDocument<ProductImage>(
            PRODUCT_IMAGES_COLLECTION,
            id
          );
          
          // Validate the image
          const parsedImage = ProductImageSchema.safeParse(image);
          if (parsedImage.success) {
            return parsedImage.data;
          } else {
            console.warn(
              `Invalid product image data for ID ${id}:`,
              parsedImage.error.flatten().fieldErrors
            );
            return null;
          }
        } catch (error) {
          if ((error as any).code === 'not-found') {
            return null;
          }
          throw error;
        }
      },
      { context: 'Getting product image by ID', maxRetries: 2 }
    );
  },
  
  /**
   * Get product images by target
   * Useful for getting all images related to a specific product or category
   */
  async getProductImagesByTarget(target: string): Promise<ProductImage[]> {
    return this.getAllProductImages({ target });
  },
  
  /**
   * Add a new product image
   */
  async addProductImage(image: Omit<ProductImage, 'id' | 'createdAt'>): Promise<ProductImageResponse<ProductImage>> {
    // Generate ID and add timestamp
    const newImage: ProductImage = {
      ...image,
      id: FirebaseServices.firestore.generateId(),
      createdAt: new Date().toISOString(),
    };
    
    // Validate image
    const validationResult = ProductImageSchema.safeParse(newImage);
    
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validationResult.error.errors,
      };
    }
    
    try {
      // Add the document to Firestore
      await FirebaseServices.firestore.setDocument(
        PRODUCT_IMAGES_COLLECTION, 
        newImage.id, 
        validationResult.data
      );
      
      return {
        data: validationResult.data,
        success: true,
        message: "Product image added successfully",
      };
    } catch (error) {
      console.error("Error adding product image:", error);
      return {
        success: false,
        message: `Failed to add product image: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
  
  /**
   * Update an existing product image
   */
  async updateProductImage(id: string, updates: Partial<Omit<ProductImage, 'id' | 'createdAt'>>): Promise<ProductImageResponse<ProductImage>> {
    try {
      // Get the existing image
      const existingImage = await this.getProductImageById(id);
      
      if (!existingImage) {
        return {
          success: false,
          message: `Product image with ID ${id} not found`,
        };
      }
      
      // Merge updates with existing image
      const updatedImage: ProductImage = {
        ...existingImage,
        ...updates,
      };
      
      // Validate the updated image
      const validationResult = ProductImageSchema.safeParse(updatedImage);
      
      if (!validationResult.success) {
        return {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.errors,
        };
      }
      
      // Update the document
      await FirebaseServices.firestore.setDocument(
        PRODUCT_IMAGES_COLLECTION,
        id,
        validationResult.data,
        { merge: true }
      );
      
      return {
        data: validationResult.data,
        success: true,
        message: "Product image updated successfully",
      };
    } catch (error) {
      console.error("Error updating product image:", error);
      return {
        success: false,
        message: `Failed to update product image: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
  
  /**
   * Delete a product image
   */
  async deleteProductImage(id: string): Promise<ProductImageResponse<null>> {
    try {
      // Check if the image exists
      const image = await this.getProductImageById(id);
      
      if (!image) {
        return {
          success: false,
          message: `Product image with ID ${id} not found`,
        };
      }
      
      // Delete the document
      await FirebaseServices.firestore.deleteDocument(
        PRODUCT_IMAGES_COLLECTION,
        id
      );
      
      return {
        success: true,
        message: "Product image deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting product image:", error);
      return {
        success: false,
        message: `Failed to delete product image: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
  
  /**
   * Batch add multiple product images
   * Useful for bulk uploads
   */
  async batchAddProductImages(images: Array<Omit<ProductImage, 'id' | 'createdAt'>>): Promise<ProductImageResponse<ProductImage[]>> {
    try {
      const now = new Date().toISOString();
      const newImages: ProductImage[] = images.map(image => ({
        ...image,
        id: FirebaseServices.firestore.generateId(),
        createdAt: now,
      }));
      
      // Validate all images
      const invalidImages: { index: number; errors: z.ZodIssue[] }[] = [];
      const validImages: ProductImage[] = [];
      
      newImages.forEach((image, index) => {
        const validationResult = ProductImageSchema.safeParse(image);
        if (validationResult.success) {
          validImages.push(validationResult.data);
        } else {
          invalidImages.push({
            index,
            errors: validationResult.error.errors,
          });
        }
      });
      
      if (invalidImages.length > 0) {
        return {
          success: false,
          message: `Validation failed for ${invalidImages.length} images`,
          errors: invalidImages.flatMap(item => item.errors),
        };
      }
      
      // Batch write to Firestore
      await FirebaseServices.firestore.batchSet(
        validImages.map(image => ({
          collection: PRODUCT_IMAGES_COLLECTION,
          docId: image.id,
          data: image,
        }))
      );
      
      return {
        data: validImages,
        success: true,
        message: `${validImages.length} product images added successfully`,
      };
    } catch (error) {
      console.error("Error batch adding product images:", error);
      return {
        success: false,
        message: `Failed to batch add product images: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};

export default ProductImagesService;

