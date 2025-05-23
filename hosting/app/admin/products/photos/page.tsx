
"use client"; // For state, potential uploads

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react'; // Icons
import Image from 'next/image'; // Use next/image for preview
import { Slider } from "@/components/ui/slider"; // Import Slider
import { useToast } from "@/hooks/use-toast"; // Import useToast

// --- Types and Placeholder Data ---

// Added 'background' type
type ImageType = 'category' | 'special_deal' | 'config_option' | 'main_product' | 'background';

interface ProductImage {
  id: string;
  type: ImageType;
  target: string; // Category name, Deal ID/Name, Config Option ID, Page Key (e.g., 'home', 'garages')
  url: string; // Image URL
  altText: string; // Alt text for accessibility
  opacity?: number; // Optional opacity for background images (0-100)
}

// Placeholder data - Fetch from backend
const initialImages: ProductImage[] = [
  { id: 'img1', type: 'category', target: 'Garages', url: 'https://picsum.photos/seed/garage-category/200/200', altText: 'Oak Frame Garages Category' },
  { id: 'img2', type: 'category', target: 'Gazebos', url: 'https://picsum.photos/seed/gazebo-category/200/200', altText: 'Oak Frame Gazebos Category' },
  { id: 'img3', type: 'special_deal', target: 'deal1', url: 'https://picsum.photos/seed/deal1/200/200', altText: 'Pre-Configured Double Garage Deal' },
  { id: 'img4', type: 'config_option', target: 'truss-curved', url: 'https://picsum.photos/seed/truss-curved/200/200', altText: 'Curved Truss Option Preview' },
  { id: 'img5', type: 'config_option', target: 'truss-straight', url: 'https://picsum.photos/seed/truss-straight/200/200', altText: 'Straight Truss Option Preview' },
  { id: 'img6', type: 'main_product', target: 'Garages', url: 'https://picsum.photos/seed/main-garage/400/300', altText: 'Main Garage Product Image' },
   { id: 'img7', type: 'background', target: 'home', url: 'https://picsum.photos/seed/home-bg/1920/1080', altText: 'Homepage Background Image', opacity: 5 }, // Example with opacity
   { id: 'img8', type: 'background', target: 'about', url: 'https://picsum.photos/seed/about-bg/1920/1080', altText: 'About Page Background Image', opacity: 5 },
];

// Updated imageTypes array
const imageTypes: ImageType[] = ['category', 'main_product', 'background', 'special_deal', 'config_option'];
const categoryTargets = ['Garages', 'Gazebos', 'Porches', 'Oak Beams', 'Oak Flooring', 'Special Deals'];
// Placeholder targets for background images - add more as needed
const pageTargets = ['home', 'products', 'gallery', 'about', 'contact', 'basket', 'checkout', 'account', 'admin', 'login', 'forgot-password', 'custom-order', 'delivery', 'faq', 'order-confirmation', 'privacy', 'terms'];
// Add logic to fetch Special Deal IDs/Names and Config Option IDs

