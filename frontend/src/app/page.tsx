'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import {
  PawPrint,
  Heart,
  Shield,
  Clock,
  ArrowRight,
  Check,
  Star,
  Users,
  Zap,
  Lock,
  Smartphone,
  ChevronDown,
  Menu,
  X,
  Calendar,
  FileText,
  Activity,
  Stethoscope,
  QrCode,
  Bell,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';

/* ════════════════════════════════════════════
   MITRA Landing Page — Conversion-Focused
   ════════════════════════════════════════════ */

export default function RootPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Navbar ──────────────────────────────── */
  const Navbar = () => (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(124,58,237,0.06)] border-b border-white/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center shadow-lg shadow-[#7C3AED]/20 group-hover:shadow-[#7C3AED]/40 transition-shadow">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="font-headline text-xl font-extrabold bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] bg-clip-text text-transparent">
              MITRA
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="font-body text-sm font-medium text-[#6B7280] hover:text-[#7C3AED] transition-colors">
              Recursos
            </a>
            <a href="#use-cases" className="font-body text-sm font-medium text-[#6B7280] hover:text-[#7C3AED] transition-colors">
              Casos de uso
            </a>
            <a href="#how-it-works" className="font-body text-sm font-medium text-[#6B7280] hover:text-[#7C3AED] transition-colors">
              Como funciona
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="mg-btn-ghost text-sm">
              Entrar
            </Link>
            <Link href="/register" className="mg-btn text-sm !py-2.5 !px-5">
              Criar conta grátis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-[#7C3AED]/5 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#1E1B4B]" /> : <Menu className="w-6 h-6 text-[#1E1B4B]" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-2xl border-t border-white/30 shadow-xl">
          <div className="px-4 py-6 space-y-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block font-body text-base font-medium text-[#1E1B4B] hover:text-[#7C3AED]">
              Recursos
            </a>
            <a href="#use-cases" onClick={() => setMobileMenuOpen(false)} className="block font-body text-base font-medium text-[#1E1B4B] hover:text-[#7C3AED]">
              Casos de uso
            </a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block font-body text-base font-medium text-[#1E1B4B] hover:text-[#7C3AED]">
              Como funciona
            </a>
            <div className="pt-4 border-t border-[#F1F3F9] flex flex-col gap-3">
              <Link href="/login" className="mg-btn-secondary w-full text-center">
                Entrar
              </Link>
              <Link href="/register" className="mg-btn w-full text-center">
                Criar conta gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );

  /* ── Hero ─────────────────────────────────── */
  const Hero = () => (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7C3AED]/[0.07] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-[-5%] w-[400px] h-[400px] rounded-full bg-[#14B8A6]/[0.06] blur-[80px] pointer-events-none" />
      <div className="absolute top-40 right-[20%] w-[300px] h-[300px] rounded-full bg-[#F43F5E]/[0.05] blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C3AED]/[0.08] border border-[#7C3AED]/[0.12] mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14B8A6] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#14B8A6]" />
                </span>
                <span className="font-body text-sm font-semibold text-[#7C3AED]">
                  100% grátis para sempre
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={1}>
              <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E1B4B] leading-[1.1] tracking-tight">
                Seu pet merece{' '}
                <span className="bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#7C3AED] bg-clip-text text-transparent">
                  o melhor cuidado.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <p className="mt-6 text-lg sm:text-xl text-[#6B7280] leading-relaxed max-w-lg mx-auto lg:mx-0">
                Vacinas, medicamentos, guarda compartilhada e toda a rede de cuidado
                do seu pet em um só lugar. Simples, seguro e gratuito.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={3}>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register" className="mg-btn text-base !py-3.5 !px-8 group">
                  Cadastrar grátis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#use-cases" className="mg-btn-ghost text-base !py-3.5 !px-8 border border-[#7C3AED]/10">
                  Ver na prática
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={4}>
              <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start text-sm text-[#6B7280]">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#14B8A6]" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#14B8A6]" />
                  <span>Pronto em 2 minutos</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={2}>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[380px]">
                <div className="mg-card !p-0 overflow-hidden shadow-2xl shadow-[#7C3AED]/10 border border-white/40">
                  <div className="bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] p-5 pb-12">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl">
                        🐕
                      </div>
                      <div>
                        <p className="font-headline font-bold text-white text-lg">Luna</p>
                        <p className="text-white/70 text-sm">Golden Retriever, 5 anos</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 -mt-6 space-y-3 pb-5">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg shadow-black/[0.03] border border-white/60 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-[#14B8A6]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#6B7280] font-medium">Próxima vacina</p>
                        <p className="font-headline font-bold text-[#1E1B4B] text-sm">V10 — 15 Abr</p>
                      </div>
                      <div className="mg-badge-success text-xs">Em dia</div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg shadow-black/[0.03] border border-white/60 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F43F5E]/10 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-[#F43F5E]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#6B7280] font-medium">Conquistas</p>
                        <p className="font-headline font-bold text-[#1E1B4B] text-sm">6 de 12 desbloqueadas</p>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg shadow-black/[0.03] border border-white/60 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#7C3AED]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#6B7280] font-medium">Rede de cuidado</p>
                        <p className="font-headline font-bold text-[#1E1B4B] text-sm">4 pessoas conectadas</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 sm:-right-6 bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-xl shadow-[#7C3AED]/10 border border-white/40 animate-[float_3s_ease-in-out_infinite]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#14B8A6]/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-[#14B8A6]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] font-medium">Personalidade</p>
                      <p className="text-xs font-bold text-[#1E1B4B]">Aventureira 🏔️</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-3 -left-4 sm:-left-6 bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-xl shadow-[#14B8A6]/10 border border-white/40 animate-[float_3s_ease-in-out_infinite_0.5s]">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-xs font-bold border-2 border-white">A</div>
                      <div className="w-7 h-7 rounded-full bg-[#14B8A6] flex items-center justify-center text-white text-xs font-bold border-2 border-white">C</div>
                    </div>
                    <p className="text-xs font-bold text-[#1E1B4B]">2 tutores</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-[#9CA3AF]">
        <span className="text-xs font-medium">Scroll</span>
        <div className="w-6 h-10 rounded-full border-2 border-[#9CA3AF]/30 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 rounded-full bg-[#7C3AED]/40 animate-bounce" />
        </div>
      </div>
    </section>
  );

  /* ── Features ────────────────────────────── */
  const features = [
    {
      icon: Heart,
      title: 'Saúde completa',
      desc: 'Vacinas, medicamentos, sintomas e carteira de vacinação digital. Alertas inteligentes avisam quando algo precisa de atenção.',
      color: '#14B8A6',
      bgClass: 'mg-card-saude',
    },
    {
      icon: Calendar,
      title: 'Agenda inteligente',
      desc: 'Banhos, consultas, vermífugos e passeios. Compromissos recorrentes com lembretes visuais no calendário.',
      color: '#6366F1',
      bgClass: 'mg-card-agenda',
    },
    {
      icon: Users,
      title: 'Guarda compartilhada',
      desc: 'Tutores, veterinários, passeadores — cada um com seu nível de acesso. Transparência total sobre quem faz o quê.',
      color: '#7C3AED',
      bgClass: 'mg-card-guarda',
    },
    {
      icon: Shield,
      title: 'Modo emergência',
      desc: 'QR Code na coleira com dados vitais. Se seu pet se perder, quem encontrar acessa as informações de emergência.',
      color: '#F43F5E',
      bgClass: '',
    },
    {
      icon: Bell,
      title: 'Lembretes inteligentes',
      desc: 'O MITRA avisa quando a vacina está vencendo, quando o pet está sedentário ou precisa de check-up geriátrico.',
      color: '#F59E0B',
      bgClass: 'mg-card-historico',
    },
    {
      icon: Trophy,
      title: 'Conquistas e personalidade',
      desc: 'Seu pet ganha conquistas conforme você cuida dele. Descubra o arquétipo de personalidade e colecione badges.',
      color: '#EC4899',
      bgClass: '',
    },
  ];

  const Features = () => (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7C3AED]/[0.06] border border-[#7C3AED]/10 mb-4">
              <Zap className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Recursos</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E1B4B] leading-tight">
              Tudo que seu pet precisa.{' '}
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent">
                Nada que você não precise.
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="mt-4 text-lg text-[#6B7280]">
              Seis módulos que simplificam a vida de quem ama seu pet de verdade.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i + 1}>
              <div className={`mg-card ${f.bgClass} h-full group cursor-default`}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: `${f.color}12` }}
                >
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="font-headline text-lg font-bold text-[#1E1B4B] mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── Use Cases ───────────────────────────── */
  const useCases = [
    {
      emoji: '🐕',
      persona: 'Ana, tutora da Luna',
      situation: 'Guarda compartilhada com o ex',
      before: 'Esquecia vacinas, perdia recibos do vet e brigava por falta de comunicação sobre a saúde da Luna.',
      after: 'Ana e Carlos compartilham tudo no MITRA. Cada um vê o histórico, recebe alertas e sabe quando é a vez de quem.',
      features: ['Histórico unificado', 'Alertas de vacina', 'Turnos de guarda'],
      color: '#7C3AED',
      icon: Users,
    },
    {
      emoji: '🩺',
      persona: 'Dr. Roberto, veterinário',
      situation: 'Acesso ao histórico dos pacientes',
      before: 'Tutores esqueciam a carteira de vacinação. Informações importantes se perdiam entre consultas.',
      after: 'O tutor adiciona Dr. Roberto no MITRA. Ele acessa o histórico, registra consultas e recomenda vacinas — tudo em tempo real.',
      features: ['Acesso controlado', 'Registro de consultas', 'Recomendações'],
      color: '#14B8A6',
      icon: Stethoscope,
    },
    {
      emoji: '🚶',
      persona: 'Pedro, passeador',
      situation: 'Check-in quando busca os pets',
      before: 'Tutores não sabiam se o passeio realmente aconteceu. Falta de confiança e transparência.',
      after: 'Pedro faz check-in ao iniciar o passeio. O tutor vê a sessão ativa em tempo real e a duração. Ao finalizar, Pedro adiciona fotos e observações.',
      features: ['Check-in/check-out', 'Sessão em tempo real', 'Fotos e observações'],
      color: '#F59E0B',
      icon: Activity,
    },
  ];

  const UseCases = () => (
    <section id="use-cases" className="py-20 sm:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F1F3F9]/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14B8A6]/[0.08] border border-[#14B8A6]/10 mb-4">
              <Star className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span className="text-xs font-semibold text-[#14B8A6] uppercase tracking-wider">Na prática</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E1B4B] leading-tight">
              Veja como o MITRA resolve{' '}
              <span className="bg-gradient-to-r from-[#14B8A6] to-[#0D9488] bg-clip-text text-transparent">
                problemas reais
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="mt-4 text-lg text-[#6B7280]">
              Situações que todo pet parent conhece — e como o MITRA transforma cada uma.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {useCases.map((uc, i) => (
            <ScrollReveal key={uc.persona} delay={i + 1}>
              <div className="mg-card h-full flex flex-col !p-0 overflow-hidden">
                {/* Header com persona */}
                <div className="p-6 pb-4" style={{ background: `${uc.color}08` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${uc.color}15` }}
                    >
                      <uc.icon className="w-5 h-5" style={{ color: uc.color }} />
                    </div>
                    <div>
                      <h3 className="font-headline text-base font-bold text-[#1E1B4B] leading-tight">
                        {uc.persona}
                      </h3>
                      <p className="text-xs font-medium" style={{ color: uc.color }}>
                        {uc.situation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Antes / Depois */}
                <div className="px-6 pb-5 flex-1 flex flex-col gap-3">
                  {/* Antes */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-[#F43F5E]/10 flex items-center justify-center">
                        <X className="w-3 h-3 text-[#F43F5E]" />
                      </div>
                    </div>
                    <p className="text-sm text-[#6B7280] leading-relaxed">{uc.before}</p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-2 py-1">
                    <div className="flex-1 h-px bg-gradient-to-r from-[#F43F5E]/20 to-[#14B8A6]/20" />
                    <ArrowRight className="w-3.5 h-3.5 text-[#14B8A6]" />
                    <div className="flex-1 h-px bg-[#14B8A6]/20" />
                  </div>

                  {/* Depois */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-[#14B8A6]/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#14B8A6]" />
                      </div>
                    </div>
                    <p className="text-sm text-[#374151] leading-relaxed font-medium">{uc.after}</p>
                  </div>

                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-3">
                    {uc.features.map((feat) => (
                      <span
                        key={feat}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: `${uc.color}10`, color: uc.color }}
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── How It Works ────────────────────────── */
  const steps = [
    {
      num: '01',
      title: 'Crie sua conta',
      desc: 'Cadastro rápido e grátis. Leva menos de 2 minutos.',
      icon: Smartphone,
    },
    {
      num: '02',
      title: 'Adicione seu pet',
      desc: 'Cadastre nome, raça, vacinas e medicamentos. O MITRA organiza tudo automaticamente.',
      icon: PawPrint,
    },
    {
      num: '03',
      title: 'Monte sua rede',
      desc: 'Convide co-tutores, veterinários e passeadores. Cada um vê só o que você permitir.',
      icon: Users,
    },
    {
      num: '04',
      title: 'Cuide com tranquilidade',
      desc: 'Receba alertas, acompanhe a saúde e tenha tudo sob controle — de qualquer lugar.',
      icon: Zap,
    },
  ];

  const HowItWorks = () => (
    <section id="how-it-works" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6366F1]/[0.08] border border-[#6366F1]/10 mb-4">
              <Clock className="w-3.5 h-3.5 text-[#6366F1]" />
              <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider">Como funciona</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E1B4B] leading-tight">
              Comece em{' '}
              <span className="bg-gradient-to-r from-[#6366F1] to-[#818CF8] bg-clip-text text-transparent">
                4 passos simples
              </span>
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-px bg-gradient-to-r from-[#7C3AED]/20 via-[#14B8A6]/20 to-[#F59E0B]/20" />

          {steps.map((s, i) => (
            <ScrollReveal key={s.num} delay={i + 1}>
              <div className="mg-card text-center relative h-full">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#7C3AED]/20">
                  <span className="font-headline text-xl font-extrabold text-white">{s.num}</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-[#1E1B4B] mb-3">
                  {s.title}
                </h3>
                <p className="text-[#6B7280] leading-relaxed text-sm">
                  {s.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── Trust ───────────────────────────────── */
  const trustItems = [
    {
      icon: Lock,
      title: 'Dados protegidos',
      desc: 'Seus dados e do seu pet estão seguros. Privacidade é prioridade absoluta.',
      color: '#7C3AED',
    },
    {
      icon: Star,
      title: 'Feito por pet parents',
      desc: 'Criado por quem entende a rotina de cuidar de um pet de verdade.',
      color: '#F59E0B',
    },
    {
      icon: Shield,
      title: 'Você no controle',
      desc: 'Você decide quem vê o quê. Cada pessoa tem permissões configuráveis por você.',
      color: '#14B8A6',
    },
  ];

  const Trust = () => (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F59E0B]/[0.08] border border-[#F59E0B]/10 mb-4">
              <Shield className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">Confiança</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-[#1E1B4B] leading-tight">
              Por que confiar no MITRA?
            </h2>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {trustItems.map((item, i) => (
            <ScrollReveal key={item.title} delay={i + 1}>
              <div className="mg-card text-center h-full">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: `${item.color}12` }}
                >
                  <item.icon className="w-7 h-7" style={{ color: item.color }} />
                </div>
                <h3 className="font-headline text-lg font-bold text-[#1E1B4B] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );

  /* ── Final CTA ──────────────────────────── */
  const FinalCTA = () => (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <ScrollReveal>
          <div className="text-6xl mb-6">🐾</div>
        </ScrollReveal>

        <ScrollReveal delay={1}>
          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Seu pet já tem tudo que precisa.{' '}
            <span className="text-white/70">Só falta o MITRA.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={2}>
          <p className="mt-6 text-lg text-white/70 max-w-xl mx-auto">
            Junte-se a tutores que cuidam com mais organização, transparência e tranquilidade.
            Cadastro grátis, sem cartão, sem compromisso.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={3}>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#7C3AED] font-headline font-bold py-4 px-10 rounded-xl hover:bg-white/90 transition-all hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5 text-lg"
            >
              Criar minha conta grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={4}>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center text-sm text-white/60">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#14B8A6]" />
              <span>100% grátis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#14B8A6]" />
              <span>Pronto em 2 minutos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#14B8A6]" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#14B8A6]" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );

  /* ── Footer ──────────────────────────────── */
  const Footer = () => (
    <footer className="bg-[#1E1B4B] text-white/70 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center">
                <PawPrint className="w-4 h-4 text-white" />
              </div>
              <span className="font-headline text-lg font-extrabold text-white">MITRA</span>
            </div>
            <p className="text-sm leading-relaxed">
              A plataforma completa para pet parents que levam o cuidado a sério.
            </p>
          </div>

          <div>
            <h4 className="font-headline font-bold text-white text-sm mb-4 uppercase tracking-wider">Produto</h4>
            <ul className="space-y-2.5">
              <li><a href="#features" className="text-sm hover:text-[#A78BFA] transition-colors">Recursos</a></li>
              <li><a href="#use-cases" className="text-sm hover:text-[#A78BFA] transition-colors">Casos de uso</a></li>
              <li><a href="#how-it-works" className="text-sm hover:text-[#A78BFA] transition-colors">Como funciona</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline font-bold text-white text-sm mb-4 uppercase tracking-wider">Suporte</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm hover:text-[#A78BFA] transition-colors">Central de ajuda</a></li>
              <li><a href="#" className="text-sm hover:text-[#A78BFA] transition-colors">Contato</a></li>
              <li><a href="#" className="text-sm hover:text-[#A78BFA] transition-colors">Feedback</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline font-bold text-white text-sm mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm hover:text-[#A78BFA] transition-colors">Privacidade</a></li>
              <li><a href="#" className="text-sm hover:text-[#A78BFA] transition-colors">Termos de uso</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} MITRA. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <span>Feito com</span>
            <Heart className="w-3 h-3 text-[#F43F5E] fill-[#F43F5E]" />
            <span>para pet parents</span>
            <span className="text-lg leading-none">🐾</span>
          </div>
        </div>
      </div>
    </footer>
  );

  const floatKeyframes = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
  `;
  const FloatStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: floatKeyframes }} />
  );

  /* ── Main Render ─────────────────────────── */
  return (
    <main className="font-body mg-mesh-bg">
      <FloatStyles />
      <Navbar />
      <Hero />
      <Features />
      <UseCases />
      <HowItWorks />
      <Trust />
      <FinalCTA />
      <Footer />
    </main>
  );
}
