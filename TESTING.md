# Comprehensive Testing Documentation

## Test Structure

### 1. Test Setup (`src/test/setup.ts`)
- Configures Vitest with React Testing Library
- Sets up global Supabase mocks for all tests
- Provides isolated testing environment

### 2. Listing Service Tests (`src/test/services/listingService.test.ts`)
- **getListings()** - Tests search filtering, database queries, error handling
- **getListingById()** - Tests single listing retrieval and error cases
- **createListing()** - Tests listing creation with/without images
- **updateListing()** - Tests listing updates and error handling
- **deleteListing()** - Tests listing deletion and error cases
- **getAgentMetrics()** - Tests metrics calculation and aggregation

### 3. Image Upload Helper Tests (`src/test/utils/imageUploadHelper.test.ts`)
- **uploadImagesToStorageAndSaveMetadata()** - Tests full upload pipeline with metadata
- **uploadImagesToStorageAndGetUrls()** - Tests storage-only upload without metadata
- Authentication checks, file validation, error handling

### 4. Data Transformation Tests (`src/test/services/listingTransformations.test.ts`)
- Placeholder for testing helper functions (transformImages, toDbFormat, fromDbFormat)
- These functions are internal and tested through the main service API

### 5. Setup Verification Test (`src/test/setup.test.ts`)
- Basic test to ensure testing infrastructure works
- Verifies global mock availability

## Test Coverage

### Core Functionality Tested:
✅ Search filters (bedrooms, county, location, price range, agent)
✅ CRUD operations (Create, Read, Update, Delete)
✅ Error handling and edge cases
✅ Database query building
✅ Image upload and storage
✅ Authentication checks
✅ File validation (type, size)
✅ Agent metrics calculation

### Mock Strategy:
- **Supabase Client**: Fully mocked with method chaining support
- **File Objects**: Created using browser File API
- **Database Responses**: Mocked success/error scenarios
- **Authentication**: Mocked user states

### Test Organization:
- **Unit Tests**: Individual function testing
- **Integration Tests**: Service-level testing
- **Mock Isolation**: Each test has independent mocks
- **Error Scenarios**: Comprehensive error case coverage

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx vitest src/test/services/listingService.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npx vitest
```

## Key Features Tested

1. **Search Functionality**
   - Multiple filter combinations
   - Database query optimization
   - Location-based searches

2. **Image Handling**
   - Multiple file uploads
   - Storage integration
   - Metadata persistence
   - File validation

3. **Data Transformation**
   - Database format conversion (snake_case ↔ camelCase)
   - Image data normalization
   - Agent data mapping

4. **Error Resilience**
   - Database connection failures
   - Authentication errors
   - File upload failures
   - Invalid data handling

## Mock Implementation Details

The mocks are designed to:
- Support method chaining (`.from().select().where()`)
- Return realistic data structures
- Handle both success and error scenarios
- Maintain state isolation between tests
- Support async operations

This comprehensive test suite ensures the listing service is robust, maintainable, and handles edge cases appropriately.
