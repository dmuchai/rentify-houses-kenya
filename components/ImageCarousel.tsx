import React, { useState } from 'react';
import { PropertyImage } from '../types';
import { PlaceholderImage } from '../constants'; // For default placeholder image

interface ImageCarouselProps {
  images: PropertyImage[];
  altText?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, altText = "Property image" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center rounded-lg shadow">
        <img 
          src={PlaceholderImage(600,400)} 
          alt="Placeholder property" 
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    );
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="relative w-full h-64 md:h-96 rounded-lg shadow-lg overflow-hidden group">
      <div 
        style={{ backgroundImage: `url(${images[currentIndex].url || PlaceholderImage(800,600)})` }}
        className="w-full h-full bg-center bg-cover duration-500 ease-in-out transform group-hover:scale-105"
      ></div>
      {/* Left Arrow */}
      {images.length > 1 && (
        <button 
          onClick={goToPrevious}
          className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full focus:outline-none transition-opacity opacity-0 group-hover:opacity-100"
          aria-label="Previous image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}
      {/* Right Arrow */}
      {images.length > 1 && (
        <button 
          onClick={goToNext}
          className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full focus:outline-none transition-opacity opacity-0 group-hover:opacity-100"
          aria-label="Next image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}
      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, slideIndex) => (
            <button
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`w-3 h-3 rounded-full ${currentIndex === slideIndex ? 'bg-white' : 'bg-gray-400 hover:bg-gray-200'} focus:outline-none transition-all`}
              aria-label={`Go to image ${slideIndex + 1}`}
            ></button>
          ))}
        </div>
      )}
       {images[currentIndex].aiScanStatus.startsWith('flagged_') && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.627-1.096 2.072-1.096 2.7 0l5.833 10.184c.621 1.085-.14 2.467-1.35 2.467H3.774c-1.21 0-1.971-1.382-1.35-2.467L8.257 3.099zM10 6a1 1 0 011 1v4a1 1 0 11-2 0V7a1 1 0 011-1zm0 7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
          AI Warning
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
