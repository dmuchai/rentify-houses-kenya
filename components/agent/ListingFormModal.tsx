import React, { useState, useEffect } from 'react';
import { PropertyListing, User, PropertyImage } from '../../types';
import { geminiService } from '../../services/geminiService';
import Button from '../Button';
import Input from '../Input';
import Textarea from '../Textarea';
import Select from '../Select';
import Alert from '../Alert';
import { SparklesIcon, KenyanCounties } from '../../constants';

interface ListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: Omit<PropertyListing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'saves' | 'agent' | 'images'>,
    imageFiles: File[],
    imagesToRemove?: string[]
  ) => Promise<void>;
  initialData?: PropertyListing | null;
  agent?: User;
}

const ListingFormModal: React.FC<ListingFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, agent }) => {
  const [formData, setFormData] = useState<Omit<PropertyListing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'saves' | 'agent'>>({
    title: '',
    description: '',
    location: { address: '', county: 'Nairobi', neighborhood: '' },
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    areaSqFt: 0,
    amenities: [],
    images: [],
    status: 'pending_verification',
    isFeatured: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const { id, createdAt, updatedAt, views, saves, agent: _agent, ...editableData } = initialData;
        setFormData({
          ...editableData,
          location: {
            address: editableData.location?.address ?? '',
            county: editableData.location?.county ?? 'Nairobi',
            neighborhood: editableData.location?.neighborhood ?? '',
          },
          areaSqFt: editableData.areaSqFt ?? 0,
          amenities: editableData.amenities ?? [],
          images: editableData.images ?? [],
        });
        setExistingImages(editableData.images ?? []);
        setImagesToRemove([]);
      } else {
        setFormData({
          title: '',
          description: '',
          location: { address: '', county: 'Nairobi', neighborhood: '' },
          price: 0,
          bedrooms: 1,
          bathrooms: 1,
          areaSqFt: 0,
          amenities: [],
          images: [],
          status: 'pending_verification',
          isFeatured: false,
        });
        setExistingImages([]);
        setImagesToRemove([]);
      }
      setImageFiles([]);
      setFormError('');
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith('location.')) {
      const locField = name.split('.')[1];
      setFormData(prev => ({ ...prev, location: { ...prev.location, [locField]: value } }));
    } else if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      if (name === 'amenities') {
        setFormData(prev => ({
          ...prev,
          amenities: checked
            ? [...(prev.amenities ?? []), value]
            : (prev.amenities ?? []).filter(a => a !== value),
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else if (name === 'amenities-text') {
      setFormData(prev => ({ ...prev, amenities: value.split(',').map(a => a.trim()).filter(Boolean) }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' && name !== 'areaSqFt'
          ? parseFloat(value) || 0
          : name === 'areaSqFt'
            ? value ? parseFloat(value) : 0
            : value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const removeExistingImage = (imageId: string) => {
    setImagesToRemove(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const restoreExistingImage = (imageId: string) => {
    setImagesToRemove(prev => prev.filter(id => id !== imageId));
    // Find the image in the original data and restore it
    if (initialData?.images) {
      const imageToRestore = initialData.images.find(img => img.id === imageId);
      if (imageToRestore) {
        setExistingImages(prev => [...prev, imageToRestore]);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    const { images, ...restOfData } = formData;

    try {
      await onSubmit(restOfData, imageFiles, imagesToRemove);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnhanceContent = async () => {
    setIsEnhancing(true);
    setFormError('');
    try {
      const enhanced = await geminiService.enhanceListingContent({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: formData.price,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        amenities: formData.amenities,
      });
      if (enhanced) {
        setFormData(prev => ({
          ...prev,
          title: enhanced.suggestedTitle || prev.title,
          description: enhanced.enhancedDescription || prev.description,
        }));
        if (enhanced.pricingAdvice) alert(`AI Pricing Tip: ${enhanced.pricingAdvice}`);
      } else {
        setFormError('Could not enhance content at this time.');
      }
    } catch {
      setFormError('Error during AI enhancement.');
    } finally {
      setIsEnhancing(false);
    }
  };

  if (!isOpen) return null;

  const countyOptions = KenyanCounties.map(c => ({ value: c, label: c }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">{initialData ? 'Edit' : 'Create New'} Listing</h2>
        {formError && <Alert type="error" message={formError} onClose={() => setFormError('')} />}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input label="Title" name="title" value={formData.title ?? ''} onChange={handleChange} required />
          <div className="relative">
            <Textarea label="Description" name="description" value={formData.description ?? ''} onChange={handleChange} required />
            <Button
              type="button"
              onClick={handleEnhanceContent}
              isLoading={isEnhancing}
              size="sm"
              variant="outline"
              className="absolute top-0 right-0 mt-1 mr-1"
              title="Enhance with AI"
            >
              <SparklesIcon className="w-4 h-4" /> {!isEnhancing && 'AI'}
            </Button>
          </div>
          <Input label="Address (Street, Building)" name="location.address" value={formData.location.address ?? ''} onChange={handleChange} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="County" name="location.county" options={countyOptions} value={formData.location.county ?? 'Nairobi'} onChange={handleChange} required />
            <Input label="Neighborhood" name="location.neighborhood" value={formData.location.neighborhood ?? ''} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Price (KES per month)" name="price" type="number" value={formData.price ?? 0} onChange={handleChange} required />
            <Input label="Bedrooms" name="bedrooms" type="number" min="0" value={formData.bedrooms ?? 1} onChange={handleChange} required />
            <Input label="Bathrooms" name="bathrooms" type="number" min="0" value={formData.bathrooms ?? 1} onChange={handleChange} required />
          </div>
          <Input label="Area (sq ft, optional)" name="areaSqFt" type="number" min="0" value={formData.areaSqFt ?? 0} onChange={handleChange} />
          <Textarea label="Amenities (comma-separated)" name="amenities-text" value={(formData.amenities ?? []).join(', ')} onChange={handleChange} placeholder="e.g. Parking, Balcony, Borehole" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map(img => (
                    <div key={img.id} className="relative w-20 h-20 border rounded overflow-hidden group">
                      <img src={img.url} alt={img.altText || 'property image'} className="w-full h-full object-cover" />
                      {img.aiScanStatus?.startsWith('flagged') && (
                        <div title={img.aiScanReason} className="absolute top-0 left-0 bg-yellow-400 text-xs p-0.5 rounded-br-md">⚠️</div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md text-xs px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Removed Images (with option to restore) */}
            {imagesToRemove.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Removed Images (click to restore):</p>
                <div className="flex flex-wrap gap-2">
                  {imagesToRemove.map(imageId => {
                    const img = initialData?.images?.find(i => i.id === imageId);
                    if (!img) return null;
                    return (
                      <div key={img.id} className="relative w-20 h-20 border-2 border-red-300 rounded overflow-hidden opacity-50 cursor-pointer hover:opacity-75" onClick={() => restoreExistingImage(img.id)}>
                        <img src={img.url} alt={img.altText || 'property image'} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-red-500 bg-opacity-30 flex items-center justify-center">
                          <span className="text-white text-xs">Restore</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add New Images */}
            <input
              type="file"
              name="images"
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            
            {/* New Images Preview */}
            {imageFiles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">New Images:</p>
                <div className="flex flex-wrap gap-2">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative w-20 h-20 border-2 border-green-300 rounded overflow-hidden group">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md text-xs px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-tr-md">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured ?? false}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">Mark as Featured</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
              {initialData ? 'Save Changes' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListingFormModal;
