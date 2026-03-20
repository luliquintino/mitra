'use client';
import { useCallback, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({ children, className = '', delay }: ScrollRevealProps) {
  const refCallback = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;

    // Start hidden
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s ease-out${delay ? ` ${delay * 0.1}s` : ''}, transform 0.6s ease-out${delay ? ` ${delay * 0.1}s` : ''}`;

    const reveal = () => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    };

    if (typeof IntersectionObserver === 'undefined') {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );
    observer.observe(el);

    // Fallback: if already in viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      reveal();
      observer.unobserve(el);
    }
  }, [delay]);

  return (
    <div ref={refCallback} className={className}>
      {children}
    </div>
  );
}
