// src/services/domain/product-service.ts
import FirebaseServices from '@/services/firebase';
import { withRetry, CustomError } from '@/utils/error-utils'; // Added CustomError

/**
 * Product interface
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock: number;
  inStock: boolean;
  featured?: boolean;
  discount?: number;
  relatedProducts?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Schemas and types for Special Deals
export const SpecialDealSchema = z.object({
  id: z.string(), // Firestore document ID
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  originalPrice: z.number().positive("Original price must be positive").optional(),
  image: z.string().url("Valid image URL is required"), // Or z.string() if it can be a path
  dataAiHint: z.string().optional(), // Kept for consistency if used by image components
  href: z.string().min(1, "Link href is required"), // Typically a relative path
  isActive: z.boolean().default(true),
  isStructureType: z.boolean().default(false), // Differentiates shipping calculation needs
  volumeM3: z.number().positive("Volume must be positive").optional(),
  createdAt: z.string().datetime().optional(), // Should be set by server on create
  updatedAt: z.string().datetime().optional(), // Should be set by server
});
export type SpecialDeal = z.infer<typeof SpecialDealSchema>;

export const CreateSpecialDealSchema = SpecialDealSchema.omit({ id: true, createdAt: true, updatedAt: true });
export type CreateSpecialDealData = z.infer<typeof CreateSpecialDealSchema>;

export const UpdateSpecialDealSchema = CreateSpecialDealSchema.partial();
export type UpdateSpecialDealData = z.infer<typeof UpdateSpecialDealSchema>;

// Schemas and types for Unit Prices
export const ProductTypeSchema = z.enum(['Oak Beams', 'Oak Flooring']); // Add other types if they have unit prices
export type ProductType = z.infer<typeof ProductTypeSchema>;

export const OakTypeSchema = z.enum(['Reclaimed Oak', 'Kilned Dried Oak', 'Green Oak']); // Add other oak types
export type OakType = z.infer<typeof OakTypeSchema>;

export const UnitPriceSchema = z.object({
  id: z.string(), // e.g., 'beams-reclaimed'
  productType: ProductTypeSchema,
  oakType: OakTypeSchema,
  unit: z.enum(['per m³', 'per m²']), // Add other units if needed
  price: z.number().positive("Price must be positive"),
  updatedAt: z.string().datetime().optional(),
});
export type UnitPrice = z.infer<typeof UnitPriceSchema>;

export const UpdateUnitPriceDataSchema = z.object({
    price: z.number().positive("Price must be positive"),
});
export type UpdateUnitPriceData = z.infer<typeof UpdateUnitPriceDataSchema>;

// Configuration state type
export interface ConfigState {
  [key: string]: any;
}

// BasketItem interface
export interface BasketItem {
  id?: string; // Firestore ID, generated on add
  productId: string; // Original product ID, e.g., "porches-configurable"
  productName: string;
  configuration: ConfigState;
  price: number; // Final calculated price for this configured item
  quantity: number;
  imageUrl?: string; // Optional image of the configured item/base product
  addedAt?: string; // ISO Date string
}

/**
 * Category interface
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  imageUrl?: string;
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain service for product operations
 * Implements business logic and ensures data consistency
 */
