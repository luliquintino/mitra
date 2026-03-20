'use client';

import { Evento } from '@/types';
import { formatDate, eventoIcon, cn } from '@/lib/utils';
import { BottomSheet } from '@/components/BottomSheet';

interface AtividadeSheetProps {
  open: boolean;
  onClose: () => void;
  eventos: Evento[];
}

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

export function AtividadeSheet({ open, onClose, eventos }: AtividadeSheetProps) {
  const groups = groupByMonth(eventos);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={`Atividade`}
    >
      {/* Header counter */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-texto-soft">
          {eventos.length} evento{eventos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty state */}
      {eventos.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="text-4xl">📋</div>
          <div>
            <p className="font-semibold text-texto">
              Linha do tempo vazia
            </p>
            <p className="text-sm text-texto-soft mt-1 max-w-xs mx-auto">
              A linha do tempo da vida do seu pet aparecerá aqui conforme os
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
                <div className="absolute left-4 top-4 bottom-4 w-px bg-creme-dark/30" />

                <div className="space-y-4">
                  {monthEvents.map((evento, i) => (
                    <div
                      key={evento.id}
                      className="relative animate-fade-in"
                      style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                    >
                      {/* Dot icon */}
                      <div className="absolute -left-8 top-1 w-8 h-8 rounded-full bg-white border-2 border-azul flex items-center justify-center text-sm z-10">
                        {eventoIcon(evento.tipo)}
                      </div>

                      {/* Event card */}
                      <div className="bg-white rounded-xl p-4 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-texto leading-snug">
                              {evento.titulo}
                            </p>
                            {evento.descricao && (
                              <p className="text-xs text-texto-soft mt-1 leading-relaxed">
                                {evento.descricao}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-texto-soft whitespace-nowrap">
                              {formatDate(evento.criadoEm)}
                            </p>
                            <p className="text-[10px] text-texto-soft/50 mt-0.5">
                              {new Date(evento.criadoEm).toLocaleTimeString(
                                'pt-BR',
                                { hour: '2-digit', minute: '2-digit' },
                              )}
                            </p>
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
          <div className="text-center pt-2">
            <p className="text-xs text-texto-soft/50">
              Eventos são imutáveis e não podem ser editados ou deletados
            </p>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
