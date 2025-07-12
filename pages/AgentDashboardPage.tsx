import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyListing, User, AgentMetrics, UserRole, PropertyImage } from '../types';
import { listingService } from '../services/listingService';
import { useAuth } from '../hooks/useAuth';
import { uploadImagesToStorageAndSaveMetadata, deleteImagesFromStorageAndDatabase } from '../utils/imageUploadHelper';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { PlaceholderImage, CheckBadgeIcon } from '../constants';
import ListingFormModal from '../components/agent/ListingFormModal';

const AgentDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<PropertyListing | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [isVerifyingId, setIsVerifyingId] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  const fetchData = useCallback(async () => {
    if (!user || user.role !== UserRole.AGENT) return;
    setIsLoading(true);
    try {
      const [agentListings, agentMetrics] = await Promise.all([
        listingService.getListings({ agentId: user.id }),
        listingService.getAgentMetrics(user.id),
      ]);
      setListings(agentListings);
      setMetrics(agentMetrics);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.AGENT)) {
      navigate('/auth?mode=login&returnTo=/dashboard/agent');
    } else if (user) {
      fetchData();
    }
  }, [authLoading, user, navigate, fetchData]);

  const handleCreateListing = () => {
    setEditingListing(null);
    setIsModalOpen(true);
  };

  const handleEditListing = (listing: PropertyListing) => {
    setEditingListing(listing);
    setIsModalOpen(true);
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await listingService.deleteListing(id);
      fetchData();
    } catch (e: any) {
      setError(e.message || 'Failed to delete listing');
    }
  };

  const handleFormSubmit = async (
    formData: Omit<PropertyListing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'saves' | 'agent' | 'images'>,
    imageFiles: File[],
    imagesToRemove?: string[]
  ) => {
    try {
      let savedListing: PropertyListing;
      if (editingListing) {
        savedListing = await listingService.updateListing(editingListing.id, formData);
        
        // Handle image removal for existing listings
        if (imagesToRemove && imagesToRemove.length > 0) {
          console.log(`[Form Submit] Attempting to delete ${imagesToRemove.length} images:`, imagesToRemove);
          try {
            const deletedImageIds = await deleteImagesFromStorageAndDatabase(imagesToRemove);
            console.log(`[Form Submit] Successfully deleted ${deletedImageIds.length}/${imagesToRemove.length} images`);
            
            if (deletedImageIds.length < imagesToRemove.length) {
              console.warn(`[Form Submit] Some images may have already been deleted or were not found`);
            }
          } catch (imageDeleteError) {
            console.error(`[Form Submit] Image deletion failed:`, imageDeleteError);
            // Don't fail the entire form submission if image deletion fails
            // The listing update was successful, just log the error
          }
        }
      } else {
        // For new listings, we'll upload images separately after creating the listing
        savedListing = await listingService.createListing({
          ...formData,
          images: [] // Empty array for new listings
        });
      }

      if (imageFiles.length > 0) {
        await uploadImagesToStorageAndSaveMetadata(savedListing.id, imageFiles);
      }

      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit listing');
    }
  };

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setIdFile(e.target.files[0]);
  };

  const handleIdVerificationSubmit = async () => {
    if (!user || !idFile) return;
    setIsVerifyingId(true);
    try {
      // TODO: Implement verification service
      // await verifyAgentIdentity(user.id, idFile);
      setVerificationMessage('Submitted. We will review your ID shortly.');
    } catch (err: any) {
      setVerificationMessage(`Failed: ${err.message}`);
    } finally {
      setIsVerifyingId(false);
      setIdFile(null);
    }
  };

  const getPrimaryImage = (images?: PropertyImage[]) =>
    images?.[0]?.url ?? PlaceholderImage(64, 64);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name || user?.email}</p>
        </div>
        <Button onClick={handleCreateListing}>Create New Listing</Button>
      </div>

      {!user?.is_verified_agent ? (
        <div className="bg-yellow-100 p-4 rounded border">
          <p className="mb-2 font-medium">Verify your identity</p>
          <div className="flex gap-3">
            <Input type="file" onChange={handleIdFileChange} />
            <Button onClick={handleIdVerificationSubmit} disabled={!idFile} isLoading={isVerifyingId}>
              Submit ID
            </Button>
          </div>
          {verificationMessage && <p className="mt-2 text-sm">{verificationMessage}</p>}
        </div>
      ) : (
        <div className="bg-green-50 p-3 rounded flex items-center">
          <CheckBadgeIcon className="w-6 h-6 mr-2 text-green-600" />
          <p className="text-green-700">You are a Verified Agent</p>
        </div>
      )}

      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>Total Listings: {metrics.totalListings}</div>
          <div>Active: {metrics.activeListings}</div>
          <div>Views: {metrics.totalViews}</div>
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">My Listings</h2>
        {listings.length === 0 ? (
          <p>No listings yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {listings.map((listing) => (
              <div key={listing.id} className="p-4 border rounded flex gap-4">
                <img src={getPrimaryImage(listing.images)} alt="Listing" className="w-24 h-20 object-cover rounded" />
                <div className="flex-grow">
                  <h3 className="text-lg font-medium">{listing.title}</h3>
                  <p className="text-sm text-gray-600">{listing.location.county}</p>
                  <p className="text-sm text-gray-600">KES {listing.price.toLocaleString()}</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => handleEditListing(listing)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteListing(listing.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isModalOpen && user && (
        <ListingFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingListing}
          agent={undefined}
        />
      )}
    </div>
  );
};

export default AgentDashboardPage;
