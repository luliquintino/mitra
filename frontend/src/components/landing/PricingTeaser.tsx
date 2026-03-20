'use client';

import Link from 'next/link';

export function PricingTeaser() {
  return (
    <section className="relative bg-gradient-to-br from-coral to-rosa py-20 px-6 overflow-hidden">
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-branco">
          Seu pet merece o melhor cuidado.
        </h2>
        <p className="text-branco/80 text-lg mt-4">
          Comece agora. É grátis.
        </p>
        <Link
          href="/register"
          className="inline-block mt-8 bg-branco text-coral font-headline font-bold rounded-full px-8 py-4 hover:scale-105 active:scale-95 transition-transform shadow-lg text-lg"
        >
          Criar conta grátis 🐾
        </Link>
      </div>
    </section>
  );
}
