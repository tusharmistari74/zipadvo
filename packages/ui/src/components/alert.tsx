import React from 'react';
import { cn } from '@legalhub/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
  ...props
}: AlertProps) {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-600',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900 [&>svg]:text-emerald-600',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 [&>svg]:text-amber-600',
    error: 'bg-rose-50 border-rose-200 text-rose-900 [&>svg]:text-rose-600',
  };

  const icons = {
    info: <Info className="h-5 w-5 shrink-0" />,
    success: <CheckCircle2 className="h-5 w-5 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 rounded-lg border p-4 text-sm transition-all',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1 space-y-0.5">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-1"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
