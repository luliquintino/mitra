'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PetImageProps {
  fotoUrl?: string;
  nome: string;
  especie: string;
  className?: string;
  fallbackClassName?: string;
}

export function PetImage({
  fotoUrl,
  nome,
  especie,
  className = 'w-14 h-14',
  fallbackClassName = 'bg-creme-dark',
}: PetImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const especieEmoji =
    especie === 'CACHORRO'
      ? '🐕'
      : especie === 'GATO'
        ? '🐈'
        : especie === 'CAVALO'
          ? '🐴'
          : especie === 'PEIXE'
            ? '🐟'
            : especie === 'PASSARO'
              ? '🦜'
              : especie === 'ROEDOR'
                ? '🐹'
                : especie === 'COELHO'
                  ? '🐰'
                  : especie === 'REPTIL'
                    ? '🦎'
                    : especie === 'FURAO'
                      ? '🦡'
                      : '🐾';

  // Se houver foto e não houver erro, mostrar imagem
  if (fotoUrl && !imageError) {
    return (
      <div
        className={cn(
          'rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden',
          className,
          imageLoading ? 'pt-skeleton' : '',
        )}
      >
        <img
          src={fotoUrl}
          alt={nome}
          className={cn('w-full h-full object-cover', imageLoading && 'opacity-0')}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      </div>
    );
  }

  // Fallback: mostrar emoji
  return (
    <div
      className={cn(
        'rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden',
        className,
        fallbackClassName,
      )}
    >
      <span className="text-2xl">{especieEmoji}</span>
    </div>
  );
}
