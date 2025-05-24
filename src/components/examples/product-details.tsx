"use client";

import { useState } from 'react';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-safe-query';
import FirebaseServices from '@/services/firebase';
import { withRetry } from '@/utils/error-utils';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

// Product interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * A component that demonstrates sophisticated error handling
 * while fetching and updating a product from Firestore.
 */
function ProductDetails({ productId }: { productId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  
  // Use the enhanced safe query hook for better error handling
  const { 
    data: product, 
    isLoading, 
    error, 
    refetch
  } = useSafeQuery<Product>(
    ['product', productId],
    async () => {
      // Use the retry utility for resilience against network issues
      return await withRetry(
        async () => {
          const data = await FirebaseServices.firestore.getDocument<Product>(
            'products', 
            productId
          );
          return data;
        },
        { context: 'Fetching product details', maxRetries: 3 }
      );
    },
    {
      context: 'ProductDetails',
      showErrorToast: true,
      toastTitle: 'Product Error',
      queryOptions: {
        staleTime: 60 * 1000, // 1 minute
        retry: 2,
      }
    }
  );
  
  // Form state for editing
  const [formData, setFormData] = useState<Partial<Product>>({});
  
  // Start editing with current product data
  const handleEditClick = () => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
      });
      setIsEditing(true);
    }
  };
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' 
        ? parseFloat(value) 
        : value
    }));
  };
  
  // Use the enhanced safe mutation hook for better error handling
  const updateMutation = useSafeMutation<Product, Error, Partial<Product>>(
    async (data) => {
      await FirebaseServices.firestore.updateDocument(
        'products',
        productId,
        {
          ...data,
          updatedAt: new Date(),
        }
      );
      
      // Return the updated product
      return {
        ...product!,
        ...data,
        updatedAt: new Date(),
      };
    },
    {
      context: 'Updating product',
      showErrorToast: true,
      showSuccessToast: true,
      errorToastTitle: 'Update Failed',
      successToastTitle: 'Product Updated',
      successToastMessage: 'Product details have been updated successfully.',
      mutationOptions: {
        // Optimistic update - update the UI immediately before the server confirms
        onMutate: async (newData) => {
          // Cancel any outgoing refetches
          await queryClient.cancelQueries({ queryKey: ['product', productId] });
          
          // Snapshot the previous value
          const previousProduct = queryClient.getQueryData<Product>(['product', productId]);
          
          // Optimistically update to the new value
          if (previousProduct) {
            queryClient.setQueryData(['product', productId], {
              ...previousProduct,
              ...newData,
              updatedAt: new Date(),
            });
          }
          
          // Return a context object with the previous value
          return { previousProduct };
        },
        // If mutation fails, use context returned from onMutate to roll back
        onError: (err, newData, context: any) => {
          if (context?.previousProduct) {
            queryClient.setQueryData(
              ['product', productId],
              context.previousProduct
            );
          }
        },
        // After success or failure, invalidate the query
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ['product', productId] });
          setIsEditing(false);
        },
      }
    }
  );
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };
  
  // Handle error states with custom error UI
  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardHeader className="bg-destructive/5">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Error Loading Product</span>
          </CardTitle>
          <CardDescription>
            We encountered a problem loading this product.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Handle loading state
  if (isLoading || !product) {
    return (
      <Card className="min-h-[300px] flex flex-col justify-center items-center p-6">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-muted-foreground">Loading product details...</p>
      </Card>
    );
  }
  
  // Main content - display or edit product
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Product' : product.name}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update the product details below' 
            : `Product ID: ${productId}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="pt-2 flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">{product.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">${product.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock</p>
                <p className="font-medium">{product.stock} units</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{product.category}</p>
            </div>
            
            {product.updatedAt && (
              <p className="text-xs text-muted-foreground">
                Last updated: {product.updatedAt.toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
      {!isEditing && (
        <CardFooter>
          <Button 
            onClick={handleEditClick}
            variant="outline"
          >
            Edit Product
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Export the component wrapped in an ErrorBoundary
export function ProductDetailsWithErrorBoundary({ productId }: { productId: string }) {
  return (
    <ErrorBoundary>
      <ProductDetails productId={productId} />
    </ErrorBoundary>
  );
}

export default ProductDetailsWithErrorBoundary;
