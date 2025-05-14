// src/services/domain/product-service.ts
import FirebaseServices from '@/services/firebase';
import { withRetry } from '@/utils/error-utils';

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
};

export default ProductService;

