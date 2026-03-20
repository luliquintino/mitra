'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-creme">
      <div className="text-center space-y-4 p-8">
        <div className="text-6xl">🐾</div>
        <h1 className="text-2xl font-bold text-texto">Página não encontrada</h1>
        <p className="text-texto/60">A página que você procura não existe.</p>
        <Link
          href="/home"
          className="inline-block mt-4 px-6 py-3 bg-coral text-white rounded-xl font-medium hover:bg-coral/90 transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
