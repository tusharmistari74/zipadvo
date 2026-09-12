'use client';

import React, { useEffect } from 'react';
import { cn } from '@legalhub/utils';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  position = 'right',
  title,
  children,
  footer,
  className,
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed inset-y-0 z-10 flex max-w-full',
          position === 'right' ? 'right-0 pl-10' : 'left-0 pr-10',
        )}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-slate-200 animate-in duration-300',
            position === 'right' ? 'border-l slide-in-from-right' : 'border-r slide-in-from-left',
            className,
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 ml-auto"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close panel</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-slate-700">{children}</div>

          {/* Footer */}
          {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
