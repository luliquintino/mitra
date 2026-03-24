'use client';
import Link from 'next/link';

interface MitraLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export function MitraLogo({ variant = 'dark', className = '' }: MitraLogoProps) {
  const isLight = variant === 'light';
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display text-lg ${
        isLight ? 'bg-white/20 text-white' : 'bg-mitra-700 text-white'
      }`}>
        M
      </div>
      <span className={`font-semibold tracking-wider text-sm ${
        isLight ? 'text-white' : 'text-mitra-900'
      }`}>
        MITRA
      </span>
    </Link>
  );
}