export default function ProductPhotosPage() {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [newImageType, setNewImageType] = useState<ImageType | ''>('');
  const [newImageTarget, setNewImageTarget] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [newImageOpacity, setNewImageOpacity] = useState<number>(10); // Default opacity 10%
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

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
        toast({ // Use toast for validation
            variant: "destructive",
            title: "Validation Error",
            description: "Please fill in Type, Target, Alt Text, and provide an Image URL or Upload.",
        });
        return;
    }

    let finalImageUrl = newImageUrl;

    // --- Placeholder File Upload Logic ---
    if (selectedFile) {
        // In a real app, upload the file to cloud storage (e.g., S3, GCS)
        // and get the public URL back.
        console.log("Uploading file:", selectedFile.name);
        // Simulate upload delay and getting a URL
        await new Promise(resolve => setTimeout(resolve, 1000));
        finalImageUrl = `https://picsum.photos/seed/${Date.now()}/200/200`; // Placeholder URL after "upload"
        console.log("Simulated upload complete. URL:", finalImageUrl);
        toast({ title: "Info", description: "Image upload simulated." });
    }
     // --- End Placeholder ---


    const newImage: ProductImage = {
        id: `img${Date.now()}`,
        type: newImageType as ImageType,
        target: newImageTarget,
        url: finalImageUrl,
        altText: newImageAlt,
        // Only include opacity if it's a background image
        opacity: newImageType === 'background' ? newImageOpacity : undefined,
    };

    setImages(prev => [...prev, newImage]);
     // TODO: API call to save image metadata to backend
     console.log("Added Image:", newImage);
     toast({ title: "Success", description: "Image association added." });

    // Reset form
    setNewImageType('');
    setNewImageTarget('');
    setNewImageUrl('');
    setNewImageAlt('');
    setNewImageOpacity(10); // Reset opacity
    setSelectedFile(null);
     // Reset file input visually
     const fileInput = document.getElementById('image-upload') as HTMLInputElement;
     if (fileInput) fileInput.value = '';

  };

  const handleDeleteImage = (id: string) => {
     if (window.confirm("Are you sure you want to delete this image association? This does not delete the actual image file from storage.")) {
        setImages(prev => prev.filter(img => img.id !== id));
         // TODO: API call to delete image metadata from backend
        console.log("Deleted Image ID:", id);
        toast({ title: "Deleted", description: "Image association removed." });
     }
  };

  // Dynamically render target options based on selected type
  const renderTargetOptions = () => {
    switch (newImageType) {
      case 'category':
      case 'main_product': // Main product images target categories
        return (
           <Select value={newImageTarget} onValueChange={setNewImageTarget} required>
             <SelectTrigger id="target-select">
                <SelectValue placeholder="Select Category" />
             </SelectTrigger>
             <SelectContent>
               {categoryTargets.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
             </SelectContent>
           </Select>
        );
       case 'background': // Background images target pages
           return (
             <Select value={newImageTarget} onValueChange={setNewImageTarget} required>
               <SelectTrigger id="target-select">
                 <SelectValue placeholder="Select Page" />
               </SelectTrigger>
               <SelectContent>
                 {pageTargets.map(page => <SelectItem key={page} value={page}>{page.charAt(0).toUpperCase() + page.slice(1)}</SelectItem>)}
               </SelectContent>
             </Select>
           );
       case 'special_deal':
           // Replace with actual dynamic list of Deal IDs/Names
           return <Input id="target-input" placeholder="Enter Special Deal ID or Name" value={newImageTarget} onChange={(e) => setNewImageTarget(e.target.value)} required />;
       case 'config_option':
           // Replace with actual dynamic list of Config Option IDs
           return <Input id="target-input" placeholder="Enter Config Option ID (e.g., truss-curved)" value={newImageTarget} onChange={(e) => setNewImageTarget(e.target.value)} required />;
      default:
        return <Input id="target-input" placeholder="Select Image Type first" disabled />;
    }
  };

   // Helper function to format ImageType for display
   const formatImageType = (type: ImageType): string => {
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
                    <Select value={newImageType} onValueChange={(value) => setNewImageType(value as ImageType)} required>
                       <SelectTrigger id="image-type">
                          <SelectValue placeholder="Select Type" />
                       </SelectTrigger>
                       <SelectContent>
                          {imageTypes.map(type => <SelectItem key={type} value={type}>{formatImageType(type)}</SelectItem>)}
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
                 <Button type="submit"><Upload className="mr-2 h-4 w-4"/> Add Image</Button>
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
            {images.length > 0 ? (
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
                         <p><strong className="text-muted-foreground">Opacity:</strong> {img.opacity}%</p>
                      )}
                      <p className="truncate"><strong className="text-muted-foreground">URL:</strong> <a href={img.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{img.url}</a></p>
                  </div>
                   {/* Delete Button */}
                   <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteImage(img.id)}
                   >
                      <Trash2 className="h-4 w-4" />
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

    