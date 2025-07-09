import { supabase } from '../services/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads image files to Supabase Storage and saves metadata to property_images table.
 * @param listingId - The ID of the listing to associate images with.
 * @param files - Array of image files.
 * @returns Array of public URLs
 */
export async function uploadImagesToStorageAndSaveMetadata(listingId: string, files: File[]): Promise<string[]> {
  const bucketName = 'listing-images';
  const uploadedUrls: string[] = [];

  // Check authentication first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('User not authenticated for upload:', authError);
    throw new Error('User must be authenticated to upload images');
  }

  console.log('Authenticated user uploading:', user.email);

  for (const file of files) {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error(`[Invalid File Type] ${file.name}: Not an image file`);
        continue;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        console.error(`[File Too Large] ${file.name}: Size exceeds 10MB`);
        continue;
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${listingId}/${fileName}`;

      console.log(`Uploading ${file.name} to ${filePath}...`);

      // Try a simple upload first
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        console.error(`[Upload Failed] ${file.name}:`, uploadError);
        console.error('Upload error details:', {
          message: uploadError.message,
          name: uploadError.name,
          stack: uploadError.stack
        });
        
        // Try alternative upload method
        console.log('Trying alternative upload method...');
        const { data: altUploadData, error: altUploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            upsert: true
          });
          
        if (altUploadError) {
          console.error(`[Alternative Upload Failed] ${file.name}:`, altUploadError);
          continue;
        } else {
          console.log('Alternative upload succeeded!');
        }
      }

      console.log(`Upload successful for ${file.name}`);

      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      uploadedUrls.push(publicUrl);

      // 3. Save metadata to property_images table
      const { error: insertError } = await supabase.from('property_images').insert([
        {
          listing_id: listingId,
          url: publicUrl,
          ai_scan: { status: 'pending', scanned_at: new Date().toISOString() }
        },
      ]);

      if (insertError) {
        console.error(`[DB Insert Failed] ${file.name}:`, insertError);
      } else {
        console.log(`Database entry created for ${file.name}`);
      }

    } catch (error) {
      console.error(`[Processing Failed] ${file.name}:`, error);
    }
  }

  console.log(`Successfully uploaded ${uploadedUrls.length} out of ${files.length} files`);
  return uploadedUrls;
}

/**
 * Alternative: Upload to storage and return URLs for manual saving
 */
export async function uploadImagesToStorageAndGetUrls(listingId: string, files: File[]): Promise<string[]> {
  const bucketName = 'listing-images';
  const uploadedUrls: string[] = [];

  for (const file of files) {
    try {
      if (!file.type.startsWith('image/')) {
        console.error(`[Invalid File Type] ${file.name}: Not an image file`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        console.error(`[File Too Large] ${file.name}: Size exceeds 10MB`);
        continue;
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${listingId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error(`[Upload Failed] ${file.name}:`, uploadError);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      uploadedUrls.push(publicUrlData.publicUrl);
    } catch (error) {
      console.error(`[Processing Failed] ${file.name}:`, error);
    }
  }

  return uploadedUrls;
}
