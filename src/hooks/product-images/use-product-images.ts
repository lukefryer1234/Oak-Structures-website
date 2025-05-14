"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FirebaseServices from '@/services/firebase';

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
 * Hook to fetch product images for a specific product
 */
export function useProductImages(productId: string) {
  return useQuery({
    queryKey: ['productImages', productId],
    queryFn: async () => {
      const data = await FirebaseServices.firestore.getSubcollection<ProductImage>(
        'products',
        productId,
        'images'
      );
      return data || [];
    },
    enabled: !!productId,
  });
}

/**
 * Hook to add a new product image
 */
export function useAddProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      productId, 
      file, 
      data 
    }: {
      productId: string;
      file?: File; 
      data: Partial<ProductImage>;
    }) => {
      // If there's a file to upload, use Storage service
      if (file) {
        const fileName = Date.now() + "-" + file.name.replace(/\s+/g, "-");
        const storagePath = `products/${productId}/images/${fileName}`;
        
        // Upload file and get URL
        const downloadURL = await FirebaseServices.storage.uploadFile(storagePath, file);
        
        // Add document with the file URL
        const imageData = {
          ...data,
          url: downloadURL,
          target: data.target || productId,
          type: data.type || 'main_product',
        };
        
        const docId = await FirebaseServices.firestore.addToSubcollection<ProductImage>(
          'products',
          productId,
          'images',
          imageData as Omit<ProductImage, 'id'>
        );
        
        return { id: docId, ...imageData } as ProductImage;
      }
      
      // If using existing URL
      const imageData = {
        ...data,
        target: data.target || productId,
        type: data.type || 'main_product',
      };
      
      const docId = await FirebaseServices.firestore.addToSubcollection<ProductImage>(
        'products',
        productId,
        'images',
        imageData as Omit<ProductImage, 'id'>
      );
      
      return { id: docId, ...imageData } as ProductImage;
    },
    
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['productImages', variables.productId] 
      });
    }
  });
}

/**
 * Hook to delete a product image
 */
export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      productId, 
      imageId,
      storagePath
    }: {
      productId: string;
      imageId: string;
      storagePath?: string;
    }) => {
      // Delete the document from Firestore
      await FirebaseServices.firestore.deleteDocument(
        `products/${productId}/images`, 
        imageId
      );
      
      // If we have a storage path, delete the file from storage
      if (storagePath) {
        await FirebaseServices.storage.deleteFile(storagePath);
      }
      
      return { productId, imageId };
    },
    
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['productImages', variables.productId] 
      });
    }
  });
}

// src/hooks/product-images/use-product-images.ts
import { queryClient } from '@/lib/react-query';
import { ProductImagesService, ProductImage } from '@/services/domain/product-images/product-images-service';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-safe-query';

/**
 * Hook to fetch all product images with optional filtering
 */
export function useProductImages(options?: { type?: string; target?: string }) {
  return useSafeQuery<ProductImage[]>(
    // Include filter parameters in the query key for cache management
    ['productImages', options?.type, options?.target],
    async () => {
      return await ProductImagesService.getAllProductImages(options);
    },
    {
      context: 'Fetching product images',
      showErrorToast: true,
      toastTitle: 'Failed to load product images',
    }
  );
}

/**
 * Hook to fetch a single product image by ID
 */
export function useProductImage(imageId: string) {
  return useSafeQuery<ProductImage | null>(
    ['productImage', imageId],
    async () => {
      return await ProductImagesService.getProductImageById(imageId);
    },
    {
      context: 'Fetching product image',
      showErrorToast: true,
      toastTitle: 'Failed to load product image',
      queryOptions: {
        // Only execute the query if we have an imageId
        enabled: !!imageId,
      }
    }
  );
}

/**
 * Hook to add a new product image
 */
export function useAddProductImage() {
  return useSafeMutation<ProductImage>(
    async (imageData: Omit<ProductImage, 'id' | 'createdAt'>) => {
      const response = await ProductImagesService.addProductImage(imageData);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      return response.data;
    },
    {
      context: 'Adding product image',
      showErrorToast: true,
      showSuccessToast: true,
      errorToastTitle: 'Failed to add product image',
      successToastTitle: 'Success',
      successToastMessage: 'Product image added successfully',
      mutationOptions: {
        onSuccess: () => {
          // Invalidate relevant queries when a new image is added
          queryClient.invalidateQueries({
            queryKey: ['productImages'],
          });
        }
      }
    }
  );
}

/**
 * Hook to update an existing product image
 */
export function useUpdateProductImage() {
  return useSafeMutation<ProductImage>(
    async ({ imageId, updates }: { imageId: string; updates: Partial<Omit<ProductImage, 'id' | 'createdAt'>> }) => {
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
  return useSafeMutation<void>(
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
  return useSafeMutation<ProductImage[]>(
    async (imagesData: Array<Omit<ProductImage, 'id' | 'createdAt'>>) => {
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

