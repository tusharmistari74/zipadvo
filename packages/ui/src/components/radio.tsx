import React, { forwardRef } from 'react';
import { cn } from '@legalhub/utils';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  errorMessage?: string;
  className?: string;
  direction?: 'vertical' | 'horizontal';
}

export const RadioGroup = ({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  errorMessage,
  className,
  direction = 'vertical',
}: RadioGroupProps) => {
  return (
    <div className="space-y-1.5" role="radiogroup" aria-labelledby={label ? `${name}-label` : undefined}>
      {label && (
        <label id={`${name}-label`} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className={cn('gap-3', direction === 'horizontal' ? 'flex flex-wrap' : 'flex flex-col', className)}>
        {options.map((option) => {
          const isChecked = value !== undefined ? value === option.value : undefined;
          const optionId = `${name}-${option.value}`;

          return (
            <div key={option.value} className="flex items-start space-x-3">
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={isChecked}
                defaultChecked={defaultValue === option.value}
                disabled={option.disabled}
                onChange={() => onChange?.(option.value)}
                className="mt-0.5 h-4 w-4 border-slate-300 text-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              />
              <label htmlFor={optionId} className="select-none text-sm text-slate-800 cursor-pointer leading-tight">
                {option.label}
                {option.description && (
                  <span className="block text-xs text-slate-500 mt-0.5 font-normal">{option.description}</span>
                )}
              </label>
            </div>
          );
        })}
      </div>
      {errorMessage && <p className="text-xs text-red-600 font-medium">{errorMessage}</p>}
    </div>
  );
};

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, disabled, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex items-start space-x-3">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          disabled={disabled}
          className={cn(
            'mt-0.5 h-4 w-4 border-slate-300 text-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
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
    );
  },
);

Radio.displayName = 'Radio';
