"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

export default function StarRating({
  rating,
  max = 5,
  onRatingChange,
  readonly = false,
  size = 18,
}: StarRatingProps) {
  return (
    <div className="flex gap-1" role={readonly ? "img" : "radiogroup"} aria-label="Rating">
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= rating;

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRatingChange?.(starValue)}
            className={cn(
              "transition-all",
              readonly ? "cursor-default" : "hover:scale-110 cursor-pointer",
            )}
            title={readonly ? undefined : `${starValue} ★`}
            aria-label={readonly ? undefined : `${starValue} ★`}
          >
            <Star
              size={size}
              className={cn(
                isActive && "fill-amber-400 text-amber-400",
                !isActive && "text-gray-300 dark:text-gray-600",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
