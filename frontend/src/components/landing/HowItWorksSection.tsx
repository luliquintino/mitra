'use client';

import { ScrollReveal } from './ScrollReveal';

const steps = [
  {
    num: '1',
    title: 'Cadastre seu pet',
    description: 'Nome, espécie, raça. 30 segundos.',
    emoji: '🐾',
  },
  {
    num: '2',
    title: 'Convide quem cuida',
    description: 'Veterinário, passeador, familiar.',
    emoji: '👥',
  },
  {
    num: '3',
    title: 'Tudo organizado',
    description: 'Vacinas, consultas, guarda — num lugar só.',
    emoji: '✨',
  },
];

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="bg-creme-dark py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="pt-section-title text-center">Como funciona</h2>
        </ScrollReveal>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-0 mt-16">
          {steps.map((step, i) => (
            <div key={step.num} className="flex flex-col md:flex-row items-center flex-1 w-full">
              <ScrollReveal delay={(i + 1) as 1 | 2 | 3} className="flex flex-col items-center text-center flex-1">
                <div className="bg-coral text-branco w-12 h-12 rounded-full font-headline font-bold text-xl flex items-center justify-center">
                  {step.num}
                </div>
                <h3 className="text-lg font-headline font-bold text-texto mt-4">{step.title}</h3>
                <p className="text-texto-soft mt-2 text-sm leading-relaxed max-w-[220px]">
                  {step.description}
                </p>
                <span className="text-2xl mt-2">{step.emoji}</span>
              </ScrollReveal>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <>
                  {/* Horizontal dotted line (desktop) */}
                  <div className="hidden md:block w-full max-w-[60px] border-t-2 border-dashed border-coral mt-6 mx-2 flex-shrink-0" />
                  {/* Vertical dotted line (mobile) */}
                  <div className="md:hidden h-8 border-l-2 border-dashed border-coral my-2 flex-shrink-0" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
