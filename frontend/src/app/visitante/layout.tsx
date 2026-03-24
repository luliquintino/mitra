'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

const TABS = [
  { label: 'Pets', path: '/visitante/pets' },
  { label: 'Convites', path: '/visitante/convites' },
];

export default function VisitanteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl">
          <div className="px-4 py-4">
            <div className="flex items-center gap-2">
              <Link href="/home" className="text-texto-soft hover:text-texto transition-colors">
                <ChevronLeft size={16} />
              </Link>
              <h1 className="text-2xl font-bold text-texto">Acompanhamento</h1>
            </div>
            <p className="text-sm text-texto-soft mt-1">Pets que você acompanha</p>
          </div>

          {/* Tabs */}
          <div className="px-4 flex gap-2 pb-3">
            {TABS.map((tab) => (
              <Link
                key={tab.path}
                href={tab.path}
                className={cn(
                  'pt-tab',
                  pathname.startsWith(tab.path) && 'pt-tab-active',
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
