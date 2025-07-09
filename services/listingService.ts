/**
 * @fileoverview Listing Service - Handles property listing operations with Supabase integration
 * 
 * This service provides CRUD operations for property listings, including:
 * - Fetching listings with advanced filtering
 * - Creating new property listings with image support
 * - Updating existing listings
 * - Managing agent metrics and statistics
 * - Data transformation between frontend and database formats
 * 
 * @author Rentify Team
 * @version 1.0.0
 */

import { supabase } from './supabaseClient';
import type { PropertyListing, AgentMetrics, PropertyImage } from '../types';
import type { SearchFilters } from '../components/SearchBar';
import { UserRole } from '../types';

/**
 * Transforms various image data formats into a standardized PropertyImage array.
 * 
 * This function handles multiple image data sources:
 * - Images from the property_images table (with AI scan data)
 * - Legacy JSONB format images
 * - Simple URL strings
 * - Mixed format arrays
 * 
 * @param {any} images - Raw image data from database or user input
 * @returns {PropertyImage[]} Standardized array of PropertyImage objects
 * 
 * @example
 * // Property images table format
 * const dbImages = [{ id: '1', url: 'https://...', ai_scan: { status: 'clear' }}];
 * const transformed = transformImages(dbImages);
 * 
 * @example
 * // Legacy string array format
 * const legacyImages = ['https://image1.jpg', 'https://image2.jpg'];
 * const transformed = transformImages(legacyImages);
 */
// Helper function to transform images
const transformImages = (images: any): PropertyImage[] => {
  // Return empty array if no images provided
  if (!images) return [];
  
  // Handle array of images
  if (Array.isArray(images) && images.length > 0) {
    const firstImg = images[0];
    
    // Images from property_images table (with id, url, and ai_scan data)
    if (firstImg && (firstImg.id || firstImg.url)) {
      return images.map((img: any, index: number) => ({
        id: img.id || `img-${index}`,
        url: img.url,
        altText: undefined, // Alt text not currently stored in DB
        aiScanStatus: img.ai_scan?.status || 'pending' as const,
        aiScanReason: img.ai_scan?.reason || undefined
      }));
    }
    
    // Legacy JSONB format or mixed array handling
    return images.map((img: any, index: number) => {
      // Handle simple string URLs
      if (typeof img === 'string') {
        return {
          id: `img-${index}`,
          url: img,
          altText: undefined,
          aiScanStatus: 'pending' as const,
          aiScanReason: undefined
        };
      }
      // Handle object format (legacy or partial data)
      return {
        id: img.id || `img-${index}`,
        url: img.url || img,
        altText: img.altText || undefined,
        aiScanStatus: img.aiScanStatus || 'pending' as const,
        aiScanReason: img.aiScanReason || undefined
      };
    });
  }
  
  // Handle single image URL string
  if (typeof images === 'string') {
    return [{
      id: 'img-0',
      url: images,
      altText: undefined,
      aiScanStatus: 'pending' as const,
      aiScanReason: undefined
    }];
  }
  
  // Fallback for any other format
  return [];
};

/**
 * Converts frontend PropertyListing object to database format.
 * 
 * Maps camelCase property names to snake_case database column names
 * and handles data type conversions for storage.
 * 
 * @param {Partial<PropertyListing>} listing - Frontend listing object
 * @returns {object} Database-formatted object ready for insert/update
 * 
 * @example
 * const frontendListing = { areaSqFt: 1500, isFeatured: true };
 * const dbFormat = toDbFormat(frontendListing);
 * // Result: { area_sq_ft: 1500, is_featured: true }
 */
// Maps camelCase → snake_case before insert/update
const toDbFormat = (listing: Partial<PropertyListing>) => {
  // Create database object with snake_case properties
  const dbListing: any = {
    ...listing,
    // Convert camelCase to snake_case for database columns
    area_sq_ft: listing.areaSqFt,
    is_featured: listing.isFeatured,
    // Remove camelCase properties to avoid duplication
    areaSqFt: undefined,
    isFeatured: undefined,
  };

  // Handle images - convert PropertyImage[] to JSONB format for legacy support
  // Note: New implementation primarily uses property_images table
  if (listing.images && Array.isArray(listing.images)) {
    dbListing.images = listing.images.map(img => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      aiScanStatus: img.aiScanStatus,
      aiScanReason: img.aiScanReason
    }));
  }

  return dbListing;
};

