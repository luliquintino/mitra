import React, { useEffect, useState } from 'react';

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
        setTimeout(() => onClose(id), 300); // Allow fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const baseStyles =
    'flex gap-3 rounded-xl p-4 shadow-lg border transition-all duration-300 animate-slide-in-right';
  const visibilityStyles = isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4';

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-erro-light border-red-200 text-erro',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  };

  const icons: Record<string, string> = {
    success: '\u2705',
    error: '\u274C',
    info: '\u2139\uFE0F',
    warning: '\u26A0\uFE0F',
  };

  return (
    <div
      className={`${baseStyles} ${typeStyles[type]} ${visibilityStyles}`}
      role="alert"
    >
      <span className="text-lg flex-shrink-0" aria-hidden="true">{icons[type]}</span>
      <div className="flex-1">
        <p className="font-semibold text-sm">{title}</p>
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity text-base"
        aria-label="Close notification"
      >
        &#10005;
      </button>
    </div>
  );
}
