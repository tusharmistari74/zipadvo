'use client';

import { Star } from 'lucide-react';
import { cn } from '@legalhub/utils';

export interface RatingProps {
  value: number; // 0 to 5
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  isInteractive?: boolean;
  onChange?: (rating: number) => void;
  showText?: boolean;
  reviewCount?: number;
  className?: string;
}

export function Rating({
  value,
  max = 5,
  size = 'md',
  isInteractive = false,
  onChange,
  showText = false,
  reviewCount,
  className,
}: RatingProps) {
  const sizeStyles = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, index) => {
          const starNumber = index + 1;
          const isFilled = value >= starNumber;
          const isHalf = !isFilled && value >= starNumber - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!isInteractive}
              onClick={() => isInteractive && onChange?.(starNumber)}
              className={cn(
                'focus:outline-none transition-transform',
                isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
              )}
            >
              <Star
                className={cn(
                  sizeStyles[size],
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'fill-slate-100 text-slate-300',
                )}
              />
            </button>
          );
        })}
      </div>

      {showText && (
        <span className="text-xs font-bold text-slate-800 ml-0.5">
          {value.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="font-normal text-slate-500 ml-1">({reviewCount} reviews)</span>
          )}
        </span>
      )}
    </div>
  );
}
