'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { eventsApi } from '@/lib/api';
import { Evento } from '@/types';
import { cn, formatDate, eventoIcon } from '@/lib/utils';

// ─── Filter Categories ──────────────────────────────────────────────────────────

type FilterKey = 'TODOS' | 'SAUDE' | 'GUARDA' | 'CONSULTA' | 'ATIVIDADE';

const FILTER_PILLS: { key: FilterKey; label: string; color: string }[] = [
  { key: 'TODOS', label: 'Todos', color: 'bg-coral text-white' },
  { key: 'SAUDE', label: 'Saude', color: 'bg-rosa text-white' },
  { key: 'GUARDA', label: 'Guarda', color: 'bg-azul text-white' },
  { key: 'CONSULTA', label: 'Consulta', color: 'bg-menta text-white' },
  { key: 'ATIVIDADE', label: 'Atividade', color: 'bg-amarelo text-white' },
];

const FILTER_TIPOS: Record<FilterKey, string[]> = {
  TODOS: [],
  SAUDE: [
    'VACINA_REGISTRADA',
    'VACINA_ATUALIZADA',
    'MEDICAMENTO_ADMINISTRADO',
    'SINTOMA_REGISTRADO',
    'PLANO_SAUDE_ATUALIZADO',
  ],
  GUARDA: [
    'GUARDA_ALTERADA',
    'CHECK_IN_REGISTRADO',
    'CHECK_OUT_REGISTRADO',
    'TUTOR_ADICIONADO',
    'TUTOR_REMOVIDO',
  ],
  CONSULTA: [
    'CONSULTA_REGISTRADA',
    'EXAME_ANEXADO',
    'COMPROMISSO_CRIADO',
  ],
  ATIVIDADE: [
    'PET_CRIADO',
    'PET_ARQUIVADO',
    'PET_REATIVADO',
    'VISITA_REGISTRADA',
    'ALIMENTACAO_REGISTRADA',
    'SESSAO_REGISTRADA',
    'PROGRESSO_REGISTRADO',
    'OBSERVACAO_REGISTRADA',
    'SOLICITACAO_CRIADA',
    'SOLICITACAO_APROVADA',
    'SOLICITACAO_RECUSADA',
    'SOLICITACAO_EXPIRADA',
  ],
};

// ─── Diário Constants ────────────────────────────────────────────────────────────

const ROTATIONS = ['rotate-1', '-rotate-2', 'rotate-3', '-rotate-1', 'rotate-2', '-rotate-3'];
const CARD_COLORS = [
  'bg-white',
  'bg-azul-light',
  'bg-rosa-light',
  'bg-creme-dark',
  'bg-coral-light',
  'bg-white',
];
const STICKER_EMOJIS = ['\uD83D\uDC3E', '\u2764\uFE0F', '\u2B50', '\uD83C\uDF4E', '\uD83E\uDDF8', '\uD83E\uDD1D'];

// ─── Helpers ─────────────────────────────────────────────────────────────────────

function groupByMonth(eventos: Evento[]): [string, Evento[]][] {
  const groups: Record<string, Evento[]> = {};
  for (const ev of eventos) {
    const d = new Date(ev.criadoEm);
    const mesAno = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (!groups[mesAno]) groups[mesAno] = [];
    groups[mesAno].push(ev);
  }
  return Object.entries(groups);
}

function eventoBorderColor(tipo: string): string {
  if (FILTER_TIPOS.SAUDE.includes(tipo)) return 'border-rosa';
  if (FILTER_TIPOS.GUARDA.includes(tipo)) return 'border-azul';
  if (FILTER_TIPOS.CONSULTA.includes(tipo)) return 'border-menta';
  if (FILTER_TIPOS.ATIVIDADE.includes(tipo)) return 'border-amarelo';
  return 'border-coral';
}

function eventoDotColor(tipo: string): string {
  if (FILTER_TIPOS.SAUDE.includes(tipo)) return 'bg-rosa';
  if (FILTER_TIPOS.GUARDA.includes(tipo)) return 'bg-azul';
  if (FILTER_TIPOS.CONSULTA.includes(tipo)) return 'bg-menta';
  if (FILTER_TIPOS.ATIVIDADE.includes(tipo)) return 'bg-amarelo';
  return 'bg-coral';
}

