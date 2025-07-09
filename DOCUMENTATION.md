# Code Documentation Guide

## Overview

This document provides comprehensive documentation for the Rentify Houses Kenya codebase, focusing on the listing service and image upload functionality.

## Architecture

### Service Layer (`/services`)

The service layer handles all backend interactions and business logic:

- **`listingService.ts`** - Core CRUD operations for property listings
- **`supabaseClient.ts`** - Database connection and configuration
- **`authService.ts`** - User authentication and authorization
- **`geminiService.ts`** - AI integration for content enhancement

### Utility Layer (`/utils`)

Utility functions for specific operations:

- **`imageUploadHelper.ts`** - File upload and storage management

### Data Flow

```
Frontend Components → Service Layer → Database/Storage
                   ↓
              Data Transformation
                   ↓
              Type-Safe Interfaces
```

## Documentation Standards

### JSDoc Comments

All functions use comprehensive JSDoc documentation:

```typescript
/**
 * Brief description of the function
 * 
 * Detailed explanation of what the function does,
 * including any important implementation details.
 * 
 * @param {Type} paramName - Description of parameter
 * @param {Type} [optionalParam] - Description of optional parameter
 * @returns {Type} Description of return value
 * 
 * @throws {Error} Description of when errors are thrown
 * 
 * @example
 * const result = await functionName(param1, param2);
 * console.log(result);
 * 
 * @since Version when function was added
 * @todo Future improvements or missing features
 */
```

### Inline Comments

- **Purpose Comments**: Explain why code exists
- **Process Comments**: Explain complex algorithms
- **Warning Comments**: Highlight important considerations
- **TODO Comments**: Mark future improvements

### Code Organization

#### Function Structure
1. **Input validation** - Check parameters and permissions
2. **Data transformation** - Convert between formats
3. **Business logic** - Core functionality
4. **Error handling** - Graceful failure management
5. **Response formatting** - Prepare data for consumers

#### Error Handling Pattern
```typescript
try {
  // Main logic
  const result = await operation();
  return result;
} catch (error) {
  console.error('[FunctionName] Operation failed:', error);
  throw error; // Re-throw for caller to handle
}
```

## Key Components Documentation

### 1. Listing Service (`listingService.ts`)

**Purpose**: Manages all property listing operations with full CRUD support.

**Key Functions**:
- `getListings()` - Fetch listings with filtering
- `getListingById()` - Retrieve single listing
- `createListing()` - Create new listing with images
- `updateListing()` - Modify existing listing
- `deleteListing()` - Remove listing
- `getAgentMetrics()` - Calculate agent statistics

**Data Transformation**:
- `fromDbFormat()` - Database → Frontend format
- `toDbFormat()` - Frontend → Database format
- `transformImages()` - Normalize image data

### 2. Image Upload Helper (`imageUploadHelper.ts`)

**Purpose**: Handles secure file uploads to Supabase Storage with validation.

**Key Functions**:
- `uploadImagesToStorageAndSaveMetadata()` - Full upload with DB metadata
- `uploadImagesToStorageAndGetUrls()` - Storage-only upload

**Features**:
- Authentication verification
- File type/size validation
- Unique filename generation
- Retry logic for failed uploads
- Progress tracking and logging

### 3. Data Types (`types.ts`)

**Purpose**: TypeScript interfaces ensuring type safety across the application.

**Key Types**:
- `PropertyListing` - Complete listing data structure
- `PropertyImage` - Image metadata with AI scan status
- `AgentMetrics` - Statistical data for agents
- `SearchFilters` - Query parameters for filtering

## Best Practices Implemented

### 1. Error Handling
- Graceful degradation on partial failures
- Detailed error logging for debugging
- User-friendly error messages
- Retry logic for network operations

### 2. Type Safety
- Strict TypeScript configuration
- Interface definitions for all data structures
- Type-only imports where appropriate
- Runtime type validation

### 3. Performance
- Efficient database queries with proper joins
- Conditional filter application
- Image optimization and validation
- Caching headers for uploaded files

### 4. Security
- Authentication verification for uploads
- File type validation
- Size limits to prevent abuse
- SQL injection prevention through parameterized queries

### 5. Maintainability
- Clear function naming and organization
- Comprehensive documentation
- Consistent code patterns
- Separation of concerns

## Code Examples

### Creating a New Listing
```typescript
const newListing = await listingService.createListing({
  title: 'Modern Apartment',
  description: 'Beautiful 2BR apartment...',
  price: 75000,
  bedrooms: 2,
  bathrooms: 1,
  location: {
    address: '123 Main St',
    county: 'Nairobi',
    neighborhood: 'Westlands'
  },
  amenities: ['parking', 'garden'],
  status: 'available',
  isFeatured: false,
  images: ['https://example.com/img1.jpg']
});
```

### Searching Listings
```typescript
const filteredListings = await listingService.getListings({
  bedrooms: 3,
  county: 'Nairobi',
  minPrice: 50000,
  maxPrice: 150000,
  location: 'Westlands'
});
```

### Uploading Images
```typescript
const fileInput = document.getElementById('images') as HTMLInputElement;
const files = Array.from(fileInput.files || []);
const urls = await uploadImagesToStorageAndSaveMetadata(listingId, files);
```

## Testing Documentation

Comprehensive test coverage includes:
- Unit tests for all service functions
- Integration tests for database operations
- Mock implementations for external dependencies
- Error scenario testing
- Edge case validation

See `TESTING.md` for detailed testing information.

## Future Improvements

### Planned Features
- [ ] Advanced image processing with AI
- [ ] Real-time analytics and metrics
- [ ] Enhanced search with full-text indexing
- [ ] Automated image optimization
- [ ] Bulk operations for agents

### Technical Debt
- [ ] Migrate legacy JSONB image storage
- [ ] Implement proper caching layer
- [ ] Add performance monitoring
- [ ] Enhance error recovery mechanisms

## Contributing

When adding new features or modifying existing code:

1. **Follow documentation standards** - Add comprehensive JSDoc comments
2. **Include examples** - Provide usage examples in documentation
3. **Write tests** - Ensure new code has test coverage
4. **Update types** - Keep TypeScript interfaces current
5. **Consider backwards compatibility** - Don't break existing API contracts

## Support

For questions about the codebase or documentation:
- Review existing documentation first
- Check test files for usage examples
- Consult TypeScript interfaces for data structures
- Review error logs for debugging information
