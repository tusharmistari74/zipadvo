import React, { forwardRef } from 'react';
import { cn } from '@legalhub/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  helperText?: string;
  errorMessage?: string;
  placeholder?: string;
  isRequired?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options = [], helperText, errorMessage, placeholder, isRequired, id, disabled, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = Boolean(errorMessage);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label} {isRequired && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={errorMessage ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            className={cn(
              'w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 shadow-sm cursor-pointer',
              hasError
                ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600'
                : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {errorMessage ? (
          <p id={`${selectId}-error`} className="text-xs text-red-600 font-medium">
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-helper`} className="text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';
