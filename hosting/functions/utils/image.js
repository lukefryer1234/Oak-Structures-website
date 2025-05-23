const sharp = require('sharp');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const os = require('os');
const fs = require('fs');

const storage = new Storage();
const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

// Image sizes for different use cases
const IMAGE_SIZES = {
  thumbnail: { width: 200, height: 200 },
  preview: { width: 600, height: 600 },
  full: { width: 1200, height: 1200 },
  hero: { width: 2000, height: 1000 }
};

// Process and optimize product images
exports.processProductImage = async (file, productId) => {
  const tempFilePath = path.join(os.tmpdir(), file.name);
  const processedImages = {};

  try {
    // Download the uploaded file
    await bucket.file(file.name).download({ destination: tempFilePath });

    // Process image for different sizes
    for (const [size, dimensions] of Object.entries(IMAGE_SIZES)) {
      const outputFileName = `products/${productId}/${size}_${path.basename(file.name)}`;
      const outputPath = path.join(os.tmpdir(), outputFileName);

      // Process image with sharp
      await sharp(tempFilePath)
        .resize(dimensions.width, dimensions.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 80,
          progressive: true
        })
        .toFile(outputPath);

      // Upload processed image
      await bucket.upload(outputPath, {
        destination: outputFileName,
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            productId,
            size,
            originalName: file.name
          }
        }
      });

      // Get public URL
      processedImages[size] = `https://storage.googleapis.com/${bucket.name}/${outputFileName}`;

      // Clean up temp file
      fs.unlinkSync(outputPath);
    }

    // Clean up original temp file
    fs.unlinkSync(tempFilePath);

    // Update product document with new image URLs
    await admin.firestore()
      .collection('products')
      .doc(productId)
      .update({
        images: admin.firestore.FieldValue.arrayUnion(processedImages)
      });

    return processedImages;

  } catch (error) {
    // Clean up temp files in case of error
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw error;
  }
};

// Generate image thumbnail
exports.generateThumbnail = async (filePath, size = { width: 200, height: 200 }) => {
  const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
  const thumbnailPath = path.join(os.tmpdir(), `thumb_${path.basename(filePath)}`);

  try {
    // Download the original file
    await bucket.file(filePath).download({ destination: tempFilePath });

    // Generate thumbnail
    await sharp(tempFilePath)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 80,
        progressive: true
      })
      .toFile(thumbnailPath);

    // Upload thumbnail
    const thumbnailDestination = `thumbnails/${path.basename(filePath)}`;
    await bucket.upload(thumbnailPath, {
      destination: thumbnailDestination,
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          originalPath: filePath,
          thumbnail: true
        }
      }
    });

    // Clean up temp files
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(thumbnailPath);

    return thumbnailDestination;

  } catch (error) {
    // Clean up temp files in case of error
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
    throw error;
  }
};

// Optimize existing images in storage
exports.optimizeStorageImages = async () => {
  try {
    const [files] = await bucket.getFiles({ prefix: 'products/' });
    
    for (const file of files) {
      if (!file.name.includes('_optimized_')) {
        await optimizeImage(file);
      }
    }
  } catch (error) {
    console.error('Error optimizing storage images:', error);
    throw error;
  }
};

// Helper function to optimize a single image
async function optimizeImage(file) {
  const tempFilePath = path.join(os.tmpdir(), path.basename(file.name));
  const optimizedPath = path.join(os.tmpdir(), `optimized_${path.basename(file.name)}`);

  try {
    await file.download({ destination: tempFilePath });

    await sharp(tempFilePath)
      .jpeg({
        quality: 80,
        progressive: true
      })
      .toFile(optimizedPath);

    await bucket.upload(optimizedPath, {
      destination: `${path.dirname(file.name)}/optimized_${path.basename(file.name)}`,
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          optimized: true,
          originalName: file.name
        }
      }
    });

    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(optimizedPath);

  } catch (error) {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    if (fs.existsSync(optimizedPath)) fs.unlinkSync(optimizedPath);
    throw error;
  }
}

