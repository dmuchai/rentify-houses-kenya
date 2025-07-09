
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar, { SearchFilters } from '../components/SearchBar';
import ListingCard from '../components/ListingCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { PropertyListing } from '../types';
import { listingService } from '../services/listingService';
import { PlaceholderImage, SparklesIcon, MapPinIcon, CheckBadgeIcon } from '../constants';

const HomePage: React.FC = () => {
  const [featuredListings, setFeaturedListings] = useState<PropertyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchFeaturedListings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate fetching featured or recent listings
      const allListings = await listingService.getListings();
      setFeaturedListings(allListings.filter(l => l.isFeatured || l.status === 'available').slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch featured listings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedListings();
  }, [fetchFeaturedListings]);

  const handleSearch = (filters: SearchFilters) => {
    console.log("HomePage search submitted:", filters);
    // Navigate to listings page with search query/filters
    // For simplicity, passing filters as state for now. In a real app, use query params.
    navigate('/listings', { state: { initialSearchFilters: filters } });
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-teal-500 text-white py-16 md:py-24 rounded-lg shadow-xl overflow-hidden">
        <div className="absolute inset-0">
          <img src={PlaceholderImage(1200,800)} alt="Nairobi Skyline" className="w-full h-full object-cover opacity-20"/>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Next Home in Kenya</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Discover verified rental listings from trusted agents and landlords. Say goodbye to scams and hello to your dream home.
          </p>
          <div className="max-w-3xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Featured Listings</h2>
        {isLoading ? (
          <div className="flex justify-center py-10"><LoadingSpinner text="Loading listings..."/></div>
        ) : featuredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No featured listings available at the moment. Check back soon!</p>
        )}
        {featuredListings.length > 0 && (
            <div className="text-center mt-8">
                <Button variant="outline" onClick={() => navigate('/listings')}>
                    View All Listings
                </Button>
            </div>
        )}
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-12 px-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-4">
            <CheckBadgeIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Verified Listings</h3>
            <p className="text-gray-600">
              Our AI-powered system and manual checks help ensure listings are legitimate, reducing your risk of scams.
            </p>
          </div>
          <div className="text-center p-4">
            <SparklesIcon className="w-16 h-16 text-teal-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Smart Features</h3>
            <p className="text-gray-600">
              Utilize our AI assistant for search, get rent estimates, and enjoy an enhanced browsing experience.
            </p>
          </div>
          <div className="text-center p-4">
             <MapPinIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Kenya-Focused</h3>
            <p className="text-gray-600">
              Built for the Kenyan market, understanding local needs and locations.
            </p>
          </div>
        </div>
      </section>
      
      {/* Popular Locations (Placeholder) */}
      <section>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Popular Locations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {['Kilimani', 'Westlands', 'Lavington', 'Rongai', 'Kileleshwa', 'Ngong Road', 'Thika Road', 'Mombasa CBD', 'Nyali', 'Nakuru Town'].map(loc => (
            <Link key={loc} to={`/listings?location=${loc}`} className="block p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-center text-green-700 font-medium">
              {loc}
            </Link>
          ))}
        </div>
      </section>


      {/* Call to Action for Agents */}
      <section className="bg-green-600 text-white py-12 px-6 rounded-lg shadow-xl text-center">
        <h2 className="text-3xl font-semibold mb-4">Are you an Agent or Landlord?</h2>
        <p className="text-lg mb-6 max-w-xl mx-auto">
          Reach thousands of genuine tenants. Post your listings on a trusted platform with AI-powered verification and tools to help you succeed.
        </p>
        <Button variant="outline" size="lg" className="bg-white text-green-600 border-white hover:bg-gray-100" onClick={() => navigate('/auth?mode=register&role=agent')}>
          Register as an Agent
        </Button>
      </section>
    </div>
  );
};

export default HomePage;