/**
 * Converts database record to frontend PropertyListing format.
 * 
 * Maps snake_case database columns to camelCase frontend properties,
 * processes related data (agent, images), and handles data type conversions.
 * 
 * @param {any} listing - Raw database record from Supabase
 * @returns {PropertyListing} Frontend-formatted PropertyListing object
 * 
 * @example
 * const dbRecord = { 
 *   area_sq_ft: 1500, 
 *   is_featured: true,
 *   agent: { full_name: 'John Doe' }
 * };
 * const frontendListing = fromDbFormat(dbRecord);
 * // Result includes: { areaSqFt: 1500, isFeatured: true, agent: { name: 'John Doe' }}
 */
const fromDbFormat = (listing: any): PropertyListing => ({
  // Basic property information
  id: listing.id,
  title: listing.title,
  description: listing.description,
  price: listing.price,
  bedrooms: listing.bedrooms,
  bathrooms: listing.bathrooms,
  
  // Convert snake_case to camelCase with null fallbacks
  areaSqFt: listing.area_sq_ft ?? null,
  amenities: listing.amenities || [], // Ensure array even if null
  status: listing.status,
  isFeatured: listing.is_featured ?? false, // Default to false if null
  
  // Timestamp fields
  createdAt: listing.created_at,
  updatedAt: listing.updated_at,
  
  // Engagement metrics with safe defaults
  saves: listing.saves || 0,
  views: listing.views || 0,

  // Parse location JSON if stored as string, otherwise use as-is
  location: typeof listing.location === 'string'
    ? JSON.parse(listing.location)
    : listing.location,

  // Transform images using helper function
  images: transformImages(listing.images),

  // Transform agent data with comprehensive fallbacks
  agent: listing.agent
    ? {
        // Agent data from joined profiles table
        id: listing.agent.id,
        name: listing.agent.full_name, // Map database field to frontend field
        email: listing.agent.email,
        phoneNumber: listing.agent.phone_number || '',
        isVerifiedAgent: listing.agent.is_verified_agent || false,
        profilePictureUrl: listing.agent.profile_picture_url || '',
        role: UserRole.AGENT, // Set default role
        createdAt: '', // Not available in join, could be fetched separately if needed
      }
    : {
        // Fallback when agent data not available (shouldn't happen with proper joins)
        id: listing.agent_id,
        name: '',
        email: '',
        phoneNumber: '',
        isVerifiedAgent: false,
        profilePictureUrl: '',
        role: UserRole.AGENT,
        createdAt: '',
      }
});

/**
 * Retrieves property listings with optional filtering and search capabilities.
 * 
 * Supports multiple filter types:
 * - Agent-specific listings
 * - Bedroom count filtering
 * - County/location filtering
 * - Text search across title, description, and location fields
 * - Price range filtering (min/max)
 * 
 * @param {SearchFilters & { agentId?: string }} [filters] - Optional filters to apply
 * @param {string} [filters.agentId] - Filter by specific agent ID
 * @param {number} [filters.bedrooms] - Filter by number of bedrooms
 * @param {string} [filters.county] - Filter by county name
 * @param {string} [filters.location] - Text search across location fields
 * @param {number} [filters.minPrice] - Minimum price filter
 * @param {number} [filters.maxPrice] - Maximum price filter
 * @returns {Promise<PropertyListing[]>} Array of formatted property listings
 * 
 * @throws {Error} Database errors from Supabase
 * 
 * @example
 * // Get all listings
 * const allListings = await getListings();
 * 
 * @example
 * // Filter by bedrooms and price range
 * const filtered = await getListings({
 *   bedrooms: 3,
 *   minPrice: 50000,
 *   maxPrice: 150000
 * });
 * 
 * @example
 * // Search by location text
 * const searched = await getListings({
 *   location: 'Westlands'
 * });
 */
