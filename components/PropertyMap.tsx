import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  markers?: google.maps.LatLngLiteral[];
  className?: string;
  onMarkerClick?: (index: number) => void;
}

const Map: React.FC<MapProps> = ({ center, zoom, markers = [], className = "", onMarkerClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  useEffect(() => {
    if (map) {
      // Clear existing markers
      mapMarkers.forEach(marker => marker.setMap(null));
      
      // Add new markers
      const newMarkers = markers.map((position, index) => {
        const marker = new google.maps.Marker({
          position,
          map,
          title: `Property ${index + 1}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#16a34a"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32)
          }
        });

        if (onMarkerClick) {
          marker.addListener('click', () => onMarkerClick(index));
        }

        return marker;
      });

      setMapMarkers(newMarkers);

      // Fit bounds if multiple markers
      if (markers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker));
        map.fitBounds(bounds);
      } else if (markers.length === 1) {
        map.setCenter(markers[0]);
      }
    }
  }, [map, markers, onMarkerClick]);

  return <div ref={ref} className={`w-full h-full ${className}`} />;
};

interface PropertyMapProps {
  listings: Array<{
    id: string;
    title: string;
    location: {
      address: string;
      lat?: number;
      lng?: number;
    };
  }>;
  selectedListingId?: string;
  onListingSelect?: (listingId: string) => void;
  className?: string;
  height?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  listings,
  selectedListingId,
  onListingSelect,
  className = "",
  height = "400px"
}) => {
  const [mapError, setMapError] = useState<string | null>(null);

  // Filter listings that have coordinates
  const listingsWithCoords = listings.filter(
    listing => listing.location.lat && listing.location.lng
  );

  // Default center (Nairobi, Kenya)
  const defaultCenter = { lat: -1.2921, lng: 36.8219 };
  
  const center = listingsWithCoords.length > 0 
    ? { lat: listingsWithCoords[0].location.lat!, lng: listingsWithCoords[0].location.lng! }
    : defaultCenter;

  const markers = listingsWithCoords.map(listing => ({
    lat: listing.location.lat!,
    lng: listing.location.lng!
  }));

  const handleMarkerClick = (index: number) => {
    if (onListingSelect) {
      const listing = listingsWithCoords[index];
      onListingSelect(listing.id);
    }
  };

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
            <LoadingSpinner text="Loading map..." />
          </div>
        );
      case Status.FAILURE:
        return (
          <div className={`${className}`} style={{ height }}>
            <Alert 
              type="error" 
              message="Failed to load Google Maps. Please check your internet connection and try again." 
              onClose={() => setMapError(null)}
            />
          </div>
        );
      case Status.SUCCESS:
        return (
          <div className={`rounded-lg overflow-hidden ${className}`} style={{ height }}>
            <Map 
              center={center} 
              zoom={listingsWithCoords.length > 1 ? 12 : 15}
              markers={markers}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        );
    }
  };

  if (listingsWithCoords.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center p-6">
          <div className="text-gray-400 mb-2">📍</div>
          <p className="text-gray-600">No location data available for these listings</p>
        </div>
      </div>
    );
  }

  // Get Google Maps API key from environment
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return (
      <div className={`${className}`} style={{ height }}>
        <Alert 
          type="error" 
          message="Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables." 
          onClose={() => setMapError(null)}
        />
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render} />
  );
};

export default PropertyMap;
