"use client"; // For state, potential uploads

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Trash2, Loader2 } from "lucide-react"; // Added Loader2 for loading states
import Image from "next/image"; 
import { Slider } from "@/components/ui/slider"; 
import { useToast } from "@/hooks/use-toast"; 
import { 
  useProductImages, 
  useAddProductImage, 
  useDeleteProductImage,
  ProductImage 
} from "@/hooks/product-images/use-product-images";

// --- Types and Placeholder Data ---

// Image types
type ImageType =
  | "category"
  | "special_deal"
  | "config_option"
  | "main_product"
  | "background";

// Placeholder data - Fetch from backend
// Removed placeholder data as we'll fetch from the backend

// Updated imageTypes array
const imageTypes: ImageType[] = [
  "category",
  "main_product",
  "background",
  "special_deal",
  "config_option",
];
const categoryTargets = [
  "Garages",
  "Gazebos",
  "Porches",
  "Oak Beams",
  "Oak Flooring",
  "Special Deals",
];
// Placeholder targets for background images - add more as needed
const pageTargets = [
  "home",
  "products",
  "gallery",
  "about",
  "contact",
  "basket",
  "checkout",
  "account",
  "admin",
  "login",
  "forgot-password",
  "custom-order",
  "delivery",
  "faq",
  "order-confirmation",
  "privacy",
  "terms",
];
// Add logic to fetch Special Deal IDs/Names and Config Option IDs

