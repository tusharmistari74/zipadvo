import React, { forwardRef } from 'react';
import { cn } from '@legalhub/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  errorMessage?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, errorMessage, id, disabled, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-1">
        <div className="flex items-start space-x-3">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            className={cn(
              'mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-colors',
              errorMessage && 'border-red-500',
              className,
            )}
            {...props}
          />
          {label && (
            <label htmlFor={inputId} className="select-none text-sm text-slate-800 cursor-pointer leading-tight">
              {label}
              {description && <span className="block text-xs text-slate-500 mt-0.5 font-normal">{description}</span>}
            </label>
          )}
        </div>
        {errorMessage && <p className="text-xs text-red-600 font-medium pl-7">{errorMessage}</p>}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
