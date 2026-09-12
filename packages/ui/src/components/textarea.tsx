import React, { forwardRef } from 'react';
import { cn } from '@legalhub/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, errorMessage, isRequired, id, disabled, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = Boolean(errorMessage);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label} {isRequired && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={errorMessage ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          className={cn(
            'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 shadow-sm resize-y',
            hasError
              ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600'
              : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600',
            className,
          )}
          {...props}
        />
        {errorMessage ? (
          <p id={`${textareaId}-error`} className="text-xs text-red-600 font-medium">
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={`${textareaId}-helper`} className="text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
