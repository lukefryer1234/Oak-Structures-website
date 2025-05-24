"use client";

import { queryClient } from '@/lib/react-query';
import { ProductImagesService } from '@/services/domain/product-images/product-images-service';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-safe-query';

// Define types
export interface ProductImage {
  id: string;
  type: string;
  target: string;
  url: string;
  altText: string;
  opacity?: number;
  createdAt?: Date;
}

/**
 * Hook to fetch all product images with optional filtering
 * Supports both object-based filtering and legacy productId string param
 */
export function useProductImages(options?: { type?: string; target?: string } | string) {
  // Prepare query parameters based on options type
  const isStringOption = typeof options === 'string';
  const productId = isStringOption ? options : undefined;
  const queryKey = isStringOption 
    ? ['productImages', productId] 
    : ['productImages', options?.type, options?.target];
  
  // Context message based on query type
  const contextMessage = isStringOption
    ? 'Fetching product images for specific product'
    : 'Fetching product images';
    
  // Unified query function
  const fetchImages = async () => {
    if (isStringOption && productId) {
      return await ProductImagesService.getProductImagesByProductId(productId);
    } else {
      return await ProductImagesService.getAllProductImages(options as { type?: string; target?: string } | undefined);
    }
  };
  
  // Call useSafeQuery with unified parameters
  return useSafeQuery<ProductImage[]>(
    queryKey,
    fetchImages,
    {
      context: contextMessage,
      showErrorToast: true,
      toastTitle: 'Failed to load product images',
      queryOptions: {
        // Only set enabled if we're using the productId path
        ...(isStringOption && { enabled: !!productId }),
      }
    }
  );
}

/**
 * Hook to fetch a single product image by ID
 */
export function useProductImage(imageId: string) {
  return useSafeQuery<ProductImage>(
    ['productImage', imageId],
    async () => {
      const response = await ProductImagesService.getProductImageById(imageId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch product image');
      }
      return response.data;
    },
    {
      context: 'Fetching product image',
      showErrorToast: true,
      toastTitle: 'Failed to load product image',
      queryOptions: {
        enabled: !!imageId,
      }
    }
  );
}

/**
 * Hook to add a new product image
 * Supports both the new API with imageData object and legacy API with file upload
 */
export function useAddProductImage() {
  return useSafeMutation<ProductImage, {
    productId?: string; 
    file?: File;
    data?: Partial<ProductImage>;
    imageData?: Omit<ProductImage, 'id' | 'createdAt'>;
  }>(
    async (params) => {
      // Handle both old and new API formats
      if ('imageData' in params) {
        // New API with imageData object
        const response = await ProductImagesService.addProductImage(params.imageData!);
        if (!response.success || !response.data) {
          throw new Error(response.message);
        }
        return response.data;
      } else if ('productId' in params) {
        // Legacy API with file upload
        const { productId, file, data } = params;
        
        if (!productId) {
          throw new Error('Product ID is required');
        }
        
        // Handle file upload if provided
        if (file) {
          const fileName = Date.now() + "-" + file.name.replace(/\s+/g, "-");
          const storagePath = `products/${productId}/images/${fileName}`;
          
          // This requires the legacy Firebase service - should be updated to use ProductImagesService
          const response = await ProductImagesService.addProductImageWithFile(productId, file, data || {});
          if (!response.success || !response.data) {
            throw new Error(response.message);
          }
          return response.data;
        }
        
        // Handle existing URL
        const imageData = {
          ...data,
          target: data?.target || productId,
          type: data?.type || 'main_product',
        } as Omit<ProductImage, 'id' | 'createdAt'>;
        
        const response = await ProductImagesService.addProductImage(imageData);
        if (!response.success || !response.data) {
          throw new Error(response.message);
        }
        return response.data;
      }
      
      throw new Error('Invalid parameters provided to useAddProductImage');
    },
    {
      context: 'Adding product image',
      showErrorToast: true,
      showSuccessToast: true,
      errorToastTitle: 'Failed to add product image',
      successToastTitle: 'Success',
      successToastMessage: 'Product image added successfully',
      mutationOptions: {
        onSuccess: (_, variables) => {
          // Invalidate relevant queries when a new image is added
          queryClient.invalidateQueries({
            queryKey: ['productImages'],
          });
          // If we have a productId, also invalidate that specific query
          if ('productId' in variables && variables.productId) {
            queryClient.invalidateQueries({
              queryKey: ['productImages', variables.productId],
            });
          }
        }
      }
    }
  );
}

/**
 * Hook to update an existing product image
 */
export function useUpdateProductImage() {
  return useSafeMutation<ProductImage, { imageId: string; updates: Partial<ProductImage> }>(
    async ({ imageId, updates }) => {
      const response = await ProductImagesService.updateProductImage(imageId, updates);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    {
      context: 'Updating product image',
      showErrorToast: true,
      showSuccessToast: true,
      errorToastTitle: 'Failed to update product image',
      successToastTitle: 'Success',
      successToastMessage: 'Product image updated successfully',
      mutationOptions: {
        onSuccess: (_, variables) => {
          // Invalidate specific queries
          queryClient.invalidateQueries({
            queryKey: ['productImages'],
          });
          queryClient.invalidateQueries({
            queryKey: ['productImage', variables.imageId],
          });
        }
      }
    }
  );
}

/**
 * Hook to delete a product image
 */
export function useDeleteProductImage() {
  return useSafeMutation<void, string>(
    async (imageId: string) => {
      const response = await ProductImagesService.deleteProductImage(imageId);
      if (!response.success) {
        throw new Error(response.message);
      }
    },
    {
      context: 'Deleting product image',
      showErrorToast: true,
      showSuccessToast: true,
      errorToastTitle: 'Failed to delete product image',
      successToastTitle: 'Success',
      successToastMessage: 'Product image deleted successfully',
      mutationOptions: {
        onSuccess: (_, imageId) => {
          // Invalidate relevant queries when an image is deleted
          queryClient.invalidateQueries({
            queryKey: ['productImages'],
          });
          queryClient.invalidateQueries({
            queryKey: ['productImage', imageId],
          });
        }
      }
    }
  );
}

/**
 * Hook to batch add multiple product images
 */
export function useBatchAddProductImages() {
  return useSafeMutation<ProductImage[], Array<Omit<ProductImage, 'id' | 'createdAt'>>>(
    async (imagesData) => {
      const response = await ProductImagesService.batchAddProductImages(imagesData);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    {
      context: 'Batch adding product images',
      showErrorToast: true,
      showSuccessToast: true,
      errorToastTitle: 'Failed to batch add product images',
      successToastTitle: 'Success',
      successToastMessage: (data) => `Successfully added ${data.length} product images`,
      mutationOptions: {
        onSuccess: () => {
          // Invalidate relevant queries when images are batch added
          queryClient.invalidateQueries({
            queryKey: ['productImages'],
          });
        }
      }
    }
  );
}
