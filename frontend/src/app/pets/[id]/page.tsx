'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  petsApi,
  healthApi,
  custodyApi,
  compromissosApi,
  governanceApi,
  eventsApi,
} from '@/lib/api';
import {
  DashboardData,
  Vacina,
  Medicamento,
  Guarda,
  Compromisso,
  Pet,
  PetUsuario,
} from '@/types';
import { formatRelative, eventoIcon, cn } from '@/lib/utils';
import { CalendarMonth } from '@/components/CalendarMonth';
import { RegisterEventModal } from '@/components/RegisterEventModal';

// ─── Helpers ────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function todayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  return `${pad(d)}/${pad(m)}/${y} (${weekday})`;
}

// ─── Alert type ─────────────────────────────────────────────────────────────

type AlertItem = {
  icon: string;
  label: string;
  detail: string;
  color: string;
  bgColor: string;
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function PetHomePage() {
  const params = useParams();
  const petId = params?.id as string;
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [tutores, setTutores] = useState<PetUsuario[]>([]);
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());

  // FAB / RegisterEventModal
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Calendar collapsed state
  const [calendarOpen, setCalendarOpen] = useState(false);

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [petRes, dashRes, tutRes, vacsRes, medsRes, compRes, evRes] =
        await Promise.all([
          petsApi.get(petId),
          petsApi.dashboard(petId),
          governanceApi.tutores(petId),
          healthApi.vacinas(petId),
          healthApi.medicamentos(petId),
          compromissosApi.list(petId),
          eventsApi.historico(petId).catch(() => ({ data: { eventos: [] } })),
        ]);

      setPet(petRes.data as Pet);
      setDashboard(dashRes.data as DashboardData);
      setTutores((tutRes.data as unknown as PetUsuario[]) || []);
      setVacinas((vacsRes.data as Vacina[]) || []);
      setMedicamentos((medsRes.data as Medicamento[]) || []);
      setCompromissos((compRes.data as Compromisso[]) || []);

      // eventsApi.historico returns { eventos, grouped, total } or array
      const evData = evRes.data;
      setEventos(
        Array.isArray(evData)
          ? evData
          : (evData as any)?.eventos || dashRes.data?.atividadeRecente || []
      );
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Computed data ─────────────────────────────────────────────────────────

  const vacinasVencendo = useMemo(() => {
    const nowMs = Date.now();
    return vacinas.filter((v) => {
      if (!v.proximaDose) return false;
      const prox = new Date(v.proximaDose);
      const diff = (prox.getTime() - nowMs) / (1000 * 60 * 60 * 24);
      return diff <= 30 && diff >= 0;
    });
  }, [vacinas]);

  const medProximaDose = useMemo(() => {
    return medicamentos.filter((m) => m.status === 'ATIVO');
  }, [medicamentos]);

  const solicitacoesPendentes = dashboard?.alertas?.solicitacoesPendentes || 0;

  const vacinasEmDia = useMemo(() => {
    return vacinas.filter((v) => {
      if (!v.proximaDose) return true;
      return new Date(v.proximaDose).getTime() > Date.now();
    }).length;
  }, [vacinas]);

  const medicamentosAtivos = useMemo(() => {
    return medicamentos.filter((m) => m.status === 'ATIVO').length;
  }, [medicamentos]);

  const guardaAtual = useMemo(() => {
    const tutor = tutores.find((t) => t.ativo);
    return tutor?.usuario?.nome || 'Tutor principal';
  }, [tutores]);

  const proximoCompromisso = useMemo(() => {
    const nowMs = Date.now();
    const futuros = compromissos
      .filter((c) => c.dataInicio && new Date(c.dataInicio).getTime() >= nowMs)
      .sort(
        (a, b) =>
          new Date(a.dataInicio!).getTime() - new Date(b.dataInicio!).getTime()
      );
    return futuros[0] || null;
  }, [compromissos]);

  const calendarEvents = useMemo(() => {
    const events: { date: string; color: string; label: string }[] = [];
    vacinas.forEach((v) => {
      if (v.proximaDose) {
        events.push({
          date: v.proximaDose.split('T')[0],
          color: 'bg-rosa',
          label: `💉 ${v.nome}`,
        });
      }
    });
    compromissos.forEach((c) => {
      if (c.dataInicio) {
        events.push({
          date: c.dataInicio.split('T')[0],
          color: 'bg-coral',
          label: `📅 ${c.titulo}`,
        });
      }
    });
    eventos.forEach((ev) => {
      if (ev.criadoEm) {
        events.push({
          date: ev.criadoEm.split('T')[0],
          color: 'bg-azul',
          label: `${ev.titulo || ev.descricao || ev.tipo}`,
        });
      }
    });
    return events;
  }, [vacinas, compromissos, eventos]);

  const selectedEvents = useMemo(() => {
    return calendarEvents.filter((e) => e.date === selectedDate);
  }, [calendarEvents, selectedDate]);

  // ─── Alerts as unified list ────────────────────────────────────────────────

  const alerts = useMemo(() => {
    const items: AlertItem[] = [];
    if (vacinasVencendo.length > 0) {
      items.push({
        icon: '💉',
        label: vacinasVencendo.length === 1 ? 'Vacina vencendo' : `${vacinasVencendo.length} vacinas vencendo`,
        detail: vacinasVencendo.map((v) => v.nome).join(', '),
        color: 'text-rosa',
        bgColor: 'bg-rosa-light',
      });
    }
    if (solicitacoesPendentes > 0) {
      items.push({
        icon: '📋',
        label: `${solicitacoesPendentes} solicitaç${solicitacoesPendentes === 1 ? 'ão' : 'ões'}`,
        detail: 'Aguardando aprovação',
        color: 'text-amarelo',
        bgColor: 'bg-amarelo-light',
      });
    }
    if (medProximaDose.length > 0) {
      items.push({
        icon: '💊',
        label: `${medProximaDose.length} medicamento${medProximaDose.length > 1 ? 's' : ''} ativo${medProximaDose.length > 1 ? 's' : ''}`,
        detail: medProximaDose.slice(0, 2).map((m) => m.nome).join(', '),
        color: 'text-azul',
        bgColor: 'bg-azul-light',
      });
    }
    return items;
  }, [vacinasVencendo, solicitacoesPendentes, medProximaDose]);

  // Today's events count for calendar badge
  const todayEventCount = useMemo(() => {
    return calendarEvents.filter((e) => e.date === todayStr()).length;
  }, [calendarEvents]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Alert skeleton */}
        <div className="h-14 pt-skeleton rounded-2xl" />
        {/* Stats skeleton */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 pt-skeleton rounded-2xl" />
          ))}
        </div>
        {/* Calendar skeleton */}
        <div className="h-12 pt-skeleton rounded-2xl" />
        {/* Activity skeleton */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 pt-skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="space-y-5 pb-24">
      {/* ─────────────────────────────────────────────────────────────────────
          1. ALERTAS — compact horizontal scroll
      ───────────────────────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shrink-0 transition-all',
                alert.bgColor,
              )}
            >
              <span className="text-lg">{alert.icon}</span>
              <div className="min-w-0">
                <p className={cn('font-headline font-bold text-xs', alert.color)}>
                  {alert.label}
                </p>
                <p className="text-[10px] font-body text-texto-soft truncate max-w-[140px]">
                  {alert.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          2. RESUMO RAPIDO — 4 compact stat pills
      ───────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {/* Vacinas */}
        <button
          onClick={() => window.location.href = `/pets/${petId}/saude`}
          className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-rosa-light flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
            <span className="text-base">💉</span>
          </div>
          <p className="font-headline font-bold text-lg text-texto leading-none">
            {vacinasEmDia}
          </p>
          <p className="text-[10px] font-body text-texto-soft mt-0.5">
            vacinas
          </p>
        </button>

        {/* Medicamentos */}
        <button
          onClick={() => window.location.href = `/pets/${petId}/saude`}
          className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-azul-light flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
            <span className="text-base">💊</span>
          </div>
          <p className="font-headline font-bold text-lg text-texto leading-none">
            {medicamentosAtivos}
          </p>
          <p className="text-[10px] font-body text-texto-soft mt-0.5">
            {medicamentosAtivos === 1 ? 'remédio' : 'remédios'}
          </p>
        </button>

        {/* Guarda */}
        <button
          onClick={() => window.location.href = `/pets/${petId}/guarda`}
          className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-menta-light flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
            <span className="text-base">🏠</span>
          </div>
          <p className="font-headline font-bold text-xs text-texto leading-tight truncate px-1">
            {guardaAtual.split(' ')[0]}
          </p>
          <p className="text-[10px] font-body text-texto-soft mt-0.5">
            guarda
          </p>
        </button>

        {/* Próximo */}
        <button
          onClick={() => window.location.href = `/pets/${petId}/saude`}
          className="group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-center"
        >
          <div className="w-9 h-9 rounded-xl bg-amarelo-light flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
            <span className="text-base">📅</span>
          </div>
          {proximoCompromisso ? (
            <>
              <p className="font-headline font-bold text-xs text-texto leading-tight truncate px-1">
                {proximoCompromisso.dataInicio
                  ? new Date(proximoCompromisso.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                  : ''}
              </p>
              <p className="text-[10px] font-body text-texto-soft mt-0.5 truncate">
                próximo
              </p>
            </>
          ) : (
            <>
              <p className="font-headline font-bold text-xs text-texto-soft leading-tight">—</p>
              <p className="text-[10px] font-body text-texto-soft mt-0.5">próximo</p>
            </>
          )}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          3. CALENDARIO — collapsible
      ───────────────────────────────────────────────────────────────────── */}
      <div className="pt-card !p-0 overflow-hidden">
        {/* Calendar toggle header */}
        <button
          onClick={() => setCalendarOpen(!calendarOpen)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-creme-dark/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-light flex items-center justify-center">
              <span className="text-lg">📆</span>
            </div>
            <div className="text-left">
              <p className="font-headline font-bold text-sm text-texto">
                Calendário
              </p>
              <p className="text-xs font-body text-texto-soft">
                {todayEventCount > 0
                  ? `${todayEventCount} evento${todayEventCount > 1 ? 's' : ''} hoje`
                  : 'Nenhum evento hoje'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {todayEventCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center">
                {todayEventCount}
              </span>
            )}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                'text-texto-soft transition-transform duration-300',
                calendarOpen && 'rotate-180',
              )}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </button>

        {/* Calendar body — collapsible */}
        <div
          className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden',
            calendarOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <div className="px-2 pb-2">
            <CalendarMonth
              month={month}
              year={year}
              events={calendarEvents}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onChangeMonth={(m, y) => {
                setMonth(m);
                setYear(y);
              }}
            />
          </div>

          {/* Events for selected date */}
          <div className="px-5 pb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-creme-dark" />
              <span className="text-[10px] font-headline font-bold text-texto-soft uppercase tracking-wider whitespace-nowrap">
                {formatDateLabel(selectedDate)}
              </span>
              <div className="h-px flex-1 bg-creme-dark" />
            </div>

            {selectedEvents.length === 0 ? (
              <p className="text-xs text-texto-soft text-center py-3 font-body">
                Nenhum evento nesta data
              </p>
            ) : (
              <div className="space-y-1.5">
                {selectedEvents.map((ev, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-creme-dark/40"
                  >
                    <span className={cn('w-2 h-2 rounded-full shrink-0', ev.color)} />
                    <span className="text-xs font-body text-texto">{ev.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          4. ATIVIDADE RECENTE
      ───────────────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline font-bold text-sm text-texto">
            Atividade recente
          </h3>
          {eventos.length > 5 && (
            <a
              href={`/pets/${petId}/historico`}
              className="text-xs font-headline font-semibold text-coral hover:opacity-70 transition-opacity"
            >
              Ver tudo →
            </a>
          )}
        </div>

        {eventos.length === 0 ? (
          <div className="pt-card text-center py-8">
            <span className="text-2xl block mb-2">📋</span>
            <p className="text-sm font-body text-texto-soft">
              Nenhuma atividade registrada
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {eventos.slice(0, 5).map((ev: any, i: number) => (
              <div
                key={ev.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-9 h-9 rounded-xl bg-creme-dark flex items-center justify-center shrink-0">
                  <span className="text-base">{eventoIcon(ev.tipo)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-semibold text-xs text-texto truncate">
                    {ev.descricao || ev.titulo || ev.tipo}
                  </p>
                  <p className="text-[10px] font-body text-texto-soft">
                    {formatRelative(ev.criadoEm)}
                  </p>
                </div>
                <div className="w-1 h-8 rounded-full bg-creme-dark shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          5. FAB BUTTON — Registrar evento
      ───────────────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setShowRegisterModal(true)}
        className="fixed bottom-6 right-6 z-50 bg-coral text-white w-14 h-14 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
        style={{ boxShadow: '0 4px 20px rgba(255, 111, 97, 0.35)' }}
        aria-label="Registrar evento"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* RegisterEventModal */}
      <RegisterEventModal
        open={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        petId={petId}
        pet={pet}
        onSuccess={() => {
          setShowRegisterModal(false);
          setLoading(true);
          loadData();
        }}
      />
    </div>
  );
}
