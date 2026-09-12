import React, { forwardRef } from 'react';
import { cn } from '@legalhub/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, helperText, errorMessage, leftIcon, rightIcon, isRequired, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = Boolean(errorMessage);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label} {isRequired && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={errorMessage ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={cn(
              'w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 shadow-sm',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              hasError
                ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600'
                : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </span>
          )}
        </div>
        {errorMessage ? (
          <p id={`${inputId}-error`} className="text-xs text-red-600 font-medium">
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
