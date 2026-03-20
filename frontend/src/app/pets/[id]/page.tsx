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

  // Alertas: vacinas vencendo nos proximos 30 dias
  const vacinasVencendo = useMemo(() => {
    const nowMs = Date.now();
    return vacinas.filter((v) => {
      if (!v.proximaDose) return false;
      const prox = new Date(v.proximaDose);
      const diff = (prox.getTime() - nowMs) / (1000 * 60 * 60 * 24);
      return diff <= 30 && diff >= 0;
    });
  }, [vacinas]);

  // Alertas: medicamentos ativos com proxima dose
  const medProximaDose = useMemo(() => {
    return medicamentos.filter(
      (m) => m.status === 'ATIVO'
    );
  }, [medicamentos]);

  const solicitacoesPendentes = dashboard?.alertas?.solicitacoesPendentes || 0;

  // Resumo rapido stats
  const vacinasEmDia = useMemo(() => {
    return vacinas.filter((v) => {
      if (!v.proximaDose) return true; // no next dose = em dia
      return new Date(v.proximaDose).getTime() > Date.now();
    }).length;
  }, [vacinas]);

  const medicamentosAtivos = useMemo(() => {
    return medicamentos.filter((m) => m.status === 'ATIVO').length;
  }, [medicamentos]);

  // Quem esta com a guarda
  const guardaAtual = useMemo(() => {
    const tutor = tutores.find((t) => t.ativo);
    return tutor?.usuario?.nome || 'Tutor principal';
  }, [tutores]);

  // Proximo compromisso
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

  // Calendar events (same logic as agenda page)
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

  // Events for selected calendar date
  const selectedEvents = useMemo(() => {
    return calendarEvents.filter((e) => e.date === selectedDate);
  }, [calendarEvents, selectedDate]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 pt-skeleton rounded-3xl" />
        ))}
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="space-y-5 pb-24">
      {/* ─────────────────────────────────────────────────────────────────────
          1. ALERTAS VISUAIS
      ───────────────────────────────────────────────────────────────────── */}
      {(vacinasVencendo.length > 0 ||
        solicitacoesPendentes > 0 ||
        medProximaDose.length > 0) && (
        <div className="space-y-3">
          {vacinasVencendo.length > 0 && (
            <div className="rounded-2xl bg-rosa-light p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">💉</span>
                <div className="flex-1">
                  <p className="font-headline font-semibold text-sm text-rosa">
                    {vacinasVencendo.length === 1
                      ? 'Vacina vencendo em breve'
                      : `${vacinasVencendo.length} vacinas vencendo em breve`}
                  </p>
                  <p className="text-xs font-body text-texto-soft mt-0.5">
                    {vacinasVencendo.map((v) => v.nome).join(', ')}
                  </p>
                </div>
                <span className="text-rosa text-xs font-headline font-bold">
                  ⚠️
                </span>
              </div>
            </div>
          )}

          {solicitacoesPendentes > 0 && (
            <div className="rounded-2xl bg-amarelo-light p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">📋</span>
                <div className="flex-1">
                  <p className="font-headline font-semibold text-sm text-amarelo">
                    {solicitacoesPendentes} solicitaç
                    {solicitacoesPendentes === 1
                      ? 'ão pendente'
                      : 'ões pendentes'}
                  </p>
                  <p className="text-xs font-body text-texto-soft mt-0.5">
                    Aguardando sua aprovação
                  </p>
                </div>
                <span className="text-amarelo text-xs font-headline font-bold">
                  ⏳
                </span>
              </div>
            </div>
          )}

          {medProximaDose.length > 0 && (
            <div className="rounded-2xl bg-rosa-light p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">💊</span>
                <div className="flex-1">
                  <p className="font-headline font-semibold text-sm text-rosa">
                    {medProximaDose.length} medicamento
                    {medProximaDose.length > 1 ? 's' : ''} ativo
                    {medProximaDose.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs font-body text-texto-soft mt-0.5">
                    {medProximaDose
                      .slice(0, 3)
                      .map((m) => m.nome)
                      .join(', ')}
                  </p>
                </div>
                <span className="text-rosa text-xs font-headline font-bold">
                  💊
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          2. RESUMO RAPIDO — 2x2 grid
      ───────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Vacinas */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-full bg-rosa-light flex items-center justify-center text-base">
              💉
            </span>
            <span className="font-headline font-bold text-xs text-texto-soft uppercase tracking-wide">
              Vacinas
            </span>
          </div>
          <p className="font-headline font-bold text-2xl text-texto">
            {vacinasEmDia}
            <span className="text-sm font-body font-normal text-texto-soft ml-1">
              em dia
            </span>
          </p>
        </div>

        {/* Medicamentos */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-full bg-azul-light flex items-center justify-center text-base">
              💊
            </span>
            <span className="font-headline font-bold text-xs text-texto-soft uppercase tracking-wide">
              Medicamentos
            </span>
          </div>
          <p className="font-headline font-bold text-2xl text-texto">
            {medicamentosAtivos}
            <span className="text-sm font-body font-normal text-texto-soft ml-1">
              ativo{medicamentosAtivos !== 1 ? 's' : ''}
            </span>
          </p>
        </div>

        {/* Guarda */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-full bg-coral-light flex items-center justify-center text-base">
              🏠
            </span>
            <span className="font-headline font-bold text-xs text-texto-soft uppercase tracking-wide">
              Guarda
            </span>
          </div>
          <p className="font-headline font-semibold text-sm text-texto truncate">
            {guardaAtual}
          </p>
        </div>

        {/* Proximo compromisso */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-full bg-amarelo-light flex items-center justify-center text-base">
              📅
            </span>
            <span className="font-headline font-bold text-xs text-texto-soft uppercase tracking-wide">
              Próximo
            </span>
          </div>
          {proximoCompromisso ? (
            <div>
              <p className="font-headline font-semibold text-sm text-texto truncate">
                {proximoCompromisso.titulo}
              </p>
              <p className="text-xs font-body text-texto-soft mt-0.5">
                {proximoCompromisso.dataInicio
                  ? new Date(proximoCompromisso.dataInicio).toLocaleDateString(
                      'pt-BR',
                      { day: '2-digit', month: 'short' }
                    )
                  : ''}
                {proximoCompromisso.horarioInicio
                  ? ` ${proximoCompromisso.horarioInicio}`
                  : ''}
              </p>
            </div>
          ) : (
            <p className="text-sm font-body text-texto-soft/50 italic">
              Nenhum
            </p>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          3. CALENDARIO COMPLETO
      ───────────────────────────────────────────────────────────────────── */}
      <div>
        <h3 className="font-headline font-bold text-lg text-texto mb-3">
          📆 Calendário
        </h3>
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

        {/* Events for selected date */}
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-texto-muted/30" />
            <span className="text-xs font-headline font-bold text-azul opacity-60 uppercase tracking-widest whitespace-nowrap">
              {formatDateLabel(selectedDate)}
            </span>
            <div className="h-px flex-1 bg-texto-muted/30" />
          </div>

          {selectedEvents.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center">
              <span className="text-2xl opacity-40 block mb-1">📅</span>
              <p className="text-sm font-body text-texto-soft/60">
                Nenhum evento nesta data
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/60 backdrop-blur-md p-4 flex items-center gap-3"
                >
                  <span
                    className={cn(
                      'w-3 h-3 rounded-full flex-shrink-0',
                      ev.color
                    )}
                  />
                  <span className="text-sm font-body text-texto">
                    {ev.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          4. ATIVIDADE RECENTE
      ───────────────────────────────────────────────────────────────────── */}
      <div className="pt-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline font-bold text-lg text-texto">
            🕐 Atividade recente
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
          <p className="text-sm font-body text-texto-soft/50 italic">
            Nenhuma atividade registrada
          </p>
        ) : (
          <div className="space-y-2">
            {eventos.slice(0, 5).map((ev: any) => (
              <div
                key={ev.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-creme-dark"
              >
                <div className="w-10 h-10 rounded-full bg-azul-light flex items-center justify-center shrink-0">
                  <span className="text-lg">{eventoIcon(ev.tipo)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-semibold text-sm text-texto truncate">
                    {ev.descricao || ev.titulo || ev.tipo}
                  </p>
                  <p className="text-xs font-body text-texto-soft">
                    {formatRelative(ev.criadoEm)}
                  </p>
                </div>
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
        className="fixed bottom-6 right-6 z-50 bg-coral text-white px-5 py-3.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 font-headline font-bold text-sm"
        style={{ boxShadow: '0 4px 20px rgba(255, 111, 97, 0.4)' }}
      >
        <span className="text-lg">🐾</span>
        <span>+ Registrar evento</span>
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
