'use client';

import Link from 'next/link';

const HERO_KEYFRAMES = `
@keyframes hero-fade-slide-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

export function HeroSection() {
  const stagger = (i: number): React.CSSProperties => ({
    opacity: 0,
    animation: 'hero-fade-slide-up 0.7s ease-out forwards',
    animationDelay: `${i * 150}ms`,
  });

  return (
    <section className="relative min-h-screen bg-creme bg-blobs flex items-center justify-center overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: HERO_KEYFRAMES }} />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6 py-20">
        <h1
          className="text-4xl md:text-6xl font-headline font-extrabold text-texto leading-tight"
          style={stagger(0)}
        >
          Todo o cuidado que seu pet merece. Em um só lugar.
        </h1>

        <p
          className="text-lg md:text-xl text-texto-soft font-body mt-4 max-w-xl mx-auto"
          style={stagger(1)}
        >
          Saúde, agenda, guarda compartilhada e histórico — organizado com carinho.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-10"
          style={stagger(2)}
        >
          <Link href="/register" className="pt-btn text-lg px-8 py-4">
            Começar grátis 🐾
          </Link>
          <a href="#como-funciona" className="pt-btn-ghost text-lg px-6 py-3">
            Como funciona ↓
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-down">
        <span className="text-2xl text-texto-muted">↓</span>
      </div>
    </section>
  );
}
