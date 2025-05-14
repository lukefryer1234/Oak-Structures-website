import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";

// Upload an image to Firebase Storage
export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// List all images in a directory
export async function listImages(directory: string): Promise<string[]> {
  try {
    const directoryRef = ref(storage, directory);
    const result = await listAll(directoryRef);
    const urls = await Promise.all(
      result.items.map(async (itemRef) => await getDownloadURL(itemRef)),
    );
    return urls;
  } catch (error) {
    console.error("Error listing images:", error);
    return []; // Return empty array instead of throwing
  }
}

// Delete an image from Firebase Storage
export async function deleteImage(path: string): Promise<void> {
  try {
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

// Get the URL of the first image in a directory or use fallback
export async function getFirstImageInDirectory(
  directory: string,
  fallbackUrl: string,
): Promise<string> {
  try {
    const directoryRef = ref(storage, directory);
    const result = await listAll(directoryRef);

    if (result.items.length > 0) {
      return await getDownloadURL(result.items[0]);
    }

    return fallbackUrl;
  } catch (error) {
    console.error(`Error getting image from ${directory}:`, error);
    return fallbackUrl;
  }
}
