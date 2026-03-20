'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { petsApi } from '@/lib/api';
import { Pet } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { cn, especieLabel } from '@/lib/utils';

const ESPECIE_EMOJI: Record<string, string> = {
  CACHORRO: '🐶',
  GATO: '🐱',
  CAVALO: '🐴',
  PEIXE: '🐟',
  PASSARO: '🐦',
  ROEDOR: '🐹',
  COELHO: '🐰',
  REPTIL: '🦎',
  FURAO: '🦦',
  OUTRO: '🐾',
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
  ADESTRADOR:       ['home', 'saude', 'historico'],
  PASSEADOR:        ['home', 'saude'],
  FAMILIAR:         ['home'],
  AMIGO:            ['home'],
  OUTRO:            ['home'],
};

export default function PetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const petId = params?.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (petId) {
      petsApi
        .get(petId)
        .then(({ data }) => setPet(data))
        .catch(() => router.replace('/home'))
        .finally(() => setLoading(false));
    }
  }, [petId, user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pet) return null;

  const allowedTabIds = pet.meuRole
    ? (TABS_BY_ROLE[pet.meuRole] ?? ['home', 'saude', 'guarda', 'historico', 'perfil'])
    : ['home', 'saude', 'guarda', 'historico', 'perfil'];

  const visibleTabs = TABS.filter((t) => allowedTabIds.includes(t.id));

  const activeTab =
    visibleTabs.find((t) => {
      const fullPath = `/pets/${petId}${t.path}`;
      return t.path === '' ? pathname === fullPath : pathname.startsWith(fullPath);
    }) || visibleTabs[0];

  const navigateTo = (tab: (typeof TABS)[0]) => {
    router.push(`/pets/${petId}${tab.path}`);
  };

  const emoji = ESPECIE_EMOJI[pet.especie] || '🐾';

  return (
    <div className="min-h-screen bg-creme">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-creme">
        <div className="max-w-screen-xl mx-auto px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/home')}
              className="flex items-center gap-1 text-coral font-body text-sm hover:opacity-70 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Meus pets
            </button>
            {pet.status === 'ATIVO' ? (
              <span className="pt-badge bg-menta-light text-menta text-xs font-body">Ativo</span>
            ) : (
              <span className="text-xs font-body px-2 py-0.5 rounded-full bg-creme-dark text-texto-soft">
                Arquivado
              </span>
            )}
          </div>
        </div>

        {/* Pet name hero */}
        <div className="max-w-screen-xl mx-auto px-4 pt-3 pb-4 flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <h1 className="font-headline font-bold text-2xl tracking-tight text-texto">
            {pet.nome.toUpperCase()}
          </h1>
        </div>

        {/* Horizontal tab bar */}
        <div className="max-w-screen-xl mx-auto px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {visibleTabs.map((tab) => {
              const isActive = activeTab.id === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateTo(tab)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-body font-medium whitespace-nowrap transition-all duration-200',
                    isActive
                      ? 'pt-tab-active'
                      : 'pt-tab'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content area */}
      <main className="max-w-screen-xl mx-auto px-4 pt-6 pb-12">{children}</main>
    </div>
  );
}
