/**
 * @fileoverview Image Upload Helper - Handles file uploads to Supabase Storage
 * 
 * This module provides utilities for uploading property images to Supabase Storage
 * and managing image metadata in the database. It includes:
 * - File validation (type, size)
 * - Secure authenticated uploads
 * - Metadata persistence in property_images table
 * - Error handling and logging
 * - Unique filename generation
 * 
 * @author Rentify Team
 * @version 1.0.0
 */

import { supabase } from '../services/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * Maximum file size allowed for image uploads (10MB)
 * @constant {number}
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Supabase storage bucket name for listing images
 * @constant {string}
 */
const STORAGE_BUCKET = 'listing-images';

/**
 * Supported image MIME types
 * @constant {string[]}
 */
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Uploads image files to Supabase Storage and saves metadata to property_images table.
 * 
 * This function provides complete image upload functionality:
 * 1. Validates user authentication
 * 2. Validates each file (type, size)
 * 3. Generates unique filenames to prevent conflicts
 * 4. Uploads to Supabase Storage with retry logic
 * 5. Saves metadata to property_images table with AI scan status
 * 6. Returns array of public URLs for successful uploads
 * 
 * @param {string} listingId - The ID of the listing to associate images with
 * @param {File[]} files - Array of image files to upload
 * @returns {Promise<string[]>} Array of public URLs for successfully uploaded images
 * 
 * @throws {Error} If user is not authenticated
 * 
 * @example
 * const fileInput = document.getElementById('images');
 * const files = Array.from(fileInput.files);
 * const urls = await uploadImagesToStorageAndSaveMetadata('listing-123', files);
 * console.log('Uploaded images:', urls);
 * 
 * @example
 * // Handle upload errors gracefully
 * try {
 *   const urls = await uploadImagesToStorageAndSaveMetadata(listingId, files);
 *   // Some files may have failed - check array length vs input length
 *   if (urls.length < files.length) {
 *     console.warn('Some uploads failed');
 *   }
 * } catch (error) {
 *   console.error('Upload failed:', error);
 * }
 */
export async function uploadImagesToStorageAndSaveMetadata(listingId: string, files: File[]): Promise<string[]> {
  const bucketName = 'listing-images'; // Supabase storage bucket name
  const uploadedUrls: string[] = [];

  // Verify user authentication before proceeding
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('User not authenticated for upload:', authError);
    throw new Error('User must be authenticated to upload images');
  }

  console.log('Authenticated user uploading:', user.email);

  // Process each file individually to handle partial failures gracefully
  for (const file of files) {
    try {
      // File type validation - only allow image files
      if (!file.type.startsWith('image/')) {
        console.error(`[Invalid File Type] ${file.name}: Not an image file`);
        continue; // Skip this file, continue with others
      }

      // File size validation - prevent uploads over 10MB
      if (file.size > 10 * 1024 * 1024) {
        console.error(`[File Too Large] ${file.name}: Size exceeds 10MB`);
        continue; // Skip this file, continue with others
      }

      // Generate unique filename to prevent conflicts
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${listingId}/${fileName}`; // Organize by listing ID

      console.log(`Uploading ${file.name} to ${filePath}...`);

      // Primary upload attempt
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      // Handle upload failures with retry logic
      if (uploadError) {
        console.error(`[Upload Failed] ${file.name}:`, uploadError);
        console.error('Upload error details:', {
          message: uploadError.message,
          name: uploadError.name,
          stack: uploadError.stack
        });
        
        // Retry with upsert option (overwrites if exists)
        console.log('Trying alternative upload method...');
        const { error: altUploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            upsert: true // Allow overwriting existing files
          });
          
        if (altUploadError) {
          console.error(`[Alternative Upload Failed] ${file.name}:`, altUploadError);
          continue; // Skip this file after both attempts failed
        } else {
          console.log('Alternative upload succeeded!');
        }
      }

      console.log(`Upload successful for ${file.name}`);

      // Generate public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      uploadedUrls.push(publicUrl);

      // Save image metadata to database for tracking and AI processing
      const { error: insertError } = await supabase.from('property_images').insert([
        {
          listing_id: listingId,
          url: publicUrl,
          ai_scan: { 
            status: 'pending', 
            scanned_at: new Date().toISOString() // Track when scan was initiated
          }
        },
      ]);

      if (insertError) {
        console.error(`[DB Insert Failed] ${file.name}:`, insertError);
        // Note: File uploaded successfully but metadata save failed
        // Could implement cleanup or retry logic here
      } else {
        console.log(`Database entry created for ${file.name}`);
      }

    } catch (error) {
      console.error(`[Processing Failed] ${file.name}:`, error);
      // Continue processing other files even if one fails completely
    }
  }

  console.log(`Successfully uploaded ${uploadedUrls.length} out of ${files.length} files`);
  return uploadedUrls;
}

/**
 * Uploads images to storage and returns URLs without saving metadata.
 * 
 * This is a lighter-weight version that only handles storage upload
 * without database metadata. Useful for temporary uploads or when
 * metadata will be handled separately.
 * 
 * @param {string} listingId - The ID of the listing (used for file organization)
 * @param {File[]} files - Array of image files to upload
 * @returns {Promise<string[]>} Array of public URLs for successfully uploaded images
 * 
 * @example
 * // Quick upload without metadata
 * const urls = await uploadImagesToStorageAndGetUrls('listing-123', files);
 * // Handle metadata separately if needed
 * await saveImageMetadata(listingId, urls);
 */
export async function uploadImagesToStorageAndGetUrls(listingId: string, files: File[]): Promise<string[]> {
  const bucketName = 'listing-images';
  const uploadedUrls: string[] = [];

  // Process each file for storage upload only
  for (const file of files) {
    try {
      // Basic file validation
      if (!file.type.startsWith('image/')) {
        console.error(`[Invalid File Type] ${file.name}: Not an image file`);
        continue;
      }

      // Size validation
      if (file.size > 10 * 1024 * 1024) {
        console.error(`[File Too Large] ${file.name}: Size exceeds 10MB`);
        continue;
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${listingId}/${fileName}`;

      // Upload to storage with optimized settings
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600', // Cache for 1 hour
          upsert: false, // Don't overwrite existing files
          contentType: file.type // Ensure correct MIME type
        });

      if (uploadError) {
        console.error(`[Upload Failed] ${file.name}:`, uploadError);
        continue; // Skip failed uploads
      }

      // Generate and store public URL
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
