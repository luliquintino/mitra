'use client';

import { ScrollReveal } from './ScrollReveal';

const badges = [
  { emoji: '🔒', label: 'Dados seguros' },
  { emoji: '💚', label: '100% gratuito' },
  { emoji: '📱', label: 'Qualquer dispositivo' },
];

export function TrustSection() {
  return (
    <section className="bg-creme py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-row flex-wrap justify-center gap-4">
          {badges.map((b, i) => (
            <ScrollReveal key={b.label} delay={(i + 1) as 1 | 2 | 3}>
              <div className="bg-branco rounded-full px-6 py-3 shadow-card font-headline font-semibold text-texto flex items-center gap-2">
                <span className="text-xl">{b.emoji}</span>
                {b.label}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
