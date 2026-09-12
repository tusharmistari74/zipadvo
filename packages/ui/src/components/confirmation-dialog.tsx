'use client';

import { Dialog } from './dialog';
import { Button } from './button';
import { AlertTriangle, Info } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmationDialogProps) {
  const icons = {
    danger: <AlertTriangle className="h-6 w-6 text-red-600" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-600" />,
    primary: <Info className="h-6 w-6 text-blue-600" />,
  };

  const bgStyles = {
    danger: 'bg-red-50 border-red-100',
    warning: 'bg-amber-50 border-amber-100',
    primary: 'bg-blue-50 border-blue-100',
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-full border shrink-0 ${bgStyles[variant]}`}>
          {icons[variant]}
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 text-base">{title}</h4>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </Dialog>
  );
}
