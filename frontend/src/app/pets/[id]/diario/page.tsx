'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { eventsApi } from '@/lib/api';
import { Evento } from '@/types';
import { cn } from '@/lib/utils';

// ─── Constants ──────────────────────────────────────────────────────────────────

const ROTATIONS = ['rotate-1', '-rotate-2', 'rotate-3', '-rotate-1', 'rotate-2', '-rotate-3'];
const CARD_COLORS = [
  'bg-white',
  'bg-azul-light',
  'bg-rosa-light',
  'bg-creme-dark',
  'bg-coral-light',
  'bg-white',
];
const STICKER_EMOJIS = ['🐾', '❤️', '⭐', '🍎', '🧸', '🤝'];

// ─── Component ──────────────────────────────────────────────────────────────────

export default function DiarioPage() {
  const params = useParams();
  const petId = params?.id as string;

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await eventsApi.historico(petId);
        const data = res.data;
        const list = Array.isArray(data) ? data : (data as any)?.eventos || [];
        setEventos(list);
      } catch {
        setEventos([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [petId]);

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    return eventos.filter((e) => {
      const d = new Date(e.criadoEm);
      return d.getMonth() === m && d.getFullYear() === y;
    }).length;
  }, [eventos]);

  const uniqueTypes = useMemo(() => {
    return new Set(eventos.map((e) => e.tipo)).size;
  }, [eventos]);

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Title */}
      <div className="mb-10 text-center relative">
        <h2 className="font-headline font-extrabold text-5xl tracking-tighter text-amarelo mb-2">
          Diário de Aventuras
        </h2>
        <p className="text-azul font-medium text-lg">
          Colecione momentos felizes com seu melhor amigo!
        </p>
        {/* Floating stickers */}
        <div className="absolute -top-4 -left-2 opacity-20 pointer-events-none">
          <span className="text-6xl text-rosa">
            🐾
          </span>
        </div>
        <div className="absolute top-10 -right-4 opacity-20 pointer-events-none rotate-12">
          <span className="text-7xl text-amarelo">
            🍎
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center mb-12">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('mitra:register-event'))}
          className="group relative bg-amarelo-light text-amarelo px-10 py-6 rounded-full font-headline font-bold text-xl flex items-center gap-4 shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <div className="bg-white p-3 rounded-full group-hover:rotate-12 transition-transform">
            <span className="text-amarelo text-3xl">
              📸
            </span>
          </div>
          Adicionar Nova Foto
          <div className="absolute -top-3 -right-3 bg-rosa text-white px-3 py-1 rounded-full text-xs font-bold rotate-12">
            NOVO
          </div>
        </button>
      </div>

      {/* Bento Mural Gallery */}
      {eventos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {eventos.map((evento, i) => {
            const isFirst = i === 0;
            const isWide = i % 5 === 4;
            const rotation = ROTATIONS[i % ROTATIONS.length];
            const color = CARD_COLORS[i % CARD_COLORS.length];
            const sticker = STICKER_EMOJIS[i % STICKER_EMOJIS.length];

            return (
              <div
                key={evento.id}
                className={cn(
                  'relative group',
                  isFirst && 'md:col-span-2 md:row-span-2',
                  isWide && !isFirst && 'md:col-span-2',
                )}
              >
                <div
                  className={cn(
                    color,
                    'p-4 rounded-xl shadow-sm transition-transform duration-500',
                    rotation,
                    'group-hover:rotate-0',
                  )}
                >
                  {/* Event card content */}
                  <div className="relative overflow-hidden rounded-lg aspect-square mb-3 bg-creme-dark flex items-center justify-center">
                    <span className="text-6xl opacity-20">
                      {sticker}
                    </span>
                    {/* Sticker overlay */}
                    <div className="absolute top-2 right-2 rotate-12">
                      <span className="text-rosa text-2xl">
                        {sticker}
                      </span>
                    </div>
                  </div>
                  <p className="font-headline font-bold text-texto px-1">
                    {evento.descricao || evento.tipo}
                  </p>
                  <p className="font-body text-sm text-texto-soft/60 px-1">
                    {new Date(evento.criadoEm).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20">
          <span className="text-8xl opacity-20 mb-4">
            🐾
          </span>
          <p className="font-headline font-bold text-2xl text-texto-soft/40 mb-2">
            Nenhuma aventura ainda!
          </p>
          <p className="text-texto-soft/40">Registre o primeiro momento do seu pet</p>
        </div>
      )}

      {/* Stats Section */}
      {eventos.length > 0 && (
        <section className="mt-16 mb-12 p-8 bg-creme-dark rounded-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-headline font-bold text-2xl text-amarelo mb-2">
                Estatísticas da Diversão
              </h3>
              <p className="text-azul">Acompanhe as aventuras!</p>
            </div>
            <div className="flex gap-6">
              <div className="bg-white/80 backdrop-blur px-6 py-4 rounded-xl text-center min-w-[120px]">
                <p className="text-3xl font-headline font-bold text-rosa">{eventos.length}</p>
                <p className="text-xs font-label uppercase tracking-widest text-texto-soft">
                  Total
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur px-6 py-4 rounded-xl text-center min-w-[120px]">
                <p className="text-3xl font-headline font-bold text-azul">{thisMonthCount}</p>
                <p className="text-xs font-label uppercase tracking-widest text-texto-soft">
                  Este mês
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur px-6 py-4 rounded-xl text-center min-w-[120px]">
                <p className="text-3xl font-headline font-bold text-amarelo">{uniqueTypes}</p>
                <p className="text-xs font-label uppercase tracking-widest text-texto-soft">
                  Tipos
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
