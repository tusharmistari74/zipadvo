import React, { forwardRef } from 'react';
import { cn } from '@legalhub/utils';
import { Spinner } from './spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none rounded-lg active:scale-[0.98]';

    const variantStyles = {
      primary:
        'bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-600 shadow-sm border border-transparent',
      secondary:
        'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-700 shadow-sm border border-transparent',
      outline:
        'border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 focus-visible:ring-slate-400 shadow-sm',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 focus-visible:ring-slate-300',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm border border-transparent',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-sm border border-transparent',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner
            size={size === 'sm' ? 'sm' : 'sm'}
            variant={variant === 'outline' || variant === 'ghost' ? 'slate' : 'white'}
            className="mr-1.5"
          />
        ) : (
          leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0 items-center">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
