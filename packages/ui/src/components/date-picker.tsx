import { cn } from '@legalhub/utils';
import { Calendar as CalendarIcon } from 'lucide-react';

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  label,
  helperText,
  errorMessage,
  disabled = false,
  className,
  id,
}: DatePickerProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const hasError = Boolean(errorMessage);

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
          <CalendarIcon className="h-4 w-4" />
        </span>
        <input
          id={inputId}
          type="date"
          value={value || ''}
          min={minDate}
          max={maxDate}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full rounded-lg border bg-white pl-10 pr-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 shadow-sm cursor-pointer',
            hasError
              ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600'
              : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600',
          )}
        />
      </div>
      {errorMessage ? (
        <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
