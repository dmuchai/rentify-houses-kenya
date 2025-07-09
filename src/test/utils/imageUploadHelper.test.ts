import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadImagesToStorageAndSaveMetadata, uploadImagesToStorageAndGetUrls } from '../../../utils/imageUploadHelper';

// Mock the Supabase client
vi.mock('../../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(),
    })),
  },
}));

// Add to global for consistency with setup
declare global {
  var mockSupabase: any;
}

global.mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
    })),
  },
  from: vi.fn(() => ({
    insert: vi.fn(),
  })),
};

describe('imageUploadHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImagesToStorageAndSaveMetadata', () => {
    const mockFiles = [
      new File(['mock content 1'], 'image1.jpg', { type: 'image/jpeg' }),
      new File(['mock content 2'], 'image2.png', { type: 'image/png' }),
    ];

    it('should upload multiple images successfully with metadata', async () => {
      const mockAuthResult = { data: { user: { email: 'test@example.com' } }, error: null };
      const mockStorageUploadResult = { data: { path: 'test-path' }, error: null };
      const mockPublicUrlResult = { data: { publicUrl: 'https://example.com/test-path' } };
      const mockDbInsertResult = { error: null };

      global.mockSupabase.auth.getUser.mockResolvedValue(mockAuthResult);
      global.mockSupabase.storage.from().upload.mockResolvedValue(mockStorageUploadResult);
      global.mockSupabase.storage.from().getPublicUrl.mockReturnValue(mockPublicUrlResult);
      global.mockSupabase.from().insert.mockResolvedValue(mockDbInsertResult);

      const result = await uploadImagesToStorageAndSaveMetadata('listing-123', mockFiles);

      expect(result).toHaveLength(2);
      expect(result[0]).toContain('https://example.com');
      expect(global.mockSupabase.storage.from).toHaveBeenCalledWith('listing-images');
      expect(global.mockSupabase.from).toHaveBeenCalledWith('property_images');
    });

    it('should handle authentication errors', async () => {
      const mockAuthError = new Error('Not authenticated');
      global.mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockAuthError,
      });

      await expect(
        uploadImagesToStorageAndSaveMetadata('listing-123', mockFiles)
      ).rejects.toThrow('User must be authenticated to upload images');
    });

    it('should handle upload errors gracefully', async () => {
      const mockAuthResult = { data: { user: { email: 'test@example.com' } }, error: null };
      const mockError = new Error('Upload failed');
      
      global.mockSupabase.auth.getUser.mockResolvedValue(mockAuthResult);
      global.mockSupabase.storage.from().upload.mockResolvedValue({
        data: null,
        error: mockError,
      });

      // Should try alternative upload method
      const result = await uploadImagesToStorageAndSaveMetadata('listing-123', mockFiles);
      
      // Depending on implementation, might return empty array or partial results
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty file list', async () => {
      const mockAuthResult = { data: { user: { email: 'test@example.com' } }, error: null };
      global.mockSupabase.auth.getUser.mockResolvedValue(mockAuthResult);

      const result = await uploadImagesToStorageAndSaveMetadata('listing-123', []);

      expect(result).toEqual([]);
    });

    it('should filter out non-image files', async () => {
      const mockAuthResult = { data: { user: { email: 'test@example.com' } }, error: null };
      const mockStorageUploadResult = { data: { path: 'test-path' }, error: null };
      const mockPublicUrlResult = { data: { publicUrl: 'https://example.com/test-path' } };
      const mockDbInsertResult = { error: null };

      const mixedFiles = [
        new File(['mock content 1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['mock content 2'], 'document.pdf', { type: 'application/pdf' }),
      ];

      global.mockSupabase.auth.getUser.mockResolvedValue(mockAuthResult);
      global.mockSupabase.storage.from().upload.mockResolvedValue(mockStorageUploadResult);
      global.mockSupabase.storage.from().getPublicUrl.mockReturnValue(mockPublicUrlResult);
      global.mockSupabase.from().insert.mockResolvedValue(mockDbInsertResult);

      const result = await uploadImagesToStorageAndSaveMetadata('listing-123', mixedFiles);

      // Should only upload the image file
      expect(result).toHaveLength(1);
    });
  });

  describe('uploadImagesToStorageAndGetUrls', () => {
    const mockFiles = [
      new File(['mock content 1'], 'image1.jpg', { type: 'image/jpeg' }),
    ];

    it('should upload images and return URLs without saving metadata', async () => {
      const mockStorageUploadResult = { data: { path: 'test-path' }, error: null };
      const mockPublicUrlResult = { data: { publicUrl: 'https://example.com/test-path' } };

      global.mockSupabase.storage.from().upload.mockResolvedValue(mockStorageUploadResult);
      global.mockSupabase.storage.from().getPublicUrl.mockReturnValue(mockPublicUrlResult);

      const result = await uploadImagesToStorageAndGetUrls('listing-123', mockFiles);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('https://example.com');
      expect(global.mockSupabase.storage.from).toHaveBeenCalledWith('listing-images');
      // Should not insert into database
      expect(global.mockSupabase.from).not.toHaveBeenCalledWith('property_images');
    });

    it('should handle upload errors without metadata insertion', async () => {
      const mockError = new Error('Upload failed');
      global.mockSupabase.storage.from().upload.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await uploadImagesToStorageAndGetUrls('listing-123', mockFiles);

      // Should return empty array on failure
      expect(result).toEqual([]);
    });

    it('should validate file size limits', async () => {
      // Create a mock large file (over 10MB)
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

      const result = await uploadImagesToStorageAndGetUrls('listing-123', [largeFile]);

      // Should skip the large file
      expect(result).toEqual([]);
    });
  });
});