const getListings = async (filters?: SearchFilters & { agentId?: string }) => {
  // Build base query with related data
  let query = supabase
    .from('listings')
    .select(`
      *,
      agent:profiles (
        id,
        email,
        full_name,
        is_verified_agent,
        phone_number,
        profile_picture_url
      ),
      images:property_images (
        id,
        url,
        ai_scan
      )
    `)
    .order('created_at', { ascending: false }); // Most recent first

  // Apply filters conditionally to avoid unnecessary database operations
  
  // Filter by specific agent
  if (filters?.agentId) {
    query = query.eq('agent_id', filters.agentId);
  }

  // Filter by bedroom count (exact match)
  if (filters?.bedrooms) {
    query = query.eq('bedrooms', filters.bedrooms);
  }

  // Filter by county using JSON containment
  if (filters?.county) {
    // Query the location JSON field for county
    query = query.contains('location', { county: filters.county });
  }

  // Text search across multiple fields
  if (filters?.location) {
    // Search in title, description, and location fields
    // For location, we'll search in address and neighborhood fields of the JSON
    query = query.or(`title.ilike.%${filters.location}%,description.ilike.%${filters.location}%,location->>address.ilike.%${filters.location}%,location->>neighborhood.ilike.%${filters.location}%`);
  }

  // Price range filtering
  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }

  // Execute query and handle errors
  const { data, error } = await query;
  if (error) throw error;

  // Transform all records to frontend format
  return data.map(fromDbFormat);
};

/**
 * Retrieves a single property listing by its ID.
 * 
 * Includes all related data (agent information, images) and returns
 * a fully populated PropertyListing object.
 * 
 * @param {string} id - The unique identifier of the listing
 * @returns {Promise<PropertyListing>} Complete property listing with related data
 * 
 * @throws {Error} Database errors or if listing not found
 * 
 * @example
 * const listing = await getListingById('123e4567-e89b-12d3-a456-426614174000');
 * console.log(listing.title, listing.agent.name);
 */
