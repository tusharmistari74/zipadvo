import { cn } from '@legalhub/utils';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  retryText?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Failed to load data',
  description = 'An unexpected error occurred while fetching information. Please try again.',
  retryText = 'Try Again',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-rose-200 bg-rose-50/50',
        className,
      )}
    >
      <div className="p-3 bg-rose-100 text-rose-600 rounded-full mb-3">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h4 className="text-base font-bold text-rose-950 mb-1">{title}</h4>
      <p className="text-sm text-rose-700 max-w-sm mb-4">{description}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </div>
  );
}
