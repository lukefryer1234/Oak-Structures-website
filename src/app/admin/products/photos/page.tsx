
"use client"; // For state, potential uploads

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react'; // Icons
import Image from 'next/image'; // Use next/image for preview
import { Slider } from "@/components/ui/slider"; // Import Slider
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { useProductImages, useAddProductImage, useDeleteProductImage } from '@/hooks/product-images/use-product-images';
import type { ProductImage, ImageType as ServiceImageType } from '@/services/domain/product-images/product-images-service';

// Updated imageTypes array
// Using ServiceImageType from the service now, aligning with ProductImageSchema
const imageTypes: ServiceImageType[] = ["banner", "thumbnail", "gallery", "detail"]; // These are the valid enum values from ProductImageSchema
const categoryTargets = ['Garages', 'Gazebos', 'Porches', 'Oak Beams', 'Oak Flooring', 'Special Deals']; // These might need to align with actual category IDs/slugs from DB
// Placeholder targets for background images - add more as needed
const pageTargets = ['home', 'products', 'gallery', 'about', 'contact', 'basket', 'checkout', 'account', 'admin', 'login', 'forgot-password', 'custom-order', 'delivery', 'faq', 'order-confirmation', 'privacy', 'terms'];
// Add logic to fetch Special Deal IDs/Names and Config Option IDs dynamically for 'target' field

