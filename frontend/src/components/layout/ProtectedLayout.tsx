'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificacoes } from '@/contexts/NotificacaoContext';
import { useToast } from '@/components/ToastContainer';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-coral flex items-center justify-center">
            <span className="text-white font-bold">M</span>
          </div>
          <div className="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-creme">
      <TopBar />
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

function TopBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { contNaoLidas } = useNotificacoes();
  const { info } = useToast();
  const lastCountRef = useRef(0);
  const isHome = pathname === '/home';

  // Monitor for new notifications and show toast
  useEffect(() => {
    if (contNaoLidas > lastCountRef.current && lastCountRef.current > 0) {
      const newCount = contNaoLidas - lastCountRef.current;
      info(
        `${newCount} nova notificação${newCount > 1 ? 's' : ''}`,
        'Clique para ver detalhes',
        5000,
      );
    }
    lastCountRef.current = contNaoLidas;
  }, [contNaoLidas, info]);

  return (
    <header className="sticky top-0 z-40 bg-creme">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-coral text-white flex items-center justify-center font-headline text-sm">M</div>
          <span className="font-semibold text-coral text-sm tracking-wider hidden sm:block">MITRA</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Notification Bell — hidden on home (has inline notifications) */}
          {!isHome && (
            <button
              onClick={() => router.push('/home')}
              className="relative text-texto-soft hover:text-texto transition-colors p-1.5 rounded-lg hover:bg-creme-dark"
              title="Notificações"
            >
              <span className="text-[18px]">🔔</span>
              {contNaoLidas > 0 && (
                <span className="absolute -top-1 -right-1 bg-coral text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse-badge">
                  {contNaoLidas > 9 ? '9+' : contNaoLidas}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => router.push('/minha-conta')}
            className="flex items-center hover:opacity-80 transition-opacity"
            title="Minha conta"
          >
            <div className="h-8 px-3 rounded-full bg-coral-light flex items-center justify-center ring-2 ring-transparent hover:ring-coral-light transition-all">
              <span className="text-coral text-xs font-semibold">
                {user?.nome?.split(' ')[0]}
              </span>
            </div>
          </button>
          <button
            onClick={logout}
            className="text-texto-soft hover:text-texto transition-colors p-1.5 rounded-lg hover:bg-creme-dark"
            title="Sair"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
