'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Sheet — mobile: bottom aligned, desktop: centered modal */}
      <div className="absolute inset-0 flex items-end sm:items-center sm:justify-center">
        <div
          ref={sheetRef}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'relative w-full bg-creme animate-slide-up',
            // Mobile: bottom sheet
            'rounded-t-[3rem] max-h-[85vh]',
            // Desktop: centered modal
            'sm:rounded-xl sm:max-w-xl sm:max-h-[80vh] sm:shadow-modal sm:mx-4',
            className,
          )}
        >
          {/* Handle bar (mobile only) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="bg-creme-dark/40 w-12 h-1.5 rounded-full mx-auto" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3">
            <h3 className="font-headline font-bold text-xl text-texto">{title}</h3>
            <button
              onClick={onClose}
              className="text-texto-soft hover:bg-creme-dark rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
