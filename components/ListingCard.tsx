import React from 'react';
import { Link } from 'react-router-dom';
import { PropertyListing, PropertyImage } from '../types';
import { MapPinIcon, CheckBadgeIcon, StarIcon, PlaceholderImage } from '../constants';

interface ListingCardProps {
  listing: PropertyListing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const primaryImageToDisplay: PropertyImage = (listing.images?.find(img => img.url)) || {
    id: `placeholder-${listing.id}`,
    url: PlaceholderImage(400, 300),
    altText: 'Placeholder property image',
    aiScanStatus: 'clear',
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full">
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="relative">
          <img
            src={primaryImageToDisplay.url}
            alt={primaryImageToDisplay.altText || listing.title}
            className="w-full h-56 object-cover"
          />
          {listing.isFeatured && (
            <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
              Featured
            </span>
          )}
          {listing.agent?.isVerifiedAgent && (
            <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center">
              <CheckBadgeIcon className="w-4 h-4 mr-1 text-green-600" /> Verified Agent
            </span>
          )}
          {primaryImageToDisplay.aiScanStatus?.startsWith('flagged_') && (
            <div
              className="absolute bottom-2 right-2 bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center"
              title={primaryImageToDisplay.aiScanReason}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.627-1.096 2.072-1.096 2.7 0l5.833 10.184c.621 1.085-.14 2.467-1.35 2.467H3.774c-1.21 0-1.971-1.382-1.35-2.467L8.257 3.099zM10 6a1 1 0 011 1v4a1 1 0 11-2 0V7a1 1 0 011-1zm0 7a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
              </svg>
              Verify Image
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/listing/${listing.id}`} className="block">
          <h3
            className="text-lg font-semibold text-gray-800 hover:text-green-600 transition-colors truncate"
            title={listing.title}
          >
            {listing.title}
          </h3>
        </Link>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <MapPinIcon className="w-4 h-4 mr-1 text-green-500" />
          <span>{listing.location?.neighborhood}, {listing.location?.county}</span>
        </div>

        <p className="text-xl font-bold text-green-600 my-2">{formatPrice(listing.price)}/mo</p>

        <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
          <span>{listing.bedrooms} bed{listing.bedrooms > 1 ? 's' : ''}</span>
          <span className="text-gray-300">|</span>
          <span>{listing.bathrooms} bath{listing.bathrooms > 1 ? 's' : ''}</span>
          {listing.areaSqFt && (
            <>
              <span className="text-gray-300">|</span>
              <span>{listing.areaSqFt} sqft</span>
            </>
          )}
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={
                  listing.agent?.profilePictureUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.agent?.name || 'Agent')}&background=random`
                }
                alt={listing.agent?.name || 'Agent'}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="text-xs text-gray-500">{listing.agent?.name || 'Agent'}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
              <span>{(Math.random() * (5 - 3.5) + 3.5).toFixed(1)} ({Math.floor(Math.random() * 50) + 5} reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
