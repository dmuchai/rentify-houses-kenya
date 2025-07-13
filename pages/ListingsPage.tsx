
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import SearchBar, { SearchFilters } from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import PropertyMap from '../components/PropertyMap';
import { PropertyListing } from '../types';
import { listingService } from '../services/listingService';
import { KenyanCounties } from '../constants'; // For filter options
import Select from '../components/Select';
import Input from '../components/Input';
import Button from '../components/Button';

const ListingsPage: React.FC = () => {
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMapView, setShowMapView] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | undefined>();
  const locationHook = useLocation(); // from react-router-dom
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get initial filters from both state and URL parameters
  const initialFiltersFromState = (locationHook.state as { initialSearchFilters?: SearchFilters })?.initialSearchFilters || {};
  const initialFiltersFromURL: SearchFilters = {
    location: searchParams.get('location') || undefined,
    county: searchParams.get('county') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
  };
  
  // Merge URL params with state, giving priority to URL params
  const initialFilters = { ...initialFiltersFromState, ...Object.fromEntries(Object.entries(initialFiltersFromURL).filter(([, value]) => value !== undefined)) };
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(initialFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const fetchListings = useCallback(async (filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedListings = await listingService.getListings(filters);
      setListings(fetchedListings);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setError("Could not load listings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(currentFilters);
    
    // Update URL with current filters
    const newSearchParams = new URLSearchParams();
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newSearchParams.set(key, value.toString());
      }
    });
    
    // Only update URL if search params actually changed
    const currentParamsString = searchParams.toString();
    const newParamsString = newSearchParams.toString();
    if (currentParamsString !== newParamsString) {
      navigate(`/listings${newParamsString ? `?${newParamsString}` : ''}`, { replace: true });
    }
  }, [fetchListings, currentFilters, navigate, searchParams]);

  const handleSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
  };
  
  const handleAdvancedFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentFilters(prev => ({ 
        ...prev, 
        [name]: value ? (name.includes('Price') || name === 'bedrooms' ? Number(value) : value) : undefined 
    }));
  };

  const countyOptions = KenyanCounties.map(county => ({ value: county, label: county }));
  const bedroomOptions = [1,2,3,4,5].map(n => ({value: n, label: `${n} Bedroom${n > 1 ? 's' : ''}`}));

  return (
    <div className="space-y-8">
      <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">Find Your Perfect Rental</h1>
        <SearchBar onSearch={handleSearch} initialFilters={currentFilters} isLoading={isLoading}/>
        <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </Button>
        </div>
        {showAdvancedFilters && (
            <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Select
                    label="County"
                    name="county"
                    options={countyOptions}
                    value={currentFilters.county || ''}
                    onChange={handleAdvancedFilterChange}
                    placeholder="Any County"
                />
                <Select
                    label="Bedrooms"
                    name="bedrooms"
                    options={bedroomOptions}
                    value={currentFilters.bedrooms || ''}
                    onChange={handleAdvancedFilterChange}
                    placeholder="Any Bedrooms"
                />
                <Input
                    label="Min Price (KES)"
                    name="minPrice"
                    type="number"
                    placeholder="e.g. 20000"
                    value={currentFilters.minPrice || ''}
                    onChange={handleAdvancedFilterChange}
                />
                <Input
                    label="Max Price (KES)"
                    name="maxPrice"
                    type="number"
                    placeholder="e.g. 100000"
                    value={currentFilters.maxPrice || ''}
                    onChange={handleAdvancedFilterChange}
                />
                 <div className="sm:col-span-2 md:col-span-1 flex items-end">
                    <Button onClick={() => fetchListings(currentFilters)} isLoading={isLoading} className="w-full">Apply Filters</Button>
                </div>
            </div>
        )}
      </section>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {isLoading ? (
        <div className="flex justify-center py-10"><LoadingSpinner text="Searching for listings..." /></div>
      ) : listings.length > 0 ? (
        <section>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">Found {listings.length} listing{listings.length === 1 ? '' : 's'}.</p>
            <div className="flex space-x-2">
              <Button 
                variant={!showMapView ? "primary" : "outline"} 
                size="sm" 
                onClick={() => setShowMapView(false)}
              >
                📋 List View
              </Button>
              <Button 
                variant={showMapView ? "primary" : "outline"} 
                size="sm" 
                onClick={() => setShowMapView(true)}
              >
                🗺️ Map View
              </Button>
            </div>
          </div>

          {showMapView ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map Section */}
              <div className="lg:sticky lg:top-4">
                <PropertyMap 
                  listings={listings.map(listing => ({
                    id: listing.id,
                    title: listing.title,
                    location: listing.location
                  }))}
                  selectedListingId={selectedListingId}
                  onListingSelect={setSelectedListingId}
                  height="600px"
                  className="shadow-md"
                />
              </div>
              
              {/* Listings Section */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {listings.map((listing) => (
                  <div 
                    key={listing.id}
                    className={`transition-all duration-200 ${
                      selectedListingId === listing.id 
                        ? 'ring-2 ring-green-500 ring-opacity-50' 
                        : ''
                    }`}
                    onClick={() => setSelectedListingId(listing.id)}
                  >
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
          {/* Pagination could be added here */}
        </section>
      ) : (
        <div className="text-center py-10">
          <img src="https://picsum.photos/seed/no-results/300/200" alt="No results" className="mx-auto mb-4 rounded-lg opacity-70" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Listings Found</h2>
          <p className="text-gray-500">
            Try adjusting your search filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default ListingsPage;
