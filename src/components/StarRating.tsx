import React from 'react';
import { FiStar } from 'react-icons/fi';

interface StarRatingProps {
    rating: number;
    max?: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: number | string;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    max = 5,
    onRatingChange,
    readonly = false,
    size = 18,
}) => {
    return (
        <div className="flex gap-1">
            {[...Array(max)].map((_, i) => {
                const starValue = i + 1;
                const isActive = starValue <= rating;

                return (
                    <button
                        key={i}
                        type="button"
                        disabled={readonly}
                        onClick={() => !readonly && onRatingChange?.(starValue)}
                        className={`transition-all ${readonly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
                        title={readonly ? undefined : `${starValue} estrellas`}
                    >
                        <FiStar
                            size={size}
                            className={`${isActive ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
