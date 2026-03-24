'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function PrestadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Redirecionar se não for prestador
  if (user && user.tipoUsuario !== 'PRESTADOR' && user.tipoUsuario !== 'AMBOS') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="pt-card text-center max-w-md">
          <p className="text-lg font-semibold text-texto mb-2">Acesso restrito</p>
          <p className="text-sm text-texto-soft mb-6">Você precisa ser um prestador de serviços para acessar esta área.</p>
          <Link href="/home" className="pt-btn">
            Voltar para home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto">
        {/* Header com navegação */}
        <div className="bg-white/70 backdrop-blur-xl">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-texto">Área do Prestador</h1>
            <p className="text-sm text-texto-soft mt-1">Gerenciar seus pets e serviços</p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