export default function ProductPhotosPage() {
  const { toast } = useToast();
  const { data: imagesData, isLoading: isLoadingImages, isError: isErrorImages, error: errorImages } = useProductImages();
  const { mutate: addImage, isLoading: isAddingImage } = useAddProductImage();
  const { mutate: deleteImage, isLoading: isDeletingImage } = useDeleteProductImage();
  const images = imagesData || [];

  const [newImageType, setNewImageType] = useState<ServiceImageType | ''>('');
  const [newImageTarget, setNewImageTarget] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [newImageOpacity, setNewImageOpacity] = useState<number>(10); // Default opacity 10%
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // const { toast } = useToast(); // Already initialized via useAddProductImage etc. // This was a mistake, toast is needed for local validation.

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setNewImageUrl(URL.createObjectURL(event.target.files[0])); // Show preview
       // Auto-fill alt text from filename (basic)
       setNewImageAlt(event.target.files[0].name.split('.')[0].replace(/[-_]/g, ' '));
    }
  };

  const handleAddImage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newImageType || !newImageTarget || (!newImageUrl && !selectedFile) || !newImageAlt) {
        toast({ variant: "destructive", title: "Validation Error", description: "Please fill in Type, Target, Alt Text, and provide an Image URL or Upload." });
        return;
    }

    const resetForm = () => {
        setNewImageType('detail'); // Reset to a default valid type from the updated imageTypes
        setNewImageTarget('');
        setNewImageUrl('');
        setNewImageAlt('');
        setNewImageOpacity(10);
        setSelectedFile(null);
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const commonImageData = {
        type: newImageType, // Already ServiceImageType
        target: newImageTarget,
        altText: newImageAlt,
        opacity: (newImageType === 'background' || newImageType === 'banner') ? newImageOpacity / 100 : 1, // Opacity 0-1
    };

    if (selectedFile) {
        addImage({
            file: selectedFile,
            productId: newImageTarget, // productId maps to 'target' in the hook's current implementation that calls service
            data: commonImageData
        }, { onSuccess: resetForm });
    } else {
        addImage({
            imageData: { // This param is for when URL is provided directly
                ...commonImageData,
                url: newImageUrl, // URL is required here
            }
        }, { onSuccess: resetForm });
    }
  };

  const handleDeleteImage = (id: string) => {
     if (window.confirm("Are you sure you want to delete this image association? This may not delete the actual image file from storage depending on setup.")) {
        deleteImage(id);
        // onSuccess and onError are handled by the useDeleteProductImage hook
     }
  };

  // Dynamically render target options based on selected type
  const renderTargetOptions = () => {
    switch (newImageType) {
      case 'category': // Targets a category name/slug
        return (
           <Select value={newImageTarget} onValueChange={setNewImageTarget} required>
             <SelectTrigger id="target-select">
                <SelectValue placeholder="Select Category Target" />
             </SelectTrigger>
             <SelectContent>
               {categoryTargets.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
             </SelectContent>
           </Select>
        );
       case 'background': // Targets a page key
           return (
             <Select value={newImageTarget} onValueChange={setNewImageTarget} required>
               <SelectTrigger id="target-select">
                 <SelectValue placeholder="Select Page Target" />
               </SelectTrigger>
               <SelectContent>
                 {pageTargets.map(page => <SelectItem key={page} value={page}>{page.charAt(0).toUpperCase() + page.slice(1)}</SelectItem>)}
               </SelectContent>
             </Select>
           );
       case 'special_deal': // Targets a Special Deal ID
           return <Input id="target-input" placeholder="Enter Special Deal ID" value={newImageTarget} onChange={(e) => setNewImageTarget(e.target.value)} required />;
       case 'config_option': // Targets a Config Option ID (e.g., 'truss-curved')
           return <Input id="target-input" placeholder="Enter Config Option ID" value={newImageTarget} onChange={(e) => setNewImageTarget(e.target.value)} required />;
       case 'main_product': // These types typically target a Product ID
       case 'thumbnail':
       case 'gallery':
       case 'detail':
            return <Input id="target-input" placeholder="Enter Product ID" value={newImageTarget} onChange={(e) => setNewImageTarget(e.target.value)} required />;
      default: // Should not happen if newImageType is always valid due to initialization
        return <Input id="target-input" placeholder="Select Image Type first" value={newImageTarget} disabled />;
    }
  };

   // Helper function to format ImageType for display
   const formatImageType = (type: ServiceImageType): string => {
       return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
   }

  return (
    <div className="space-y-8">
      {/* Add New Image Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Product Image</CardTitle>
          <CardDescription>Upload or link an image and associate it with a product category, special deal, configuration option, page element, or page background.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddImage} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {/* Image Type Select */}
                 <div className="space-y-2">
                    <Label htmlFor="image-type">Image Type <span className="text-destructive">*</span></Label>
                    <Select value={newImageType} onValueChange={(value) => setNewImageType(value as ServiceImageType)} required>
                       <SelectTrigger id="image-type">
                          <SelectValue placeholder="Select Type" />
                       </SelectTrigger>
                       <SelectContent>
                          {imageTypes.map(type => <SelectItem key={type} value={type}>{formatImageType(type as ServiceImageType)}</SelectItem>)}
                       </SelectContent>
                    </Select>
                 </div>

                 {/* Target Select/Input */}
                 <div className="space-y-2">
                    <Label htmlFor="target-select">Target <span className="text-destructive">*</span></Label>
                    {renderTargetOptions()}
                 </div>

                {/* Alt Text */}
                 <div className="space-y-2">
                   <Label htmlFor="alt-text">Alt Text <span className="text-destructive">*</span></Label>
                   <Input id="alt-text" placeholder="Descriptive text for the image" value={newImageAlt} onChange={(e) => setNewImageAlt(e.target.value)} required />
                 </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                 {/* Image Upload */}
                <div className="space-y-2">
                    <Label htmlFor="image-upload">Upload Image</Label>
                     <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="pt-2"/>
                     <p className="text-xs text-muted-foreground">Overrides Image URL if selected.</p>
                     {/* Optional Preview */}
                     {selectedFile && newImageUrl.startsWith('blob:') && (
                         <div className="mt-2">
                             <Image src={newImageUrl} alt="Preview" width={80} height={80} className="rounded-md object-cover aspect-square border" />
                         </div>
                     )}
                 </div>

                 {/* Image URL Input */}
                 <div className="space-y-2">
                    <Label htmlFor="image-url">Or Enter Image URL</Label>
                    <Input id="image-url" type="url" placeholder="https://..." value={newImageUrl} onChange={(e) => { setNewImageUrl(e.target.value); setSelectedFile(null); }} disabled={!!selectedFile} />
                 </div>
             </div>

             {/* Opacity Slider (only shown for background images) */}
             {newImageType === 'background' && (
                 <div className="space-y-2 pt-4">
                   <Label htmlFor="opacity-slider">Background Opacity ({newImageOpacity}%)</Label>
                   <Slider
                     id="opacity-slider"
                     min={0}
                     max={100}
                     step={1}
                     value={[newImageOpacity]}
                     onValueChange={(value) => setNewImageOpacity(value[0])}
                     className="py-2"
                   />
                   <p className="text-xs text-muted-foreground">Set how transparent the background image should be (0% = invisible, 100% = fully opaque). Low values (e.g., 5-10%) are recommended.</p>
                 </div>
             )}

             <div className="flex justify-end pt-4 border-t">
                 <Button type="submit" disabled={isAddingImage}>
                   {isAddingImage ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Adding...</> : <><Upload className="mr-2 h-4 w-4"/> Add Image</>}
                 </Button>
             </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Images List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Images</CardTitle>
           <CardDescription>Manage currently associated product and page images.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoadingImages ? (
            <div className="flex justify-center items-center py-10 col-span-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isErrorImages ? (
            <p className="text-red-500 col-span-full text-center">Error loading images: {errorImages?.message}</p>
          ) : images.length > 0 ? (
            images.map((img) => (
              <Card key={img.id} className="overflow-hidden group relative">
                 <div className="relative aspect-square w-full bg-muted">
                   <Image src={img.url} alt={img.altText} layout="fill" objectFit="cover" />
                </div>
                 <div className="p-3 text-xs space-y-1 bg-card">
                   <p><strong className="text-muted-foreground">Type:</strong> {formatImageType(img.type)}</p>
                   <p><strong className="text-muted-foreground">Target:</strong> {img.target}</p>
                   <p><strong className="text-muted-foreground">Alt:</strong> {img.altText}</p>
                    {img.type === 'background' && img.opacity !== undefined && (
                       <p><strong className="text-muted-foreground">Opacity:</strong> {(img.opacity * 100).toFixed(0)}%</p>
                    )}
                    <p className="truncate"><strong className="text-muted-foreground">URL:</strong> <a href={img.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{img.url}</a></p>
                </div>
                 <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteImage(img.id)}
                    disabled={isDeletingImage}
                 >
                    {isDeletingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    <span className="sr-only">Delete Image Association</span>
                 </Button>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center py-10">No images associated yet.</p>
          )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    