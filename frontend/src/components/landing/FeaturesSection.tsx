'use client';

import { ScrollReveal } from './ScrollReveal';

const features = [
  {
    emoji: '🏥',
    title: 'Saúde em dia',
    bullets: 'Vacinas e doses • Medicamentos ativos • Sintomas registrados',
    bg: 'bg-rosa-light',
  },
  {
    emoji: '📅',
    title: 'Agenda organizada',
    bullets: 'Consultas marcadas • Compromissos recorrentes • Lembretes automáticos',
    bg: 'bg-azul-light',
  },
  {
    emoji: '🤝',
    title: 'Guarda compartilhada',
    bullets: 'Divisão entre tutores • Solicitações formais • Histórico de custódia',
    bg: 'bg-menta-light',
  },
  {
    emoji: '📖',
    title: 'Tudo registrado',
    bullets: 'Timeline completa • Eventos por categoria • Compartilhe com o vet',
    bg: 'bg-amarelo-light',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-creme py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="pt-section-title text-center">Tudo que seu pet precisa</h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={(i + 1) as 1 | 2 | 3 | 4}>
              <div className={`${f.bg} rounded-xl p-8 h-full`}>
                <span className="text-5xl block mb-4">{f.emoji}</span>
                <h3 className="text-xl font-headline font-bold text-texto">{f.title}</h3>
                <p className="text-texto-soft mt-2 leading-relaxed">{f.bullets}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
