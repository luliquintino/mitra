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
      <div className="space-y-4 animate-fade-in">
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-9 w-24 pt-skeleton rounded-xl flex-shrink-0" />
          ))}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 pt-skeleton rounded-2xl" />
        ))}
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-headline text-xl font-bold text-texto">Historico</h1>
        <p className="text-sm text-texto-soft mt-0.5">Acompanhe todos os eventos e momentos do seu pet</p>
      </div>

      {/* Sub-tab pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'timeline' as SubTab, label: 'Timeline' },
          { id: 'diario' as SubTab, label: 'Diario' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
              activeTab === t.id
                ? 'bg-coral text-white shadow-sm'
                : 'bg-white text-texto-soft hover:bg-creme-dark',
            )}
          >
            {t.label}
          </button>
        ))}
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
                  'px-3 py-1.5 rounded-full text-xs font-headline font-bold transition-all',
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
            <div className="pt-card text-center py-10 space-y-3">
              <div className="text-3xl">📋</div>
              <div>
                <p className="font-semibold text-texto text-sm">
                  Linha do tempo vazia
                </p>
                <p className="text-xs text-texto-soft mt-1 max-w-xs mx-auto">
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
                    <span className="font-headline font-bold text-texto-soft text-xs uppercase tracking-wider whitespace-nowrap capitalize">
                      {mesAno}
                    </span>
                    <div className="h-px flex-1 bg-creme-dark/30" />
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-12">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-creme-dark/40 rounded-full" />

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
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-creme-dark/40 text-texto-soft px-2 py-0.5 rounded-full">
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
          {/* Section heading */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-lg font-bold text-texto">Diario de Aventuras</h2>
              <p className="text-sm text-texto-soft mt-0.5">Colecione momentos felizes com seu melhor amigo</p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('mitra:register-event'))}
              className="px-4 py-2 rounded-xl bg-coral text-white text-sm font-medium shadow-sm hover:opacity-90 transition-all"
            >
              Adicionar Foto
            </button>
          </div>

          {/* Stats */}
          {eventos.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-rosa-light/50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-headline font-bold text-texto">{eventos.length}</p>
                <p className="text-[11px] text-texto-soft mt-1 leading-tight">Total</p>
              </div>
              <div className="bg-azul-light/50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-headline font-bold text-texto">{thisMonthCount}</p>
                <p className="text-[11px] text-texto-soft mt-1 leading-tight">Este mes</p>
              </div>
              <div className="bg-amarelo-light/50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-headline font-bold text-texto">{uniqueTypes}</p>
                <p className="text-[11px] text-texto-soft mt-1 leading-tight">Tipos</p>
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          {eventos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                      'relative',
                      isFirst && 'md:col-span-2',
                      isWide && !isFirst && 'md:col-span-2',
                    )}
                  >
                    <div className="bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
                      {/* Event card content */}
                      <div className="relative overflow-hidden rounded-xl aspect-square mb-3 bg-creme-dark/30 flex items-center justify-center">
                        <span className="text-4xl opacity-20">{sticker}</span>
                      </div>
                      <p className="font-headline font-bold text-sm text-texto">
                        {evento.descricao || evento.tipo}
                      </p>
                      <p className="text-xs text-texto-soft mt-1">
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
            <div className="pt-card text-center py-10 space-y-3">
              <div className="text-3xl">📷</div>
              <div>
                <p className="font-semibold text-texto text-sm">
                  Nenhuma aventura ainda
                </p>
                <p className="text-xs text-texto-soft mt-1 max-w-xs mx-auto">
                  Registre o primeiro momento do seu pet
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
