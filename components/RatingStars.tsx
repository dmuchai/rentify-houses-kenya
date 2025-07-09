import React from 'react';
import { StarIcon } from '../constants';

interface RatingStarsProps {
  rating: number; // Value from 0 to 5
  maxStars?: number;
  onRatingChange?: (newRating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({ 
  rating, 
  maxStars = 5, 
  onRatingChange, 
  size = 'md',
  readOnly = false
}) => {
  const starSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const handleStarClick = (index: number) => {
    if (onRatingChange && !readOnly) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex items-center">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={index}
            onClick={() => handleStarClick(index)}
            disabled={readOnly}
            className={`focus:outline-none ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`}
            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <StarIcon 
              className={`${starSizeClasses[size]} ${starValue <= rating ? 'text-yellow-400' : 'text-gray-300'} ${!readOnly ? 'hover:text-yellow-300' : ''}`} 
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
