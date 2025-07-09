import { supabase } from '../services/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads image files to Supabase Storage and saves their metadata in the `property_images` table.
 * @param listingId - The ID of the listing to associate images with.
 * @param files - Array of image files.
 */
export async function uploadImagesToStorageAndSaveMetadata(listingId: string, files: File[]) {
  const bucketName = 'listing-images';

  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${listingId}/${fileName}`;

    // 1. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (uploadError) {
      console.error(`[Upload Failed] ${file.name}:`, uploadError);
      continue;
    }

    // 2. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    // 3. Save metadata to property_images table
    const { error: insertError } = await supabase.from('property_images').insert([
      {
        listing_id: listingId,
        url: publicUrl,
        alt_text: file.name,
      },
    ]);

    if (insertError) {
      console.error(`[DB Insert Failed] ${file.name}:`, insertError);
    }
  }
}
