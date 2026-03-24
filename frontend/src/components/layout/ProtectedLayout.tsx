'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificacoes } from '@/contexts/NotificacaoContext';
import { useToast } from '@/components/ToastContainer';
import { Bell, LogOut, PawPrint } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-surface mg-mesh-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow-primary">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-surface mg-mesh-bg">
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

  useEffect(() => {
    if (contNaoLidas > lastCountRef.current && lastCountRef.current > 0) {
      const newCount = contNaoLidas - lastCountRef.current;
      info(
        `${newCount} nova notificacao${newCount > 1 ? 's' : ''}`,
        'Clique para ver detalhes',
        5000,
      );
    }
    lastCountRef.current = contNaoLidas;
  }, [contNaoLidas, info]);

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/30">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center shadow-sm">
            <PawPrint className="w-4 h-4" />
          </div>
          <span className="font-headline font-bold text-transparent bg-gradient-to-r from-primary to-primary-light bg-clip-text text-sm tracking-wider hidden sm:block">MITRA</span>
        </button>

        <div className="flex items-center gap-1.5">
          {!isHome && (
            <button
              onClick={() => router.push('/home')}
              className="relative text-texto-soft hover:text-primary transition-colors p-2 rounded-xl hover:bg-primary/5"
              title="Notificacoes"
            >
              <Bell className="w-[18px] h-[18px]" />
              {contNaoLidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center animate-pulse-badge">
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
            <div className="h-8 px-3 rounded-full bg-primary/8 flex items-center justify-center ring-2 ring-transparent hover:ring-primary/20 transition-all">
              <span className="text-primary text-xs font-semibold font-headline">
                {user?.nome?.split(' ')[0]}
              </span>
            </div>
          </button>

          <button
            onClick={logout}
            className="text-texto-soft hover:text-primary transition-colors p-2 rounded-xl hover:bg-primary/5"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
