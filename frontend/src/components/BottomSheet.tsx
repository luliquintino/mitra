'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 animate-fade-in" onClick={onClose}>
      {/* Backdrop — glass overlay */}
      <div className="absolute inset-0 bg-[#1E1B4B]/20 backdrop-blur-[8px]" />

      {/* Sheet */}
      <div className="absolute inset-0 flex items-end sm:items-center sm:justify-center">
        <div
          ref={sheetRef}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'relative w-full bg-white/95 backdrop-blur-2xl animate-slide-up',
            'rounded-t-[2rem] max-h-[85vh]',
            'sm:rounded-2xl sm:max-w-xl sm:max-h-[80vh] sm:shadow-modal sm:mx-4 sm:border sm:border-white/30',
            className,
          )}
        >
          {/* Handle bar (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="bg-texto-muted/30 w-10 h-1 rounded-full mx-auto" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3">
            <h3 className="font-headline font-bold text-lg text-texto">{title}</h3>
            <button
              onClick={onClose}
              className="text-texto-soft hover:text-primary hover:bg-primary/5 rounded-xl w-9 h-9 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
