# Google Maps API Integration

This document outlines how to set up and configure Google Maps API for the Rentify Houses Kenya application.

## Prerequisites

1. Google Cloud Platform account
2. Billing account enabled (required for Maps JavaScript API)
3. Project with Maps JavaScript API enabled

## Setup Instructions

### 1. Create a Google Cloud Project (if you don't have one)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Note your project ID

### 2. Enable Maps JavaScript API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Maps JavaScript API"
3. Click on it and press "Enable"

### 3. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Recommended) Click on the API key to restrict it:
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domains (e.g., `localhost:*`, `yourapp.vercel.app/*`)
   - Under "API restrictions", select "Restrict key" and choose "Maps JavaScript API"

### 4. Set Environment Variables

#### For Local Development:
Create a `.env.local` file in your project root:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

#### For Vercel Deployment:
1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add:
   - Name: `VITE_GOOGLE_MAPS_API_KEY`
   - Value: `your_api_key_here`
   - Select all environments (Production, Preview, Development)

#### For Other Hosting Platforms:
Add the environment variable according to your platform's documentation.

## Features Implemented

### 1. Listings Map View
- Toggle between list and map view on the listings page
- Interactive markers for each property
- Click markers to highlight corresponding listing cards
- Automatic bounds fitting for multiple properties

### 2. Individual Property Map
- Detailed map for each property listing
- Custom marker with property information
- Info window with property title and address
- Fallback display when coordinates are not available

### 3. Map Customization
- Custom green markers matching the app's theme
- Disabled POI labels for cleaner appearance
- Responsive design for mobile and desktop

## Components

### PropertyMap
- Used for multiple listings display
- Props: `listings`, `selectedListingId`, `onListingSelect`, `className`, `height`
- Automatically handles bounds and centering

### SinglePropertyMap
- Used for individual property details
- Props: `location`, `title`, `className`, `height`, `showInfoWindow`
- Shows detailed location information

## Usage Examples

### Multiple Listings Map
```tsx
import PropertyMap from '../components/PropertyMap';

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
```

### Single Property Map
```tsx
import SinglePropertyMap from '../components/SinglePropertyMap';

<SinglePropertyMap 
  location={listing.location}
  title={listing.title}
  height="400px"
  className="shadow-md"
/>
```

## Troubleshooting

### Map Not Loading
1. Check if the API key is correctly set in environment variables
2. Verify the API key has proper permissions and restrictions
3. Ensure billing is enabled on your Google Cloud account
4. Check browser console for any error messages

### Markers Not Showing
1. Verify that listing objects have valid `lat` and `lng` coordinates
2. Check that coordinates are numbers, not strings
3. Ensure coordinates are within valid ranges (-90 to 90 for lat, -180 to 180 for lng)

### Performance Considerations
- The Google Maps API is loaded on-demand only when map components are used
- Consider implementing lazy loading for map-heavy pages
- Use appropriate zoom levels to balance detail and performance

## Future Enhancements

1. **Geocoding Integration**: Automatically convert addresses to coordinates
2. **Directions API**: Show directions to properties
3. **Places API**: Enhanced location search and autocomplete
4. **Street View Integration**: 360° property views
5. **Clustering**: Group nearby markers for better performance with many listings
6. **Custom Map Styles**: Branded map appearance
7. **Offline Support**: Cached map tiles for limited connectivity

## Cost Considerations

- Maps JavaScript API charges per map load
- Consider implementing map caching or lazy loading for cost optimization
- Monitor usage through Google Cloud Console
- Set up billing alerts to avoid unexpected charges

For more information, refer to the [Google Maps JavaScript API documentation](https://developers.google.com/maps/documentation/javascript).
