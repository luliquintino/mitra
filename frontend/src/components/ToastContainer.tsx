'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import { Toast, type ToastProps } from './Toast';

interface ToastMessage {
  id: string;
  type: ToastProps['type'];
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (
    type: ToastProps['type'],
    title: string,
    message?: string,
    duration?: number,
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (
      type: ToastProps['type'],
      title: string,
      message?: string,
      duration?: number,
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [
        ...prev,
        { id, type, title, message, duration },
      ]);
      return id;
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return {
    success: (title: string, message?: string, duration?: number) =>
      context.addToast('success', title, message, duration),
    error: (title: string, message?: string, duration?: number) =>
      context.addToast('error', title, message, duration),
    info: (title: string, message?: string, duration?: number) =>
      context.addToast('info', title, message, duration),
    warning: (title: string, message?: string, duration?: number) =>
      context.addToast('warning', title, message, duration),
  };
}