const getListingById = async (id: string) => {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      agent:profiles (
        id,
        email,
        full_name,
        is_verified_agent,
        phone_number,
        profile_picture_url
      ),
      images:property_images (
        id,
        url,
        ai_scan
      )
    `)
    .eq('id', id)
    .single(); // Expect exactly one result

  if (error) throw error;
  return fromDbFormat(data);
};

/**
 * Creates a new property listing with optional image URLs.
 * 
 * This function:
 * 1. Converts the listing to database format
 * 2. Sets status to 'pending_verification' for new listings
 * 3. Inserts the main listing record
 * 4. Optionally inserts image records into property_images table
 * 5. Returns the complete listing with all related data
 * 
 * @param {Omit<PropertyListing, 'id' | 'createdAt' | 'updatedAt' | 'agent' | 'views' | 'saves'> & { images?: string[] }} listing - New listing data
 * @param {string[]} [listing.images] - Array of image URLs to associate with the listing
 * @returns {Promise<PropertyListing>} The created listing with generated ID and related data
 * 
 * @throws {Error} Database errors during listing or image creation
 * 
 * @example
 * const newListing = await createListing({
 *   title: 'Beautiful Apartment',
 *   description: 'Spacious 2BR apartment...',
 *   price: 75000,
 *   bedrooms: 2,
 *   bathrooms: 1,
 *   location: { address: '123 Main St', county: 'Nairobi' },
 *   amenities: ['parking', 'garden'],
 *   status: 'available',
 *   isFeatured: false,
 *   images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg']
 * });
 */
const createListing = async (
  listing: Omit<PropertyListing, 'id' | 'createdAt' | 'updatedAt' | 'agent' | 'views' | 'saves'> & { images?: string[] }
): Promise<PropertyListing> => {
  // Convert to database format and set initial status
  const listingToInsert = {
    ...toDbFormat(listing),
    status: 'pending_verification', // All new listings require verification
  };

  // Remove images from main insert - they go in separate table
  delete listingToInsert.images;

  // Insert main listing record
  const { data, error } = await supabase
    .from('listings')
    .insert(listingToInsert)
    .select(`
      *,
      agent:profiles (
        id,
        email,
        full_name,
        is_verified_agent,
        phone_number,
        profile_picture_url
      )
    `)
    .single();

  if (error) {
    console.error('[createListing] Supabase error:', error);
    throw error;
  }

  // Insert images into property_images table if provided
  if (listing.images && listing.images.length > 0) {
    const imagesToInsert = listing.images.map((url) => ({
      listing_id: data.id,
      url,
      ai_scan: { status: 'pending', scanned_at: null } // Initialize AI scan status
    }));

    const { error: imageError } = await supabase
      .from('property_images')
      .insert(imagesToInsert);

    if (imageError) {
      console.error('[createListing] Failed to insert images:', imageError);
      // Note: We don't throw here to avoid failing the entire listing creation
      // The listing exists but images failed - could be handled in UI
    }
  }

  // Fetch the complete listing with images for return
  return await getListingById(data.id);
};

/**
 * Updates an existing property listing.
 * 
 * Updates the main listing record with new data and automatically
 * sets the updated_at timestamp. Does not handle image updates
 * (images should be managed separately through image upload functions).
 * 
 * @param {string} id - The ID of the listing to update
 * @param {Partial<Omit<PropertyListing, 'id' | 'agent'>>} updates - Fields to update
 * @returns {Promise<PropertyListing>} The updated listing with all related data
 * 
 * @throws {Error} Database errors or if listing not found
 * 
 * @example
 * const updated = await updateListing('123...', {
 *   title: 'Updated Title',
 *   price: 85000,
 *   status: 'available'
 * });
 */
const updateListing = async (
  id: string,
  updates: Partial<Omit<PropertyListing, 'id' | 'agent'>>
): Promise<PropertyListing> => {
  // Convert updates to database format and add timestamp
  const updatesToSend = {
    ...toDbFormat(updates),
    updated_at: new Date().toISOString(), // Ensure updated timestamp
  };

  const { data, error } = await supabase
    .from('listings')
    .update(updatesToSend)
    .eq('id', id)
    .select(`
      *,
      agent:profiles (
        id,
        email,
        full_name,
        is_verified_agent,
        phone_number,
        profile_picture_url
      )
    `)
    .single();

  if (error) throw error;
  return fromDbFormat(data);
};

/**
 * Deletes a property listing by ID.
 * 
 * This will also cascade delete related records (images, etc.)
 * based on database foreign key constraints.
 * 
 * @param {string} id - The ID of the listing to delete
 * @returns {Promise<void>}
 * 
 * @throws {Error} Database errors or if listing not found
 * 
 * @example
 * await deleteListing('123e4567-e89b-12d3-a456-426614174000');
 */
const deleteListing = async (id: string) => {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
};

/**
 * Calculates and returns metrics for a specific agent.
 * 
 * Aggregates listing data to provide insights into agent performance:
 * - Total number of listings
 * - Number of active (available) listings
 * - View and save counts (currently placeholder)
 * - Average rating (currently placeholder)
 * 
 * @param {string} agentId - The ID of the agent to calculate metrics for
 * @returns {Promise<AgentMetrics>} Aggregated metrics for the agent
 * 
 * @throws {Error} Database errors during metrics calculation
 * 
 * @example
 * const metrics = await getAgentMetrics('agent-123');
 * console.log(`Agent has ${metrics.totalListings} listings, ${metrics.activeListings} active`);
 * 
 * @todo Implement actual view/save counting from analytics tables
 * @todo Add average rating calculation from reviews
 */
const getAgentMetrics = async (agentId: string): Promise<AgentMetrics> => {
  // Fetch all listings for the agent (only need status for metrics)
  const { data, error } = await supabase
    .from('listings')
    .select('status')
    .eq('agent_id', agentId);

  if (error) {
    console.error('[getAgentMetrics] Supabase error:', error);
    throw error;
  }

  // Calculate basic metrics from listing data
  const totalListings = data.length;
  const activeListings = data.filter((d) => d.status === 'available').length;

  return {
    totalListings,
    activeListings,
    // TODO: Implement these metrics when analytics tables are available
    totalViews: 0,
    totalSaves: 0,
    totalInquiries: 0,
    averageRating: undefined, // Will be calculated from reviews table
  };
};

/**
 * Exported listing service object containing all CRUD operations and utilities.
 * 
 * This service provides a complete interface for managing property listings
 * with proper error handling, data transformation, and relationship management.
 * 
 * @namespace listingService
 */
export const listingService = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getAgentMetrics,
};
