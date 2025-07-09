import { supabase } from './supabaseClient';
import { PropertyListing, AgentMetrics, UserRole } from '../types';
import { SearchFilters } from '../components/SearchBar';

// Maps camelCase → snake_case before insert/update
const toDbFormat = (listing: Partial<PropertyListing>) => {
  const dbListing: any = {
    ...listing,
    area_sq_ft: listing.areaSqFt,
    is_featured: listing.isFeatured,
    areaSqFt: undefined,
    isFeatured: undefined,
  };

  // Handle images - convert PropertyImage[] to JSONB format
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

// Maps Supabase snake_case → frontend camelCase
const fromDbFormat = (listing: any): PropertyListing => ({
  id: listing.id,
  title: listing.title,
  description: listing.description,
  price: listing.price,
  bedrooms: listing.bedrooms,
  bathrooms: listing.bathrooms,
  areaSqFt: listing.area_sq_ft ?? null,
  amenities: listing.amenities || [],
  status: listing.status,
  isFeatured: listing.is_featured ?? false,
  createdAt: listing.created_at,
  updatedAt: listing.updated_at,
  saves: listing.saves || 0,
  views: listing.views || 0,

  location: typeof listing.location === 'string'
    ? JSON.parse(listing.location)
    : listing.location,

  images: (() => {
    // Check if we have images from property_images table (relational)
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
      // Check if the first item has an 'id' property (from property_images table)
      const firstImg = listing.images[0];
      if (firstImg && (firstImg.id || firstImg.url)) {
        return listing.images.map((img: any, index: number) => ({
          id: img.id || `img-${index}`,
          url: img.url,
          altText: undefined,
          aiScanStatus: img.ai_scan?.status || 'pending' as const,
          aiScanReason: img.ai_scan?.reason || undefined
        }));
      }
    }
    
    // Check for JSONB images (legacy format)
    if (listing.images && Array.isArray(listing.images)) {
      return listing.images.map((img: any, index: number) => {
        // Handle string URLs
        if (typeof img === 'string') {
          return {
            id: `img-${index}`,
            url: img,
            altText: undefined,
            aiScanStatus: 'pending' as const,
            aiScanReason: undefined
          };
        }
        // Handle image objects
        return {
          id: img.id || `img-${index}`,
          url: img.url || img,
          altText: img.altText || undefined,
          aiScanStatus: img.aiScanStatus || 'pending' as const,
          aiScanReason: img.aiScanReason || undefined
        };
      });
    }
    
    // Handle single image URL as string
    if (typeof listing.images === 'string') {
      return [{
        id: 'img-0',
        url: listing.images,
        altText: undefined,
        aiScanStatus: 'pending' as const,
        aiScanReason: undefined
      }];
    }
    
    return [];
  })(),

  agent: listing.agent
    ? {
        id: listing.agent.id,
        name: listing.agent.full_name,
        email: listing.agent.email,
        phoneNumber: listing.agent.phone_number || '',
        isVerifiedAgent: listing.agent.is_verified_agent || false,
        profilePictureUrl: listing.agent.profile_picture_url || '',
        role: UserRole.AGENT,
        createdAt: '',
      }
    : {
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

const getListings = async (filters?: SearchFilters & { agentId?: string }) => {
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
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.agentId) {
    query = query.eq('agent_id', filters.agentId);
  }

  if (filters?.bedrooms) {
    query = query.eq('bedrooms', filters.bedrooms);
  }

  if (filters?.county) {
    // Query the location JSON field for county
    query = query.contains('location', { county: filters.county });
  }

  if (filters?.location) {
    // Search in title, description, and location fields
    // For location, we'll search in address and neighborhood fields of the JSON
    query = query.or(`title.ilike.%${filters.location}%,description.ilike.%${filters.location}%,location->>address.ilike.%${filters.location}%,location->>neighborhood.ilike.%${filters.location}%`);
  }

  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map(fromDbFormat);
};

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
    .single();

  if (error) throw error;
  
  // Debug: Log the raw data to see image structure
  console.log('Raw listing data:', data);
  console.log('Raw images data:', data.images);
  
  const result = fromDbFormat(data);
  console.log('Formatted listing images:', result.images);
  
  return result;
};

const createListing = async (
  listing: Omit<PropertyListing, 'id' | 'createdAt' | 'updatedAt' | 'agent' | 'views' | 'saves'> & { images?: string[] }
): Promise<PropertyListing> => {
  const listingToInsert = {
    ...toDbFormat(listing),
    status: 'pending_verification',
  };

  // Don't store images in JSONB column - use property_images table instead
  delete listingToInsert.images;

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
      ai_scan: { status: 'pending', scanned_at: null }
    }));

    const { error: imageError } = await supabase
      .from('property_images')
      .insert(imagesToInsert);

    if (imageError) {
      console.error('[createListing] Failed to insert images:', imageError);
    }
  }

  // Fetch the complete listing with images
  return await getListingById(data.id);
};

const updateListing = async (
  id: string,
  updates: Partial<Omit<PropertyListing, 'id' | 'agent'>>
): Promise<PropertyListing> => {
  const updatesToSend = {
    ...toDbFormat(updates),
    updated_at: new Date().toISOString(),
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

const deleteListing = async (id: string) => {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
};

const getAgentMetrics = async (agentId: string): Promise<AgentMetrics> => {
  const { data, error } = await supabase
    .from('listings')
    .select('status')
    .eq('agent_id', agentId);

  if (error) {
    console.error('[getAgentMetrics] Supabase error:', error);
    throw error;
  }

  const totalListings = data.length;
  const activeListings = data.filter((d) => d.status === 'available').length;

  return {
    totalListings,
    activeListings,
    totalViews: 0,
    totalSaves: 0,
    totalInquiries: 0,
    averageRating: undefined,
  };
};

export const listingService = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getAgentMetrics,
};
