import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const visibilityStyles = isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4';

  const typeConfig = {
    success: {
      bg: 'bg-white/90 backdrop-blur-xl border-teal/20',
      text: 'text-teal-600',
      icon: <CheckCircle className="w-5 h-5 text-teal" />,
    },
    error: {
      bg: 'bg-white/90 backdrop-blur-xl border-rose/20',
      text: 'text-rose-600',
      icon: <XCircle className="w-5 h-5 text-rose" />,
    },
    info: {
      bg: 'bg-white/90 backdrop-blur-xl border-primary/20',
      text: 'text-primary',
      icon: <Info className="w-5 h-5 text-primary" />,
    },
    warning: {
      bg: 'bg-white/90 backdrop-blur-xl border-amber/20',
      text: 'text-amber-600',
      icon: <AlertTriangle className="w-5 h-5 text-amber" />,
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`flex gap-3 rounded-xl p-4 shadow-glass border transition-all duration-300 animate-slide-in-right ${config.bg} ${visibilityStyles}`}
      role="alert"
    >
      <span className="flex-shrink-0 mt-0.5">{config.icon}</span>
      <div className="flex-1">
        <p className={`font-headline font-semibold text-sm ${config.text}`}>{title}</p>
        {message && <p className="text-sm text-texto-soft mt-0.5">{message}</p>}
      </div>
      <button
        onClick={() => { setIsVisible(false); setTimeout(() => onClose(id), 300); }}
        className="flex-shrink-0 text-texto-muted hover:text-texto transition-colors"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
