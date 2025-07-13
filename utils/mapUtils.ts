/**
 * Google Maps utility functions for geocoding and location services
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

/**
 * Geocodes an address to latitude and longitude coordinates
 * Requires Google Maps API to be loaded
 */
export const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
  if (!window.google || !window.google.maps) {
    console.error('Google Maps API not loaded');
    return null;
  }

  const geocoder = new window.google.maps.Geocoder();

  try {
    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });

    if (result.length > 0) {
      const location = result[0].geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng(),
        formattedAddress: result[0].formatted_address
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Reverse geocodes coordinates to an address
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  if (!window.google || !window.google.maps) {
    console.error('Google Maps API not loaded');
    return null;
  }

  const geocoder = new window.google.maps.Geocoder();
  const latlng = new google.maps.LatLng(lat, lng);

  try {
    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });

    if (result.length > 0) {
      return result[0].formatted_address;
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Calculates distance between two points using Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Validates if coordinates are within Kenya bounds (approximately)
 */
export const isWithinKenyaBounds = (lat: number, lng: number): boolean => {
  // Kenya's approximate bounding box
  const KENYA_BOUNDS = {
    north: 5.0,
    south: -4.8,
    east: 42.0,
    west: 33.9
  };

  return (
    lat >= KENYA_BOUNDS.south &&
    lat <= KENYA_BOUNDS.north &&
    lng >= KENYA_BOUNDS.west &&
    lng <= KENYA_BOUNDS.east
  );
};

/**
 * Popular Kenya locations with their coordinates
 */
export const KENYA_LOCATIONS = {
  'Nairobi CBD': { lat: -1.2864, lng: 36.8172 },
  'Kilimani': { lat: -1.2955, lng: 36.7820 },
  'Westlands': { lat: -1.2676, lng: 36.8070 },
  'Lavington': { lat: -1.2836, lng: 36.7613 },
  'Rongai': { lat: -1.3927, lng: 36.7560 },
  'Kileleshwa': { lat: -1.2889, lng: 36.7876 },
  'Ngong Road': { lat: -1.3167, lng: 36.7833 },
  'Thika Road': { lat: -1.2167, lng: 36.8833 },
  'Mombasa CBD': { lat: -4.0435, lng: 39.6682 },
  'Nyali': { lat: -4.0209, lng: 39.7053 },
  'Nakuru Town': { lat: -0.3031, lng: 36.0800 }
} as const;

/**
 * Gets coordinates for a known Kenya location
 */
export const getKenyaLocationCoords = (locationName: string): { lat: number; lng: number } | null => {
  const coords = KENYA_LOCATIONS[locationName as keyof typeof KENYA_LOCATIONS];
  return coords || null;
};
