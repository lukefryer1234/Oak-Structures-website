"use client";

import { useState } from 'react';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { useSafeQuery, useSafeMutation } from '@/hooks/use-safe-query';
import ProductService, { Product, Category } from '@/services/domain/product-service';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, 
  Save, 
  AlertCircle, 
  RefreshCw,
  Trash,
  Star,
  StarOff
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

/**
 * A component that demonstrates transaction-based updates for product management
 */
function ProductAdmin({ productId }: { productId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch the product
  const { 
    data: product, 
    isLoading: productLoading, 
    error: productError,
    refetch: refetchProduct
  } = useSafeQuery<Product>(
    ['admin-product', productId],
    async () => await ProductService.getProduct(productId),
    {
      context: 'ProductAdmin',
      showErrorToast: true,
      toastTitle: 'Product Error',
      queryOptions: {
        staleTime: 60 * 1000, // 1 minute
      }
    }
  );
  
  // Fetch categories for the dropdown
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useSafeQuery<Category[]>(
    ['admin-categories'],
    async () => await ProductService.getCategories(),
    {
      context: 'ProductAdmin-categories',
      queryOptions: {
        staleTime: 5 * 60 * 1000, // 5 minutes
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
        category: product.category,
        featured: product.featured,
      });
      setIsEditing(true);
    }
  };
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['price', 'stock'].includes(name) 
        ? parseFloat(value) 
        : value
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle switch/checkbox changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Mutation for updating a product with transaction-based updates
  const updateProductMutation = useSafeMutation<Product, Error, Partial<Product>>(
    async (data) => {
      // Use the ProductService to ensure proper transaction-based updates
      return await ProductService.updateProduct(productId, data);
    },
    {
      context: 'Updating product',
      showErrorToast: true,
      showSuccessToast: true,
      errorToastTitle: 'Update Failed',
      successToastTitle: 'Product Updated',
      successToastMessage: 'Product details have been updated successfully.',
      mutationOptions: {
        // After success or failure, invalidate the query and reset form
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
          setIsEditing(false);
        },
      }
    }
  );
  
  // Mutation for deleting a product
  const deleteProductMutation = useSafeMutation<void, Error, void>(
    async () => {
      // Use the ProductService for transaction-based deletion
      await ProductService.deleteProduct(productId);
    },
    {
      context: 'Deleting product',
      showErrorToast: true,
      showSuccessToast: true,
      errorToastTitle: 'Deletion Failed',
      successToastTitle: 'Product Deleted',
      successToastMessage: 'Product has been deleted successfully.',
    }
  );
  
  // Mutation for toggling featured status with optimistic updates
  const toggleFeaturedMutation = useSafeMutation<Product, Error, boolean>(
    async (featured) => {
      // Use the ProductService for optimistic updates
      return await ProductService.toggleProductFeatured(productId, featured);
    },
    {
      context: 'Toggling featured status',
      showErrorToast: true,
      mutationOptions: {
        // Optimistic update
        onMutate: async (featured) => {
          await queryClient.cancelQueries({ queryKey: ['admin-product', productId] });
          
          const previousProduct = queryClient.getQueryData<Product>(
            ['admin-product', productId]
          );
          
          if (previousProduct) {
            queryClient.setQueryData(['admin-product', productId], {
              ...previousProduct,
              featured,
            });
          }
          
          // Show toast for better user experience
          toast({
            title: featured ? 'Product Featured' : 'Product Unfeatured',
            description: 'Status updated successfully.',
          });
          
          return { previousProduct };
        },
        // Roll back on error
        onError: (err, featured, context: any) => {
          if (context?.previousProduct) {
            queryClient.setQueryData(
              ['admin-product', productId],
              context.previousProduct
            );
          }
        },
        // Always refetch after to ensure data consistency
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
        },
      }
    }
  );
  
  // Handle form submission for product updates
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProductMutation.mutate(formData);
  };
  
  // Handle product deletion with confirmation
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProductMutation.mutate();
    }
  };
  
  // Handle featured status toggle
  const handleToggleFeatured = () => {
    if (product) {
      toggleFeaturedMutation.mutate(!product.featured);
    }
  };
  
  // Loading state
  if (productLoading) {
    return (
      <Card className="min-h-[300px] flex flex-col justify-center items-center p-6">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-muted-foreground">Loading product details...</p>
      </Card>
    );
  }
  
  // Error state
  if (productError) {
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
            {productError instanceof Error ? productError.message : 'An unknown error occurred'}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => refetchProduct()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // No product found
  if (!product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Not Found</CardTitle>
          <CardDescription>
            The requested product could not be found.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Main content - edit form or product details
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">
            {isEditing ? 'Edit Product' : product.name}
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Update the product details below' 
              : `ID: ${productId} • Category: ${product.category}`}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          {!isEditing && (
            <>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleToggleFeatured}
                disabled={toggleFeaturedMutation.isPending}
                title={product.featured ? "Remove from featured" : "Add to featured"}
              >
                {toggleFeaturedMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : product.featured ? (
                  <StarOff className="h-4 w-4" />
                ) : (
                  <Star className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="destructive" 
                size="icon"
                onClick={handleDelete}
                disabled={deleteProductMutation.isPending}
                title="Delete product"
              >
                {deleteProductMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
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
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || ''}
                  onValueChange={(value) => handleSelectChange('category', value)}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="featured">Featured Product</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="featured"
                    checked={!!formData.featured}
                    onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
                  />
                  <Label htmlFor="featured" className="cursor-pointer">
                    {formData.featured ? 'Featured' : 'Not Featured'}
                  </Label>
                </div>
              </div>
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
            
            <div className="pt-4 flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={updateProductMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateProductMutation.isPending}
              >
                {updateProductMutation.isPending ? (
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
            <div className="flex items-center space-x-2">
              {product.featured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  Featured
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date(product.updatedAt || product.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm text-muted-foreground mt-1">{product.description || 'No description available'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Price</h3>
                  <p className="text-sm text-muted-foreground mt-1">${product.price?.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Stock</h3>
                  <p className="text-sm text-muted-foreground mt-1">{product.stock} units</p>
                </div>
              </div>
            </div>
            
            <Button onClick={handleEditClick} className="mt-4">
              Edit Product
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProductAdminWithErrorBoundary({ productId }: { productId: string }) {
  return (
    <ErrorBoundary fallback={<p>Error loading product administration interface</p>}>
      <ProductAdmin productId={productId} />
    </ErrorBoundary>
  );
}
