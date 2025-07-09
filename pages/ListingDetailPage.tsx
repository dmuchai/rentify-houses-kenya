import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PropertyListing, RatingReview, UserRole } from '../types';
import { listingService } from '../services/listingService';
import { geminiService } from '../services/geminiService';
import ImageCarousel from '../components/ImageCarousel';
import RatingStars from '../components/RatingStars';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { MapPinIcon, CheckBadgeIcon, StarIcon, PlaceholderImage, SparklesIcon } from '../constants';
import { useAuth } from '../hooks/useAuth';
import Textarea from '../components/Textarea';

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [listing, setListing] = useState<PropertyListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<RatingReview[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');
  const [rentEstimate, setRentEstimate] = useState<{ min: number; max: number; avg: number; confidence: string } | null>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false);

  const fetchListingDetails = useCallback(async () => {
    if (!id) {
      setError("Listing ID is missing.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedListing = await listingService.getListingById(id);
      console.log("Fetched Listing:", fetchedListing);
      setListing(fetchedListing);
      if (fetchedListing) {
        setReviews([
          {
            id: 'rev1',
            raterUser: {
              id: 'user1',
              name: 'Test User 1',
              email: '',
              role: UserRole.TENANT,
              isVerifiedAgent: false,
              createdAt: ''
            },
            ratedAgent: fetchedListing.agent,
            rating: 4,
            comment: "Great agent, very responsive. Property was as described.",
            createdAt: new Date().toISOString(),
            isVerifiedInteraction: true
          },
          {
            id: 'rev2',
            raterUser: {
              id: 'user2',
              name: 'Another Tenant',
              email: '',
              role: UserRole.TENANT,
              isVerifiedAgent: false,
              createdAt: ''
            },
            ratedAgent: fetchedListing.agent,
            rating: 5,
            comment: "Smooth process, highly recommend this agent!",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            isVerifiedInteraction: true
          }
        ]);
      } else {
        setError("Listing not found.");
      }
    } catch (err) {
      console.error("Failed to fetch listing details:", err);
      setError("Could not load listing details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListingDetails();
  }, [fetchListingDetails]);

  const handleFetchRentEstimate = async () => {
    if (!listing) return;
    setIsLoadingEstimate(true);
    try {
      const estimateData = await geminiService.estimateRent(
        listing.location.neighborhood,
        listing.bedrooms,
        listing.location.county
      );
      if (estimateData) {
        setRentEstimate({
          min: estimateData.minRent,
          max: estimateData.maxRent,
          avg: estimateData.averageRent,
          confidence: estimateData.confidence
        });
      }
    } catch (e) {
      console.error("Error fetching rent estimate:", e);
    } finally {
      setIsLoadingEstimate(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim() || !user || !listing) return;
    setIsSubmittingContact(true);
    setContactError('');
    setContactSuccess('');
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSuccess(`Message sent to ${listing.agent.name}! They should respond to your email ${user.email}.`);
      setContactMessage('');
      setShowContactForm(false);
    }, 1500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(price);
  };

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner text="Loading listing details..." /></div>;
  if (error) return <Alert type="error" message={error} />;
  if (!listing) return <Alert type="warning" message="Listing not found." />;

  const shareViaWhatsApp = () => {
    const text = `Check out this rental listing: ${listing.title} at ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const QrCodePlaceholder = () => (
    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-xs text-gray-500 border">QR Code Here</div>
  );

  return (
    <div className="bg-white p-4 md:p-8 rounded-lg shadow-xl max-w-4xl mx-auto">
      <ImageCarousel
       images={listing.images.map(url => ({ url, aiScanStatus: 'clean' }))}
       altText={listing.title}
      />

      {/* ... Listing Info, Amenities, Rent Estimate ... */}

      {/* Agent Information */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Agent</h2>
        <div className="flex items-start bg-gray-50 p-4 rounded-lg shadow-sm">
          <img
            src={
              listing.agent.profilePictureUrl ||
              (listing.agent.name
                ? `https://ui-avatars.com/api/?name=${listing.agent.name.replace(' ', '+')}&background=random`
                : `https://ui-avatars.com/api/?name=Agent&background=random`)
            }
            alt={listing.agent.name || 'Agent'}
            className="w-16 h-16 rounded-full mr-4 border-2 border-green-200"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              {listing.agent.name || 'Agent'}
              {listing.agent.isVerifiedAgent && <CheckBadgeIcon className="w-5 h-5 ml-2 text-green-600" title="Verified Agent" />}
            </h3>
            <p className="text-sm text-gray-500">{listing.agent.email}</p>
            {listing.agent.phoneNumber && <p className="text-sm text-gray-500">Phone: {listing.agent.phoneNumber}</p>}
            {user && listing.status === 'available' && (
              <Button onClick={() => setShowContactForm(!showContactForm)} className="mt-3" variant="primary" size="sm">
                {showContactForm ? 'Cancel Message' : 'Send Message'}
              </Button>
            )}
            {!user && listing.status === 'available' && (
              <p className="mt-3 text-sm text-blue-600">
                <Link to={`/auth?mode=login&returnTo=/listing/${listing.id}`}>Login to contact agent</Link>
              </p>
            )}
          </div>
        </div>
        {showContactForm && user && (
          <form onSubmit={handleContactSubmit} className="mt-4 p-4 border rounded-md bg-white">
            <h4 className="text-md font-semibold mb-2">Your message to {listing.agent.name || 'agent'}:</h4>
            <Textarea
              name="contactMessage"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder={`Hi ${listing.agent.name?.split(' ')[0] || 'there'}, I'm interested in the ${listing.title}...`}
              required
            />
            {contactError && <Alert type="error" message={contactError} />}
            {contactSuccess && <Alert type="success" message={contactSuccess} />}
            <Button type="submit" isLoading={isSubmittingContact} disabled={!contactMessage.trim()}>Send Inquiry</Button>
          </form>
        )}
      </div>

      {/* Reviews Section */}
      {/* Share Section */}
    </div>
  );
};

export default ListingDetailPage;
