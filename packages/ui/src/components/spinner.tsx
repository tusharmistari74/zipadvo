import React from 'react';
import { cn } from '@legalhub/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'slate';
}

export function Spinner({ size = 'md', variant = 'primary', className, ...props }: SpinnerProps) {
  const sizeStyles = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  };

  const variantStyles = {
    primary: 'border-blue-200 border-t-blue-700',
    white: 'border-white/30 border-t-white',
    slate: 'border-slate-200 border-t-slate-700',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('animate-spin rounded-full', sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
