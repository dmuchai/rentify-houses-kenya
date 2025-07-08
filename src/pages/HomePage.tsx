import React, { useEffect, useState } from 'react';

// Define a basic mock listing type
type MockListing = {
  id: string;
  title: string;
  location: string;
  price: number;
  imageUrl: string;
};

const mockListings: MockListing[] = [
  {
    id: '1',
    title: 'Modern 2 Bedroom Apartment',
    location: 'Githurai, Nairobi',
    price: 30000,
    imageUrl: 'https://via.placeholder.com/400x250?text=Listing+1',
  },
  {
    id: '2',
    title: 'Luxury 3 Bedroom in Kilimani',
    location: 'Kilimani, Nairobi',
    price: 120000,
    imageUrl: 'https://via.placeholder.com/400x250?text=Listing+2',
  },
  {
    id: '3',
    title: 'Affordable 1 Bedroom',
    location: 'Kasarani, Nairobi',
    price: 18000,
    imageUrl: 'https://via.placeholder.com/400x250?text=Listing+3',
  },
];

const ListingCard: React.FC<{ listing: MockListing }> = ({ listing }) => (
  <div className="border rounded-lg shadow-sm overflow-hidden">
    <img src={listing.imageUrl} alt={listing.title} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-800">{listing.title}</h3>
      <p className="text-sm text-gray-600">{listing.location}</p>
      <p className="mt-2 text-green-600 font-bold">KES {listing.price.toLocaleString()}</p>
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const [listings, setListings] = useState<MockListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async fetch
    setTimeout(() => {
      setListings(mockListings);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-white py-16 text-center shadow-sm">
        <h1 className="text-4xl font-bold text-blue-700">Welcome to Rentify Kenya</h1>
        <p className="text-gray-600 mt-2">Find the best rental properties across Nairobi</p>
      </div>

      {/* Listings */}
      <section className="py-12 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Listings</h2>

        {loading ? (
          <p className="text-gray-500">Loading listings...</p>
        ) : listings.length === 0 ? (
          <p className="text-gray-500">No listings found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
