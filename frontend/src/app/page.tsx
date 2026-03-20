'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { PricingTeaser } from '@/components/landing/PricingTeaser';
import { Footer } from '@/components/landing/Footer';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

export default function RootPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, loading, router]);

  return (
    <main className="font-body">
      <Navbar />
      <HeroSection />

      {/* ProblemaSection — inline */}
      <section className="bg-creme-dark py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-headline font-extrabold text-2xl md:text-3xl text-texto leading-snug">
              Cuidar de um pet é lindo.<br />
              Organizar tudo... nem tanto.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <ScrollReveal delay={1}>
              <div className="bg-branco rounded-xl p-6 shadow-card">
                <span className="text-4xl">📋</span>
                <p className="font-headline font-semibold text-texto mt-3">Vacinas em papéis perdidos</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <div className="bg-branco rounded-xl p-6 shadow-card">
                <span className="text-4xl">🤝</span>
                <p className="font-headline font-semibold text-texto mt-3">Guarda compartilhada sem comunicação</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={3}>
              <div className="bg-branco rounded-xl p-6 shadow-card">
                <span className="text-4xl">📱</span>
                <p className="font-headline font-semibold text-texto mt-3">Informações espalhadas em 5 apps</p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={4}>
            <p className="mt-10 font-headline font-bold text-coral text-lg">
              O MITRA resolve tudo isso →
            </p>
          </ScrollReveal>
        </div>
      </section>

      <FeaturesSection />
      <HowItWorksSection />
      <TrustSection />
      <PricingTeaser />
      <Footer />
    </main>
  );
}
