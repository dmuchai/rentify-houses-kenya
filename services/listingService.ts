import { supabase } from './supabaseClient';
import { PropertyListing, AgentMetrics } from '../types';

// Maps camelCase → snake_case before insert/update
const toDbFormat = (listing: Partial<PropertyListing>) => ({
  ...listing,
  area_sq_ft: listing.areaSqFt,
  is_featured: listing.isFeatured,
  areaSqFt: undefined,
  isFeatured: undefined,
});

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
  rating: listing.rating || null,

  location: typeof listing.location === 'string'
    ? JSON.parse(listing.location)
    : listing.location,

  images: (listing.images || []).map((img: { url: string }) => img.url),

  agent: listing.agent
    ? {
        id: listing.agent.id,
        name: listing.agent.full_name,
        email: listing.agent.email,
        phoneNumber: listing.agent.phone_number || '',
        isVerifiedAgent: listing.agent.is_verified_agent || false,
        profilePictureUrl: listing.agent.profile_picture_url || '',
        role: 'agent',
        createdAt: '',
      }
    : {
        id: listing.agent_id,
        name: '',
        email: '',
        phoneNumber: '',
        isVerifiedAgent: false,
        profilePictureUrl: '',
        role: 'agent',
        createdAt: '',
      }
});

const getListings = async (filters?: { agentId?: string }) => {
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
      )
    `)
    .order('created_at', { ascending: false });

  if (filters?.agentId) {
    query = query.eq('agent_id', filters.agentId);
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
        url
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return fromDbFormat(data);
};

const createListing = async (
  listing: Omit<PropertyListing, 'id' | 'createdAt' | 'updatedAt' | 'agent' | 'views' | 'images' | 'saves'>
): Promise<PropertyListing> => {
  const listingToInsert = {
    ...toDbFormat(listing),
    status: 'pending_verification',
  };

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

// Insert associated images if any were provided
  if (listing.images && listing.images.length > 0) {
    const imagesToInsert = listing.images.map((url) => ({
      listing_id: insertedListing.id,
      url,
    }));

    const { error: imageError } = await supabase
      .from('property_images')
      .insert(imagesToInsert);

    if (imageError) {
      console.error('[createListing] Failed to insert images:', imageError);
      // Optional: throw or just warn
    }
  }
  return fromDbFormat(data);
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
    averageRating: null,
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