export default function ProductPhotosPage() {
  // State for the form
  const [newImageType, setNewImageType] = useState<ImageType | "">("");
  const [newImageTarget, setNewImageTarget] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");
  const [newImageOpacity, setNewImageOpacity] = useState<number>(10); // Default opacity 10%
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Use our custom hook to fetch all product images
  const { 
    data: images = [], 
    isLoading,
    error: fetchError,
  } = useProductImages();

  // Use our custom hooks for mutations
  const { mutate: addImage, isPending: isAddingImage } = useAddProductImage();
  const { mutate: deleteImage, isPending: isDeletingImage } = useDeleteProductImage();

  // Handle file selection for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    
    const file = files[0];
    setSelectedFile(file);
    
    // Create a preview URL for the selected file
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setNewImageUrl(previewUrl);
  };

  // Reset form state after submission
  const resetForm = () => {
    setNewImageType("");
    setNewImageTarget("");
    setNewImageUrl("");
    setNewImageAlt("");
    setNewImageOpacity(10);
    setSelectedFile(null);
    
    // Revoke any existing object URLs to prevent memory leaks
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  // Handle form submission to add a new image
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newImageType || !newImageTarget) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Image type and target are required fields.",
      });
      return;
    }
    
    // Prepare data for the mutation
    const imageData: Omit<ProductImage, 'id' | 'createdAt'> = {
      type: newImageType as string,
      target: newImageTarget,
      url: newImageUrl, // This will be overridden if a file is uploaded
      altText: newImageAlt || "",
    };
    
    // Add opacity for background images
    if (newImageType === "background") {
      imageData.opacity = newImageOpacity;
    }
    
    // Use the addImage mutation
    // If a file is selected, the service should handle the file upload
    addImage({
      ...imageData,
      file: selectedFile || undefined
    }, {
      onSuccess: () => {
        resetForm();
        toast({
          title: "Success",
          description: "Image added successfully.",
        });
      },
      onError: (error) => {
        console.error("Error adding image:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add the image. Please try again.",
        });
      }
    });
  };

  // Handle image deletion
  const handleDeleteImage = (id: string) => {
    if (isDeletingImage) return;

    deleteImage(id, {
      onSuccess: () => {
        toast({
          title: "Deleted",
          description: "Image association removed from database.",
        });
      },
      onError: (error) => {
        console.error("Error deleting image:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete image. Please try again.",
        });
      }
    });
  };

  // Dynamically render target options based on selected type
  const renderTargetOptions = () => {
    switch (newImageType) {
      case "category":
      case "main_product": // Main product images target categories
        return (
          <Select
            value={newImageTarget}
            onValueChange={setNewImageTarget}
            required
          >
            <SelectTrigger id="target-select">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryTargets.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "background": // Background images target pages
        return (
          <Select
            value={newImageTarget}
            onValueChange={setNewImageTarget}
            required
          >
            <SelectTrigger id="target-select">
              <SelectValue placeholder="Select Page" />
            </SelectTrigger>
            <SelectContent>
              {pageTargets.map((page) => (
                <SelectItem key={page} value={page}>
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "special_deal":
        // Replace with actual dynamic list of Deal IDs/Names
        return (
          <Input
            id="target-input"
            placeholder="Enter Special Deal ID or Name"
            value={newImageTarget}
            onChange={(e) => setNewImageTarget(e.target.value)}
            required
          />
        );
      case "config_option":
        // Replace with actual dynamic list of Config Option IDs
        return (
          <Input
            id="target-input"
            placeholder="Enter Config Option ID (e.g., truss-curved)"
            value={newImageTarget}
            onChange={(e) => setNewImageTarget(e.target.value)}
            required
          />
        );
      default:
        return (
          <Input
            id="target-input"
            placeholder="Select Image Type first"
            disabled
          />
        );
    }
  };

  // Helper function to format ImageType for display
  const formatImageType = (type: ImageType): string => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-8">
      {/* Add New Image Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Product Image</CardTitle>
          <CardDescription>
            Upload or link an image and associate it with a product category,
            special deal, configuration option, page element, or page
            background.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddImage} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Image Type Select */}
              <div className="space-y-2">
                <Label htmlFor="image-type">
                  Image Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={newImageType}
                  onValueChange={(value) => setNewImageType(value as ImageType)}
                  required
                >
                  <SelectTrigger id="image-type">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {imageTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatImageType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Select/Input */}
              <div className="space-y-2">
                <Label htmlFor="target-select">
                  Target <span className="text-destructive">*</span>
                </Label>
                {renderTargetOptions()}
              </div>

              {/* Alt Text */}
              <div className="space-y-2">
                <Label htmlFor="alt-text">Alt Text (optional)</Label>
                <Input
                  id="alt-text"
                  placeholder="Descriptive text for the image"
                  value={newImageAlt}
                  onChange={(e) => setNewImageAlt(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image-upload">Upload Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="pt-2"
                />
                <p className="text-xs text-muted-foreground">
                  Overrides Image URL if selected.
                </p>
                {/* Optional Preview */}
                {imagePreview && (
                  <div className="mt-2">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="rounded-md object-cover aspect-square border"
                    />
                  </div>
                )}
              </div>

              {/* Image URL Input */}
              <div className="space-y-2">
                <Label htmlFor="image-url">Or Enter Image URL</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://..."
                  value={newImageUrl}
                  onChange={(e) => {
                    setNewImageUrl(e.target.value);
                    setSelectedFile(null);
                  }}
                  disabled={!!selectedFile}
                />
              </div>
            </div>

            {/* Opacity Slider (only shown for background images) */}
            {newImageType === "background" && (
              <div className="space-y-2 pt-4">
                <Label htmlFor="opacity-slider">
                  Background Opacity ({newImageOpacity}%)
                </Label>
                <Slider
                  id="opacity-slider"
                  min={0}
                  max={100}
                  step={1}
                  value={[newImageOpacity]}
                  onValueChange={(value) => setNewImageOpacity(value[0])}
                  className="py-2"
                />
                <p className="text-xs text-muted-foreground">
                  Set how transparent the background image should be (0% =
                  invisible, 100% = fully opaque). Low values (e.g., 5-10%) are
                  recommended.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button 
                type="submit" 
                disabled={isAddingImage}
              >
                {isAddingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Add Image
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Images List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Images</CardTitle>
          <CardDescription>
            Manage currently associated product and page images.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.length > 0 ? (
              images.map((img) => (
                <Card key={img.id} className="overflow-hidden group relative">
                  <div className="relative aspect-square w-full bg-muted">
                    <Image
                      src={img.url}
                      alt={img.altText}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="p-3 text-xs space-y-1 bg-card">
                    <p>
                      <strong className="text-muted-foreground">Type:</strong>{" "}
                      {formatImageType(img.type)}
                    </p>
                    <p>
                      <strong className="text-muted-foreground">Target:</strong>{" "}
                      {img.target}
                    </p>
                    <p>
                      <strong className="text-muted-foreground">Alt:</strong>{" "}
                      {img.altText}
                    </p>
                    {img.type === "background" && img.opacity !== undefined && (
                      <p>
                        <strong className="text-muted-foreground">
                          Opacity:
                        </strong>{" "}
                        {img.opacity}%
                      </p>
                    )}
                    <p className="truncate">
                      <strong className="text-muted-foreground">URL:</strong>{" "}
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {img.url}
                      </a>
                    </p>
                  </div>
                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteImage(img.id)}
                    disabled={isDeletingImage}
                  >
                    {isDeletingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Delete Image Association</span>
                  </Button>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-10">
                No images associated yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
