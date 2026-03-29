'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { petsApi } from '@/lib/api';
import { Pet } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ChevronLeft, PawPrint } from 'lucide-react';

const ESPECIE_EMOJI: Record<string, string> = {
  CACHORRO: '🐶', GATO: '🐱', CAVALO: '🐴', PEIXE: '🐟',
  PASSARO: '🐦', ROEDOR: '🐹', COELHO: '🐰', REPTIL: '🦎',
  FURAO: '🦦', OUTRO: '🐾',
};

const TABS = [
  { id: 'home', label: 'Home', path: '' },
  { id: 'saude', label: 'Saúde', path: '/saude' },
  { id: 'guarda', label: 'Guarda', path: '/guarda' },
  { id: 'historico', label: 'Histórico', path: '/historico' },
  { id: 'perfil', label: 'Perfil', path: '/perfil' },
];

const TABS_BY_ROLE: Record<string, string[]> = {
  TUTOR_PRINCIPAL:  ['home', 'saude', 'guarda', 'historico', 'perfil'],
  TUTOR_EMERGENCIA: ['home', 'saude', 'guarda', 'historico', 'perfil'],
  VETERINARIO:      ['home', 'saude', 'historico'],
  ADESTRADOR:       ['home', 'saude'],
  PASSEADOR:        ['home', 'saude'],
  PET_SITTER:       ['home', 'saude'],
  DAY_CARE:         ['home', 'saude'],
  HOTEL:            ['home', 'saude'],
  CRECHE:           ['home', 'saude'],
  CUIDADOR:         ['home', 'saude'],
  FAMILIAR:         ['home'],
  AMIGO:            ['home'],
  OUTRO:            ['home', 'saude'],
};

export default function PetLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const petId = params?.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  // Sliding indicator state
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (petId) {
      petsApi.get(petId)
        .then(({ data }) => setPet(data))
        .catch(() => router.replace('/home'))
        .finally(() => setLoading(false));
    }
  }, [petId, user, authLoading, router]);

  const allowedTabIds = pet?.meuRole
    ? (TABS_BY_ROLE[pet.meuRole] ?? ['home', 'saude', 'guarda', 'historico', 'perfil'])
    : ['home', 'saude', 'guarda', 'historico', 'perfil'];
  const visibleTabs = TABS.filter((t) => allowedTabIds.includes(t.id));

  const activeTab = visibleTabs.find((t) => {
    const fullPath = `/pets/${petId}${t.path}`;
    return t.path === '' ? pathname === fullPath : pathname.startsWith(fullPath);
  }) || visibleTabs[0];

  // Update sliding indicator position
  const updateIndicator = useCallback(() => {
    if (!activeTab) return;
    const el = tabRefs.current[activeTab.id];
    const container = tabsContainerRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - containerRect.left + container.scrollLeft,
        width: elRect.width,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator, loading]);

  // Scroll active tab into view
  useEffect(() => {
    if (activeTab) {
      const el = tabRefs.current[activeTab.id];
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface mg-mesh-bg">
        <div className="flex flex-col items-center gap-3">
          <PawPrint className="w-8 h-8 text-primary animate-pulse" />
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!pet) return null;

  const emoji = ESPECIE_EMOJI[pet.especie] || '🐾';

  return (
    <div className="min-h-screen bg-surface mg-mesh-bg">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-screen-xl mx-auto px-4 pt-3 pb-0">
          {/* Back + status */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-1 text-primary font-body text-sm hover:opacity-70 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
              Meus pets
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/pets/${petId}/emergencia`)}
                className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center hover:bg-rose-500/20 transition-colors relative"
                title="Modo Emergência"
              >
                <span className="text-sm">🚨</span>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
              </button>
              {pet.status === 'ATIVO' ? (
                <span className="mg-badge mg-badge-success text-xs">Ativo</span>
              ) : (
                <span className="mg-badge text-xs bg-surface-muted text-texto-soft">Arquivado</span>
              )}
            </div>
          </div>

          {/* Pet name */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{emoji}</span>
            <h1 className="font-headline font-bold text-xl tracking-tight text-texto">
              {pet.nome.toUpperCase()}
            </h1>
          </div>

          {/* Sliding tab bar */}
          <div className="relative" ref={tabsContainerRef}>
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {visibleTabs.map((tab) => {
                const isActive = activeTab?.id === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => { tabRefs.current[tab.id] = el; }}
                    onClick={() => router.push(`/pets/${petId}${tab.path}`)}
                    className={cn(
                      'px-4 py-2.5 text-sm font-headline whitespace-nowrap transition-all duration-200',
                      isActive
                        ? 'text-primary font-bold'
                        : 'text-texto-soft font-medium hover:text-primary'
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {/* Sliding indicator bar */}
            <div
              className="absolute bottom-0 h-[3px] rounded-t-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                transform: `translateX(${indicatorStyle.left}px)`,
                width: `${indicatorStyle.width}px`,
              }}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-screen-xl mx-auto px-4 pt-6 pb-12 animate-fade-in">{children}</main>
    </div>
  );
}