// ─── Sub-tab type ────────────────────────────────────────────────────────────────

type SubTab = 'timeline' | 'diario';

// ─── Main Component ──────────────────────────────────────────────────────────────

export default function HistoricoPage() {
  const params = useParams();
  const petId = params?.id as string;

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SubTab>('timeline');
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(() => new Set<FilterKey>(['TODOS']));

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function loadData() {
      try {
        const res = await eventsApi.historico(petId);
        const data = res.data;
        const list = Array.isArray(data) ? data : (data as Record<string, unknown>)?.eventos as Evento[] || [];
        setEventos(list);
      } catch {
        setEventos([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [petId]);

  // ─── Filter Logic ───────────────────────────────────────────────────────────

  function toggleFilter(key: FilterKey) {
    setActiveFilters((prev) => {
      const next = new Set<FilterKey>(prev);
      if (key === 'TODOS') {
        return new Set<FilterKey>(['TODOS']);
      }
      next.delete('TODOS');
      if (next.has(key)) {
        next.delete(key);
        if (next.size === 0) return new Set<FilterKey>(['TODOS']);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const filteredEventos = useMemo(() => {
    if (activeFilters.has('TODOS')) return eventos;
    const allowedTipos = new Set<string>();
    activeFilters.forEach((f) => {
      FILTER_TIPOS[f].forEach((t) => allowedTipos.add(t));
    });
    return eventos.filter((e) => allowedTipos.has(e.tipo));
  }, [eventos, activeFilters]);

  const groups = useMemo(() => groupByMonth(filteredEventos), [filteredEventos]);

  // ─── Diário Stats ──────────────────────────────────────────────────────────

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
    <div className="space-y-4 animate-fade-in">
      {/* Sub-tab Switcher */}
      <div className="flex gap-2 p-1 bg-creme-dark/40 rounded-2xl">
        <button
          onClick={() => setActiveTab('timeline')}
          className={cn(
            'flex-1 py-2.5 px-4 rounded-xl font-headline font-bold text-sm transition-all duration-200',
            activeTab === 'timeline'
              ? 'bg-white text-coral shadow-sm'
              : 'text-texto-soft hover:text-texto',
          )}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('diario')}
          className={cn(
            'flex-1 py-2.5 px-4 rounded-xl font-headline font-bold text-sm transition-all duration-200',
            activeTab === 'diario'
              ? 'bg-white text-coral shadow-sm'
              : 'text-texto-soft hover:text-texto',
          )}
        >
          Diario
        </button>
      </div>

      {/* ─── TIMELINE TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {FILTER_PILLS.map((pill) => (
              <button
                key={pill.key}
                onClick={() => toggleFilter(pill.key)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-bold font-label uppercase tracking-wider transition-all duration-200',
                  activeFilters.has(pill.key)
                    ? pill.color
                    : 'bg-creme-dark/50 text-texto-soft hover:bg-creme-dark',
                )}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Event Count */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-texto-soft">
              {filteredEventos.length} evento{filteredEventos.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Empty State */}
          {filteredEventos.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="text-4xl">📋</div>
              <div>
                <p className="font-headline font-bold text-texto text-lg">
                  Linha do tempo vazia
                </p>
                <p className="text-sm text-texto-soft mt-1 max-w-xs mx-auto">
                  A linha do tempo da vida do seu pet aparecera aqui conforme os
                  eventos forem registrados.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map(([mesAno, monthEvents]) => (
                <div key={mesAno} className="space-y-1">
                  {/* Month separator */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-creme-dark/30" />
                    <span className="font-headline font-bold text-coral text-xs uppercase tracking-widest whitespace-nowrap capitalize">
                      {mesAno}
                    </span>
                    <div className="h-px flex-1 bg-creme-dark/30" />
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-12">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-coral/40 via-rosa/30 to-coral/10 rounded-full" />

                    <div className="space-y-4">
                      {monthEvents.map((evento, i) => (
                        <div
                          key={evento.id}
                          className="relative animate-fade-in"
                          style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                        >
                          {/* Dot */}
                          <div
                            className={cn(
                              'absolute -left-8 top-3 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10',
                              eventoDotColor(evento.tipo),
                            )}
                          />

                          {/* Event card */}
                          <div
                            className={cn(
                              'bg-white rounded-2xl p-4 border-l-4 transition-all hover:shadow-md',
                              eventoBorderColor(evento.tipo),
                            )}
                          >
                            <div className="flex items-start gap-3">
                              {/* Emoji icon */}
                              <div className="w-10 h-10 rounded-xl bg-creme-dark/30 flex items-center justify-center text-lg flex-shrink-0">
                                {eventoIcon(evento.tipo)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-headline font-bold text-sm text-texto leading-snug">
                                  {evento.titulo}
                                </p>
                                {evento.descricao && (
                                  <p className="text-xs text-texto-soft mt-1 leading-relaxed line-clamp-2">
                                    {evento.descricao}
                                  </p>
                                )}

                                {/* Meta row */}
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {evento.autorId && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-label uppercase tracking-wider bg-creme-dark/40 text-texto-soft px-2 py-0.5 rounded-full">
                                      Registrado
                                    </span>
                                  )}
                                  <span className="text-[10px] text-texto-soft/60">
                                    {formatDate(evento.criadoEm)} &middot;{' '}
                                    {new Date(evento.criadoEm).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Bottom note */}
              <div className="text-center pt-2 pb-4">
                <p className="text-xs text-texto-soft/50">
                  Eventos sao imutaveis e nao podem ser editados ou deletados
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── DIARIO TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'diario' && (
        <div className="space-y-6">
          {/* Hero Title */}
          <div className="mb-6 text-center relative">
            <h2 className="font-headline font-extrabold text-4xl tracking-tighter text-amarelo mb-2">
              Diario de Aventuras
            </h2>
            <p className="text-azul font-medium text-base">
              Colecione momentos felizes com seu melhor amigo!
            </p>
            {/* Floating stickers */}
            <div className="absolute -top-4 -left-2 opacity-20 pointer-events-none">
              <span className="text-5xl text-rosa">🐾</span>
            </div>
            <div className="absolute top-8 -right-4 opacity-20 pointer-events-none rotate-12">
              <span className="text-6xl text-amarelo">🍎</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('mitra:register-event'))}
              className="group relative bg-amarelo-light text-amarelo px-8 py-5 rounded-full font-headline font-bold text-lg flex items-center gap-3 shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <div className="bg-white p-2.5 rounded-full group-hover:rotate-12 transition-transform">
                <span className="text-amarelo text-2xl">📸</span>
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
                    style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                  >
                    <div
                      className={cn(
                        color,
                        'p-4 rounded-2xl shadow-sm transition-transform duration-500 animate-fade-in',
                        rotation,
                        'group-hover:rotate-0',
                      )}
                      style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                    >
                      {/* Event card content */}
                      <div className="relative overflow-hidden rounded-xl aspect-square mb-3 bg-creme-dark flex items-center justify-center">
                        <span className="text-6xl opacity-20">{sticker}</span>
                        {/* Sticker overlay */}
                        <div className="absolute top-2 right-2 rotate-12">
                          <span className="text-rosa text-2xl">{sticker}</span>
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
              <span className="text-8xl opacity-20 mb-4 block">🐾</span>
              <p className="font-headline font-bold text-2xl text-texto-soft/40 mb-2">
                Nenhuma aventura ainda!
              </p>
              <p className="text-texto-soft/40">Registre o primeiro momento do seu pet</p>
            </div>
          )}

          {/* Stats Section */}
          {eventos.length > 0 && (
            <section className="mt-12 mb-8 p-8 bg-creme-dark rounded-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="font-headline font-bold text-2xl text-amarelo mb-2">
                    Estatisticas da Diversao
                  </h3>
                  <p className="text-azul">Acompanhe as aventuras!</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/80 backdrop-blur px-5 py-3 rounded-2xl text-center min-w-[100px]">
                    <p className="text-3xl font-headline font-bold text-rosa">{eventos.length}</p>
                    <p className="text-xs font-label uppercase tracking-widest text-texto-soft">
                      Total
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur px-5 py-3 rounded-2xl text-center min-w-[100px]">
                    <p className="text-3xl font-headline font-bold text-azul">{thisMonthCount}</p>
                    <p className="text-xs font-label uppercase tracking-widest text-texto-soft">
                      Este mes
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur px-5 py-3 rounded-2xl text-center min-w-[100px]">
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
      )}
    </div>
  );
}