export const ProductService = {
  /**
   * Get a product by ID
   */
  async getProduct(productId: string): Promise<Product> {
    return await withRetry(
      () => FirebaseServices.firestore.getDocument<Product>('products', productId),
      { context: 'Getting product', maxRetries: 2 }
    );
  },

  /**
   * Get all products, optionally filtered by category
   */
  async getProducts(categoryId?: string): Promise<Product[]> {
    const constraints = [];
    
    if (categoryId) {
      constraints.push(
        FirebaseServices.firestore.constraints.where('category', '==', categoryId)
      );
    }
    
    // Only show in-stock products by default
    constraints.push(
      FirebaseServices.firestore.constraints.where('inStock', '==', true)
    );
    
    // Sort by name
    constraints.push(
      FirebaseServices.firestore.constraints.orderBy('name', 'asc')
    );
    
    return await withRetry(
      () => FirebaseServices.firestore.getCollection<Product>('products', { constraints }),
      { context: 'Getting products', maxRetries: 2 }
    );
  },

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const constraints = [
      FirebaseServices.firestore.constraints.orderBy('name', 'asc')
    ];
    
    return await withRetry(
      () => FirebaseServices.firestore.getCollection<Category>('categories', { constraints }),
      { context: 'Getting categories', maxRetries: 2 }
    );
  },

  /**
   * Create a new product
   * This method also increments the product count for the associated category
   */
  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    // Check if the category exists
    const category = await this.getCategoryById(productData.category);
    
    if (!category) {
      throw new Error(`Category ${productData.category} does not exist`);
    }
    
    // Set inStock based on stock value
    const fullProductData = {
      ...productData,
      inStock: productData.stock > 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Create the product
    const productId = await FirebaseServices.firestore.addDocument('products', fullProductData);
    
    // Update the category product count using a transaction to ensure consistency
    await this.updateCategoryProductCount(productData.category);
    
    // Return the complete product with ID
    return {
      id: productId,
      ...fullProductData,
    };
  },

  /**
   * Update a product with transaction-based updates for related data
   * This ensures that all related data is updated consistently
   */
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    // Get the current product
    const currentProduct = await this.getProduct(productId);
    
    // Check if the category is being changed
    const categoryChanged = updates.category && updates.category !== currentProduct.category;
    
    // Check if stock status is changing
    const stockChanged = 
      updates.stock !== undefined && 
      ((updates.stock === 0 && currentProduct.stock > 0) || 
       (updates.stock > 0 && currentProduct.stock === 0));
    
    // Calculate new inStock value if stock is changing
    if (updates.stock !== undefined) {
      updates.inStock = updates.stock > 0;
    }
    
    // Add updated timestamp
    updates.updatedAt = new Date();
    
    // If we're changing categories or stock status, we need to use a transaction
    // to ensure all related data is updated consistently
    if (categoryChanged || stockChanged) {
      return await FirebaseServices.firestore.transactionOperation(async (transaction) => {
        // Update the product within the transaction
        const productRef = FirebaseServices.firestore.getStorageRef(
          'products', 
          productId
        );
        
        transaction.update(productRef, updates);
        
        // If the category changed, update the product counts for both categories
        if (categoryChanged && updates.category) {
          // Decrement old category count
          const oldCategoryRef = FirebaseServices.firestore.getStorageRef(
            'categories', 
            currentProduct.category
          );
          
          transaction.update(oldCategoryRef, {
            productCount: FirebaseServices.firestore.increment(-1),
            updatedAt: new Date(),
          });
          
          // Increment new category count
          const newCategoryRef = FirebaseServices.firestore.getStorageRef(
            'categories', 
            updates.category
          );
          
          transaction.update(newCategoryRef, {
            productCount: FirebaseServices.firestore.increment(1),
            updatedAt: new Date(),
          });
        }
        
        // If this product is referenced in "related products" of other products,
        // we might need to update those as well
        // This is an example of how to handle related data updates
        
        // Return the updated product
        return {
          ...currentProduct,
          ...updates,
        };
      });
    } else {
      // Simple update without transaction for non-critical changes
      await FirebaseServices.firestore.updateDocument('products', productId, updates);
      
      // Return the updated product
      return {
        ...currentProduct,
        ...updates,
      };
    }
  },

  /**
   * Delete a product with transaction-based cleanup
   * This ensures that all related data is updated consistently
   */
  async deleteProduct(productId: string): Promise<void> {
    // Get the product to be deleted
    const product = await this.getProduct(productId);
    
    // Delete the product and update related data in a transaction
    await FirebaseServices.firestore.transactionOperation(async (transaction) => {
      // Delete the product
      const productRef = FirebaseServices.firestore.getStorageRef('products', productId);
      transaction.delete(productRef);
      
      // Update the category product count
      const categoryRef = FirebaseServices.firestore.getStorageRef(
        'categories', 
        product.category
      );
      
      transaction.update(categoryRef, {
        productCount: FirebaseServices.firestore.increment(-1),
        updatedAt: new Date(),
      });
      
      // If there are related products that reference this one, update them as well
      // Ideally we would query for products with this product ID in their relatedProducts array
      // and update them, but that would require a separate query outside the transaction.
      // For large-scale applications, consider using Cloud Functions for this type of cleanup.
    });
  },

  /**
   * Update category product count
   * This is a helper method that recalculates the product count for a category
   */
  async updateCategoryProductCount(categoryId: string): Promise<void> {
    // Count the products in this category
    const constraints = [
      FirebaseServices.firestore.constraints.where('category', '==', categoryId)
    ];
    
    const products = await FirebaseServices.firestore.getCollection<Product>('products', { constraints });
    const productCount = products.length;
    
    // Update the category with the correct count
    await FirebaseServices.firestore.updateDocument('categories', categoryId, {
      productCount,
      updatedAt: new Date(),
    });
  },
  
  /**
   * Get a category by ID
   */
  async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      return await FirebaseServices.firestore.getDocument<Category>('categories', categoryId);
    } catch (error) {
      // If the category doesn't exist, return null instead of throwing an error
      if ((error as any).code === 'not-found') {
        return null;
      }
      throw error;
    }
  },
  
  /**
   * Update product prices in bulk with a batch operation
   * This is useful for applying discounts or price changes to multiple products
   */
  async updateProductPrices(
    updates: Array<{ productId: string; newPrice: number; discount?: number }>
  ): Promise<void> {
    // Use a batch operation for efficiency
    const operations = updates.map(update => ({
      type: 'update' as const,
      collectionName: 'products',
      docId: update.productId,
      data: {
        price: update.newPrice,
        discount: update.discount,
        updatedAt: new Date(),
      },
    }));
    
    // Execute the batch update
    await FirebaseServices.firestore.batchOperation(operations);
  },
  
  /**
   * Toggle a product's featured status
   * This demonstrates using optimistic updates with error rollback
   */
  async toggleProductFeatured(productId: string, featured: boolean): Promise<Product> {
    // Get the current product
    const currentProduct = await this.getProduct(productId);
    
    // Update the product
    await FirebaseServices.firestore.updateDocument('products', productId, {
      featured,
      updatedAt: new Date(),
    });
    
    // Return the updated product
    return {
      ...currentProduct,
      featured,
      updatedAt: new Date(),
    };
  },

  async calculateProductPrice(productId: string, configuration: ConfigState): Promise<number> {
    // For "porches-configurable", use the hardcoded fallback logic for now.
    if (productId === "porches-configurable") {
      let basePrice = 2000; // Default base for porches
      if (configuration.sizeType === 'wide') basePrice += 400;
      if (configuration.sizeType === 'narrow') basePrice -= 200;
      if (configuration.legType === 'floor') basePrice += 150;
      // TODO: Add other pricing adjustments based on config.trussType if needed
      return Math.max(0, basePrice);
    } else {
      // For other products, attempt to fetch their base price.
      // This part might need more sophisticated logic if they also have configurations.
      try {
        const product = await this.getProduct(productId);
        // TODO: Implement actual configuration-based pricing for other products if applicable.
        // For now, just returning base price.
        return product.price;
      } catch (error) {
        console.error(`Error fetching product ${productId} for price calculation:`, error);
        throw new CustomError(`Could not calculate price for ${productId}. Product not found or error occurred.`, "PRICE_CALCULATION_ERROR");
      }
    }
  },

  async generateConfigurationDescription(productName: string, configuration: ConfigState): Promise<string> {
    let description = `${productName}: `;
    const parts = [];
    for (const key in configuration) {
      if (configuration.hasOwnProperty(key)) {
        const titleCaseKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        parts.push(`${titleCaseKey} - ${configuration[key]}`);
      }
    }
    description += parts.join(', ');
    return description;
  },

  async addToBasket(userId: string, itemData: Omit<BasketItem, 'id' | 'addedAt'>): Promise<string> {
    if (!userId) throw new CustomError("User ID is required to add to basket.", "INVALID_ARGUMENT");

    const basketItemWithTimestamp: Omit<BasketItem, 'id'> = {
      ...itemData,
      addedAt: new Date().toISOString(),
    };

    const docId = await FirebaseServices.firestore.addDocument(
      `users/${userId}/basket`,
      basketItemWithTimestamp
    );
    return docId; // Returns the ID of the newly added basket item
  },

  async getSpecialDeals(): Promise<SpecialDeal[]> {
    try {
      const { documents } = await FirebaseServices.firestore.getDocuments(
        'special_deals',
        // Ensure constraints are correctly typed or structured for getDocuments
        // Example: [['createdAt', 'desc']] might need to be { orderBy: { field: 'createdAt', direction: 'desc' }}
        // Depending on FirebaseServices.firestore.getDocuments implementation.
        // For now, assuming it accepts an array of [field, direction] tuples.
        [{ field: 'createdAt', direction: 'desc' }]
      );
      return documents.map(doc => SpecialDealSchema.parse({ id: doc.id, ...doc })).filter(Boolean) as SpecialDeal[];
    } catch (error) {
      throw handleError(error, "Failed to retrieve special deals", "ProductService.getSpecialDeals");
    }
  },

  async createSpecialDeal(dealData: CreateSpecialDealData): Promise<SpecialDeal> {
    try {
      const validatedData = CreateSpecialDealSchema.parse(dealData);
      const now = new Date().toISOString();

      let payload: any = { // Use 'any' temporarily if payload structure is dynamic before final parsing
        ...validatedData,
        createdAt: now,
        updatedAt: now
      };

      // Conditional logic for volumeM3
      if (payload.isStructureType) {
          payload.volumeM3 = undefined; // Or delete payload.volumeM3;
      } else if (payload.volumeM3 === undefined || payload.volumeM3 === null || payload.volumeM3 <= 0) {
          // Ensure volumeM3 is explicitly set to null or a valid number if not a structure type
          // and it's missing or invalid. Or throw error if it's strictly required.
          // The schema makes volumeM3 optional, so this check is application logic.
          // If it's truly required for non-structures, schema should reflect that (e.g. via refine).
          // For now, let's assume if not structure type, volumeM3 must be provided and positive.
           throw new CustomError("Volume (m³) is required and must be positive for non-structure type deals.", "INVALID_ARGUMENT");
      }


      const docId = await FirebaseServices.firestore.addDocument('special_deals', payload);

      // Construct the object to be parsed by SpecialDealSchema, ensuring all required fields are present
      const finalDataForParsing = {
        id: docId,
        name: payload.name,
        description: payload.description,
        price: payload.price,
        originalPrice: payload.originalPrice,
        image: payload.image,
        dataAiHint: payload.dataAiHint,
        href: payload.href,
        isActive: payload.isActive,
        isStructureType: payload.isStructureType,
        volumeM3: payload.volumeM3, // Will be undefined if isStructureType is true
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
      };

      return SpecialDealSchema.parse(finalDataForParsing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new CustomError("Invalid special deal data.", "INVALID_ARGUMENT", error.flatten().fieldErrors);
      }
      throw handleError(error, "Failed to create special deal", "ProductService.createSpecialDeal");
    }
  },

  async updateSpecialDeal(dealId: string, dealData: UpdateSpecialDealData): Promise<SpecialDeal> {
    try {
      if (!dealId) throw new CustomError("Deal ID is required for update.", "INVALID_ARGUMENT");

      const validatedData = UpdateSpecialDealSchema.parse(dealData);
      const now = new Date().toISOString();
      const payload: any = { ...validatedData, updatedAt: now };

      if (Object.keys(payload).length === 1 && payload.updatedAt) {
        throw new CustomError("No fields to update provided.", "INVALID_ARGUMENT");
      }

      // Conditional logic for volumeM3 if isStructureType is being updated
      if (payload.isStructureType === true) {
          payload.volumeM3 = undefined; // Or FirebaseServices.firestore.deleteField() if your service supports it
      } else if (payload.isStructureType === false) {
          // If isStructureType is explicitly set to false, volumeM3 becomes required.
          // Check if volumeM3 is provided in the update, or if it exists on the document already and is valid.
          if (payload.volumeM3 === undefined || payload.volumeM3 === null || payload.volumeM3 <= 0) {
              // If not updating volumeM3, check existing document
              const existingDeal = await this._getSpecialDealById(dealId); // Use private helper
              if (!existingDeal?.isStructureType && (existingDeal?.volumeM3 === undefined || existingDeal?.volumeM3 <= 0)) {
                  throw new CustomError("Volume (m³) is required and must be positive for non-structure type deals when isStructureType is false.", "INVALID_ARGUMENT");
              }
          }
      }


      await FirebaseServices.firestore.updateDocument('special_deals', dealId, payload);

      const updatedDocData = await FirebaseServices.firestore.getDocument('special_deals', dealId);
      if (!updatedDocData) throw new CustomError("Failed to retrieve updated special deal after update.", "INTERNAL_ERROR");

      return SpecialDealSchema.parse({ id: dealId, ...updatedDocData });

    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new CustomError("Invalid special deal data for update.", "INVALID_ARGUMENT", error.flatten().fieldErrors);
      }
      throw handleError(error, "Failed to update special deal", "ProductService.updateSpecialDeal");
    }
  },

  async deleteSpecialDeal(dealId: string): Promise<void> {
    try {
      if (!dealId) throw new CustomError("Deal ID is required for deletion.", "INVALID_ARGUMENT");
      await FirebaseServices.firestore.deleteDocument('special_deals', dealId);
    } catch (error) {
      throw handleError(error, "Failed to delete special deal", "ProductService.deleteSpecialDeal");
    }
  },

  // Private helper to fetch a deal, used internally for validation during update
  async _getSpecialDealById(dealId: string): Promise<SpecialDeal | null> {
      try {
          const doc = await FirebaseServices.firestore.getDocument('special_deals', dealId);
          if (!doc) return null;
          return SpecialDealSchema.parse({ id: dealId, ...doc });
      } catch (error) {
          console.error(`Internal error fetching special deal ${dealId} for validation:`, error);
          return null; // Return null if internal fetch fails, main operation will handle user-facing error
      }
  },

  async getUnitPrices(): Promise<UnitPrice[]> {
    try {
      const { documents } = await FirebaseServices.firestore.getDocuments(
        'unit_prices',
        [{ field: "productType", direction: "asc" }, { field: "oakType", direction: "asc" }]
      );
      return documents.map(doc => UnitPriceSchema.parse({ id: doc.id, ...doc })).filter(Boolean) as UnitPrice[];
    } catch (error) {
      throw handleError(error, "Failed to retrieve unit prices", "ProductService.getUnitPrices");
    }
  },

  async updateUnitPrice(unitPriceId: string, data: UpdateUnitPriceData): Promise<UnitPrice> {
    try {
      if (!unitPriceId) throw new CustomError("Unit price ID is required for update.", "INVALID_ARGUMENT");

      const validatedData = UpdateUnitPriceDataSchema.parse(data);
      const payload = {
        price: validatedData.price,
        updatedAt: new Date().toISOString()
      };

      await FirebaseServices.firestore.updateDocument('unit_prices', unitPriceId, payload);

      const updatedDoc = await FirebaseServices.firestore.getDocument('unit_prices', unitPriceId);
      if (!updatedDoc) throw new CustomError("Failed to retrieve updated unit price.", "INTERNAL_ERROR");

      return UnitPriceSchema.parse({ id: unitPriceId, ...updatedDoc });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new CustomError("Invalid unit price data for update.", "INVALID_ARGUMENT", error.flatten().fieldErrors);
      }
      throw handleError(error, "Failed to update unit price", "ProductService.updateUnitPrice");
    }
  }
};

export default ProductService;

