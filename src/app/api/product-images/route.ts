import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ProductImagesService } from "@/services/domain/product-images/product-images-service";
import { handleApiError } from "@/lib/errorHandling";
import { requireAdmin } from "@/lib/auth";
import { StorageService } from "@/services/firebase/storage-service";

// Define validation schema for filtering product images in GET request
const getProductImagesSchema = z.object({
  type: z.enum(["banner", "thumbnail", "gallery", "detail"]).optional(),
  target: z.string().optional(),
});

// Define validation schema for creating a new product image
const createProductImageSchema = z.object({
  type: z.enum(["banner", "thumbnail", "gallery", "detail"], {
    errorMap: () => ({ message: "Invalid image type" }),
  }),
  target: z.string().min(1, "Target is required"),
  altText: z.string().min(1, "Alt text is required"),
  opacity: z.number().min(0, "Opacity must be between 0 and 1").max(1, "Opacity must be between 0 and 1"),
  imageData: z.string().min(1, "Image data is required"), // Base64 encoded image
  fileName: z.string().min(1, "File name is required"),
  contentType: z.string().min(1, "Content type is required"),
});

// Define validation schema for updating a product image (all fields optional for partial updates)
const updateProductImageSchema = z.object({
  type: z.enum(["banner", "thumbnail", "gallery", "detail"], {
    errorMap: () => ({ message: "Invalid image type" }),
  }).optional(),
  target: z.string().min(1, "Target is required").optional(),
  altText: z.string().min(1, "Alt text is required").optional(),
  opacity: z.number().min(0, "Opacity must be between 0 and 1").max(1, "Opacity must be between 0 and 1").optional(),
  url: z.string().url("Must be a valid URL").optional(),
});

/**
 * GET /api/product-images
 * Get all product images with optional filtering by type and target
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const target = searchParams.get("target") || undefined;

    // Validate parameters if provided
    if (type || target) {
      const validationResult = getProductImagesSchema.safeParse({ type, target });
      if (!validationResult.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid query parameters",
            errors: validationResult.error.errors
          }, 
          { status: 400 }
        );
      }
    }

    // Get product images with optional filters
    const productImages = await ProductImagesService.getAllProductImages({ type, target });

    return NextResponse.json({
      success: true,
      data: productImages,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/product-images
 * Create a new product image
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin for creating product images
    await requireAdmin();

    // Parse request body
    const data = await request.json();
    const validationResult = createProductImageSchema.safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { type, target, altText, opacity, imageData, fileName, contentType } = validationResult.data;

    // Convert base64 to blob
    const base64Data = imageData.split(',')[1]; // Remove data:image/jpeg;base64, part
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let i = 0; i < byteCharacters.length; i += 1024) {
      const slice = byteCharacters.slice(i, i + 1024);
      const byteNumbers = new Array(slice.length);
      
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    
    const blob = new Blob(byteArrays, { type: contentType });

    // Generate a unique path for the image
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const path = `product-images/${type}/${target}/${uniqueFileName}`;

    // Upload the image to Firebase Storage
    const url = await StorageService.uploadFileSimple(
      path,
      blob,
      { contentType, customMetadata: { altText, type, target } }
    );

    // Create the product image document
    const result = await ProductImagesService.addProductImage({
      type,
      target,
      url,
      altText,
      opacity,
    });

    if (!result.success) {
      // If failed to create the document, clean up by deleting the uploaded file
      await StorageService.deleteFile(path);
      
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          errors: result.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product image created successfully",
      data: result.data,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/product-images/:id
 * Delete a product image by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin for deleting product images
    await requireAdmin();

    // Extract the ID from the URL path
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product image ID is required",
        },
        { status: 400 }
      );
    }

    // Delete the product image
    const result = await ProductImagesService.deleteProductImage(id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product image deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/product-images/:id
 * Update a product image by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin for updating product images
    await requireAdmin();

    // Extract the ID from the URL path
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product image ID is required",
        },
        { status: 400 }
      );
    }

    // Parse request body
    const data = await request.json();
    const validationResult = updateProductImageSchema.safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Check if any update data was provided
    const updates = validationResult.data;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No update data provided",
        },
        { status: 400 }
      );
    }

    // Update the product image
    const result = await ProductImagesService.updateProductImage(id, updates);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          errors: result.errors,
        },
        { status: result.message.includes("not found") ? 404 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product image updated successfully",
      data: result.data,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
