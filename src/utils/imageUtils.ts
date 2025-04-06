
import { supabase } from '@/integrations/supabase/client';

// Function to crop an image to a circle
export const cropImageToCircle = async (imageFile: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Find the smallest dimension to create a perfect circle
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      // Draw a circle and clip everything outside
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      // Calculate the center crop position
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;

      // Draw the image with proper centering
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not create blob from canvas'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(imageFile);
  });
};

// Function to upload an image to Supabase storage
export const uploadImage = async (
  imageFile: File | Blob,
  path: string,
  fileName: string
): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from('project-files')
      .upload(`${path}/${fileName}`, imageFile, {
        upsert: true,
        contentType: 'image/png',
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    const { data: urlData } = await supabase.storage
      .from('project-files')
      .getPublicUrl(`${path}/${fileName}`);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};
