import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listingService } from '../../../services/listingService';

// Mock helper functions for testing
const mockDb = {
  getListings: vi.fn(),
  getListingById: vi.fn(),
  createListing: vi.fn(),
  updateListing: vi.fn(),
  deleteListing: vi.fn(),
  getAgentMetrics: vi.fn()
};

describe('listingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getListings', () => {
    it('should fetch listings without filters', async () => {
      const mockListings = [
        {
          id: '1',
          title: 'Test Property',
          price: 100000,
          bedrooms: 3,
          bathrooms: 2,
          area_sq_ft: 1500,
          status: 'available',
          location: { county: 'Nairobi' },
          agent: { full_name: 'John Doe' },
          images: []
        }
      ];

      global.mockSupabase.from().select().order().mockResolvedValue({
        data: mockListings,
        error: null
      });

      const result = await listingService.getListings();

      expect(global.mockSupabase.from).toHaveBeenCalledWith('listings');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Property');
    });

    it('should apply bedroom filter', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      await listingService.getListings({ bedrooms: 3 });

      expect(mockQuery.eq).toHaveBeenCalledWith('bedrooms', 3);
    });

    it('should apply county filter', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        contains: vi.fn().mockResolvedValue({ data: [], error: null })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      await listingService.getListings({ county: 'Nairobi' });

      expect(mockQuery.contains).toHaveBeenCalledWith('location', { county: 'Nairobi' });
    });

    it('should apply location search filter', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        or: vi.fn().mockResolvedValue({ data: [], error: null })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      await listingService.getListings({ location: 'Westlands' });

      expect(mockQuery.or).toHaveBeenCalledWith(
        'title.ilike.%Westlands%,description.ilike.%Westlands%,location->>address.ilike.%Westlands%,location->>neighborhood.ilike.%Westlands%'
      );
    });

    it('should apply price range filters', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockResolvedValue({ data: [], error: null })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      await listingService.getListings({ minPrice: 50000, maxPrice: 150000 });

      expect(mockQuery.gte).toHaveBeenCalledWith('price', 50000);
      expect(mockQuery.lte).toHaveBeenCalledWith('price', 150000);
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      global.mockSupabase.from().select().order().mockResolvedValue({
        data: null,
        error: mockError
      });

      await expect(listingService.getListings()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getListingById', () => {
    it('should fetch a single listing by id', async () => {
      const mockListing = {
        id: '1',
        title: 'Test Property',
        price: 100000,
        area_sq_ft: 1500,
        location: { county: 'Nairobi' },
        agent: { full_name: 'John Doe' },
        images: []
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockListing, error: null })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      const result = await listingService.getListingById('1');

      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(mockQuery.single).toHaveBeenCalled();
      expect(result.title).toBe('Test Property');
    });

    it('should handle not found errors', async () => {
      const mockError = new Error('No rows returned');
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      await expect(listingService.getListingById('nonexistent')).rejects.toThrow('No rows returned');
    });
  });

  describe('createListing', () => {
    const mockNewListing = {
      title: 'New Property',
      description: 'A test property',
      price: 120000,
      bedrooms: 4,
      bathrooms: 3,
      areaSqFt: 1800,
      amenities: ['parking'],
      status: 'available' as const,
      isFeatured: false,
      location: {
        address: '123 Test St',
        neighborhood: 'Test Area',
        county: 'Nairobi'
      },
      images: [] as any[] // This satisfies the function signature
    };

    it('should create a new listing', async () => {
      const createdListing = {
        id: '2',
        title: 'New Property',
        area_sq_ft: 1800,
        agent: { full_name: 'Agent Name' }
      };

      const insertMockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdListing, error: null })
      };

      const getMockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdListing, error: null })
      };

      global.mockSupabase.from
        .mockReturnValueOnce(insertMockQuery)
        .mockReturnValueOnce(getMockQuery);

      const result = await listingService.createListing(mockNewListing);

      expect(insertMockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Property',
          area_sq_ft: 1800,
          status: 'pending_verification'
        })
      );
      expect(result.title).toBe('New Property');
    });

    it('should handle creation errors', async () => {
      const mockError = new Error('Creation failed');
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      await expect(listingService.createListing(mockNewListing)).rejects.toThrow('Creation failed');
    });
  });

  describe('updateListing', () => {
    it('should update a listing', async () => {
      const updates = { title: 'Updated Property', price: 110000 };
      const updatedListing = {
        id: '1',
        title: 'Updated Property',
        price: 110000,
        agent: { full_name: 'Agent' }
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedListing, error: null })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      const result = await listingService.updateListing('1', updates);

      expect(mockQuery.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Property',
          price: 110000,
          updated_at: expect.any(String)
        })
      );
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
      expect(result.title).toBe('Updated Property');
    });
  });

  describe('deleteListing', () => {
    it('should delete a listing', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      await listingService.deleteListing('1');

      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should handle deletion errors', async () => {
      const mockError = new Error('Deletion failed');
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: mockError })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      await expect(listingService.deleteListing('1')).rejects.toThrow('Deletion failed');
    });
  });

  describe('getAgentMetrics', () => {
    it('should calculate agent metrics correctly', async () => {
      const mockData = [
        { status: 'available' },
        { status: 'available' },
        { status: 'pending_verification' },
        { status: 'rented' }
      ];
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      const result = await listingService.getAgentMetrics('agent-1');

      expect(mockQuery.select).toHaveBeenCalledWith('status');
      expect(mockQuery.eq).toHaveBeenCalledWith('agent_id', 'agent-1');
      expect(result).toEqual({
        totalListings: 4,
        activeListings: 2,
        totalViews: 0,
        totalSaves: 0,
        totalInquiries: 0,
        averageRating: undefined
      });
    });

    it('should handle empty metrics', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      const result = await listingService.getAgentMetrics('agent-1');

      expect(result.totalListings).toBe(0);
      expect(result.activeListings).toBe(0);
    });

    it('should handle metrics errors', async () => {
      const mockError = new Error('Metrics query failed');
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: mockError })
      };
      global.mockSupabase.from.mockReturnValue(mockQuery);

      await expect(listingService.getAgentMetrics('agent-1')).rejects.toThrow('Metrics query failed');
    });
  });
});
