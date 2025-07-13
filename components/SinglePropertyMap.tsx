import React from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface SinglePropertyMapProps {
  location: {
    address: string;
    lat?: number;
    lng?: number;
  };
  title: string;
  className?: string;
  height?: string;
  showInfoWindow?: boolean;
}

const SinglePropertyMap: React.FC<SinglePropertyMapProps> = ({
  location,
  title,
  className = "",
  height = "300px",
  showInfoWindow = true
}) => {
  // Default center (Nairobi, Kenya) if no coordinates
  const defaultCenter = { lat: -1.2921, lng: 36.8219 };
  
  const hasCoordinates = location.lat && location.lng;
  const center = hasCoordinates 
    ? { lat: location.lat!, lng: location.lng! }
    : defaultCenter;

  const MapComponent: React.FC = () => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [map, setMap] = React.useState<google.maps.Map>();

    React.useEffect(() => {
      if (ref.current && !map) {
        const newMap = new window.google.maps.Map(ref.current, {
          center,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });
        setMap(newMap);

        if (hasCoordinates) {
          const marker = new google.maps.Marker({
            position: center,
            map: newMap,
            title: title,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#16a34a"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 40)
            }
          });

          if (showInfoWindow) {
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${title}</h3>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">${location.address}</p>
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(newMap, marker);
            });

            // Auto-open info window
            infoWindow.open(newMap, marker);
          }
        }
      }
    }, [ref, map]);

    return <div ref={ref} className="w-full h-full" />;
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
            />
          </div>
        );
      case Status.SUCCESS:
        return (
          <div className={`rounded-lg overflow-hidden border ${className}`} style={{ height }}>
            <MapComponent />
          </div>
        );
    }
  };

  if (!hasCoordinates) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg border ${className}`} style={{ height }}>
        <div className="text-center p-6">
          <div className="text-4xl text-gray-400 mb-2">📍</div>
          <p className="text-gray-600 font-medium mb-1">Location not available</p>
          <p className="text-sm text-gray-500">{location.address}</p>
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
        />
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render} />
  );
};

export default SinglePropertyMap;
