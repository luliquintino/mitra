'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { eventsApi, compromissosApi, healthApi, custodyApi } from '@/lib/api';
import { Evento, Compromisso, Vacina, Medicamento } from '@/types';
import { CalendarMonth } from '@/components/CalendarMonth';
import { BottomSheet } from '@/components/BottomSheet';
import { formatDate, cn } from '@/lib/utils';

// ─── Labels ────────────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<string, string> = {
  PASSEIO: '🐕 Passeio',
  CONSULTA: '🏥 Consulta',
  BANHO: '🛁 Banho',
  ADESTRAMENTO: '🎓 Adestramento',
  CRECHE: '🏠 Creche',
  HOSPEDAGEM: '🏨 Hospedagem',
  OUTRO: '📋 Outro',
};

const RECORRENCIA_LABELS: Record<string, string> = {
  UNICO: 'Único',
  DIARIO: 'Diário',
  SEMANAL: 'Semanal',
  QUINZENAL: 'Quinzenal',
  MENSAL: 'Mensal',
};

const TIPO_OPTIONS = ['PASSEIO', 'CONSULTA', 'BANHO', 'ADESTRAMENTO', 'CRECHE', 'HOSPEDAGEM', 'OUTRO'] as const;
const RECORRENCIA_OPTIONS = ['UNICO', 'DIARIO', 'SEMANAL', 'QUINZENAL', 'MENSAL'] as const;

const DIAS_SEMANA_LABELS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

// ─── Component ─────────────────────────────────────────────────────────────────

interface CompromissoForm {
  titulo: string;
  tipo: string;
  recorrencia: string;
  diasSemana: number[];
  horarioInicio: string;
  horarioFim: string;
  dataInicio: string;
  dataFim: string;
}

const INITIAL_FORM: CompromissoForm = {
  titulo: '',
  tipo: 'PASSEIO',
  recorrencia: 'UNICO',
  diasSemana: [],
  horarioInicio: '',
  horarioFim: '',
  dataInicio: '',
  dataFim: '',
};

export default function AgendaPage() {
  const params = useParams();
  const petId = params?.id as string;

  // Data state
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());

  // BottomSheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<CompromissoForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [evRes, compRes, vacRes, medRes] = await Promise.all([
        eventsApi.historico(petId).catch(() => ({ data: { eventos: [] } })),
        compromissosApi.list(petId).catch(() => ({ data: [] })),
        healthApi.vacinas(petId).catch(() => ({ data: [] })),
        healthApi.medicamentos(petId).catch(() => ({ data: [] })),
      ]);

      // eventsApi.historico returns { eventos, grouped, total }
      const evData = evRes.data;
      setEventos(Array.isArray(evData) ? evData : (evData as any)?.eventos || []);
      setCompromissos(Array.isArray(compRes.data) ? compRes.data : []);
      setVacinas(Array.isArray(vacRes.data) ? vacRes.data : []);
      setMedicamentos(Array.isArray(medRes.data) ? medRes.data : []);
    } catch (err) {
      console.error('Erro ao carregar dados da agenda:', err);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Calendar events ──────────────────────────────────────────────────────

  const calendarEvents = useMemo(() => {
    const events: { date: string; color: string; label: string }[] = [];

    // Vacinas com proxima dose
    vacinas.forEach((v) => {
      if (v.proximaDose) {
        events.push({
          date: v.proximaDose.split('T')[0],
          color: 'bg-rosa',
          label: `💉 ${v.nome}`,
        });
      }
    });

    // Compromissos
    compromissos.forEach((c) => {
      if (c.dataInicio) {
        events.push({
          date: c.dataInicio.split('T')[0],
          color: 'bg-coral',
          label: `📅 ${c.titulo}`,
        });
      }
    });

    // Eventos historicos
    eventos.forEach((ev) => {
      if (ev.criadoEm) {
        events.push({
          date: ev.criadoEm.split('T')[0],
          color: 'bg-azul',
          label: `${ev.titulo}`,
        });
      }
    });

    return events;
  }, [vacinas, compromissos, eventos]);

  // ─── Selected date events ─────────────────────────────────────────────────

  const selectedEvents = useMemo(() => {
    return calendarEvents.filter((e) => e.date === selectedDate);
  }, [calendarEvents, selectedDate]);

  // ─── Compromisso handlers ─────────────────────────────────────────────────

  const handleOpenSheet = () => {
    setForm({ ...INITIAL_FORM, dataInicio: selectedDate || todayStr() });
    setSheetOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.titulo.trim()) return;
    setSubmitting(true);
    try {
      await compromissosApi.create(petId, {
        titulo: form.titulo.trim(),
        tipo: form.tipo,
        recorrencia: form.recorrencia,
        diasSemana: form.recorrencia !== 'UNICO' ? form.diasSemana : undefined,
        horarioInicio: form.horarioInicio || undefined,
        horarioFim: form.horarioFim || undefined,
        dataInicio: form.dataInicio || undefined,
        dataFim: form.dataFim || undefined,
      });
      setSheetOpen(false);
      setForm(INITIAL_FORM);
      await loadData();
    } catch (err) {
      console.error('Erro ao criar compromisso:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (compId: string) => {
    try {
      await compromissosApi.remove(petId, compId);
      setDeletingId(null);
      await loadData();
    } catch (err) {
      console.error('Erro ao remover compromisso:', err);
    }
  };

  const toggleDiaSemana = (dia: number) => {
    setForm((prev) => ({
      ...prev,
      diasSemana: prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter((d) => d !== dia)
        : [...prev.diasSemana, dia],
    }));
  };

  // ─── Loading skeleton ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="pt-card">
          <div className="h-64 pt-skeleton rounded-xl" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="pt-card">
            <div className="space-y-2">
              <div className="h-4 pt-skeleton w-2/3" />
              <div className="h-3 pt-skeleton w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Calendar */}
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
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-texto-muted/30" />
          <span className="text-xs font-headline font-bold text-azul opacity-60 uppercase tracking-widest whitespace-nowrap">
            Eventos de {formatDateLabel(selectedDate)}
          </span>
          <div className="h-px flex-1 bg-texto-muted/30" />
        </div>

        {selectedEvents.length === 0 ? (
          <div className="bg-white p-6 rounded-xl text-center py-8">
            <span className="text-3xl text-azul opacity-40 mb-2">📅</span>
            <p className="text-sm text-azul opacity-60">Nenhum evento nesta data</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((ev, idx) => (
              <div key={idx} className="bg-white/40 backdrop-blur-md p-4 rounded-lg flex items-center gap-3">
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', ev.color)} />
                <span className="text-sm font-body text-texto">{ev.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compromissos recorrentes */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-texto-muted/30" />
          <span className="text-xs font-headline font-bold text-azul opacity-60 uppercase tracking-widest whitespace-nowrap">
            Compromissos recorrentes
          </span>
          <div className="h-px flex-1 bg-texto-muted/30" />
        </div>

        {compromissos.length === 0 ? (
          <div className="bg-white p-6 rounded-xl text-center py-8">
            <span className="text-3xl text-azul opacity-40 mb-2">🔁</span>
            <p className="text-sm text-azul opacity-60">Nenhum compromisso cadastrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {compromissos.map((comp) => (
              <div key={comp.id} className="bg-white p-6 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-coral text-lg">🐾</span>
                      <p className="text-sm font-headline font-bold text-texto">{comp.titulo}</p>
                      <span className="pt-badge bg-coral-light text-coral text-[10px]">
                        {TIPO_LABELS[comp.tipo] || comp.tipo}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-azul opacity-60">
                      {comp.responsavelNome && (
                        <span>👤 {comp.responsavelNome}</span>
                      )}
                      <span>🔁 {RECORRENCIA_LABELS[comp.recorrencia] || comp.recorrencia}</span>
                      {comp.horarioInicio && (
                        <span>
                          🕐 {comp.horarioInicio}
                          {comp.horarioFim ? ` - ${comp.horarioFim}` : ''}
                        </span>
                      )}
                    </div>

                    {comp.diasSemana && comp.diasSemana.length > 0 && (
                      <div className="mt-1.5 flex gap-1">
                        {comp.diasSemana.map((d) => (
                          <span
                            key={d}
                            className="text-[10px] font-headline font-bold px-1.5 py-0.5 rounded-full bg-azul-light text-azul"
                          >
                            {DIAS_SEMANA_LABELS[d]}
                          </span>
                        ))}
                      </div>
                    )}

                    {comp.dataInicio && (
                      <p className="mt-1 text-[11px] text-azul opacity-60 uppercase tracking-widest">
                        {formatDate(comp.dataInicio)}
                        {comp.dataFim ? ` até ${formatDate(comp.dataFim)}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Delete button */}
                  <div className="flex-shrink-0">
                    {deletingId === comp.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(comp.id)}
                          className="text-[10px] font-headline font-bold px-2 py-1 rounded-full bg-erro-light text-erro hover:bg-erro-light/70 transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="text-[10px] font-headline font-bold px-2 py-1 rounded-full bg-creme-dark text-texto-soft hover:bg-creme-dark/80 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(comp.id)}
                        className="w-7 h-7 flex items-center justify-center text-erro hover:bg-erro-light rounded-full transition-colors"
                        aria-label="Remover compromisso"
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new compromisso button */}
        <button
          onClick={handleOpenSheet}
          className="mt-3 w-full bg-coral py-4 rounded-xl text-white font-headline font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>➕</span>
          Novo compromisso
        </button>
      </div>

      {/* BottomSheet: Compromisso form */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Novo compromisso"
      >
        <div className="space-y-4">
          {/* Titulo */}
          <div>
            <label className="pt-label">Título</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
              className="pt-input"
              placeholder="Ex: Passeio no parque"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="pt-label">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))}
              className="pt-select"
            >
              {TIPO_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {TIPO_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Recorrencia */}
          <div>
            <label className="pt-label">Recorrência</label>
            <select
              value={form.recorrencia}
              onChange={(e) => setForm((prev) => ({ ...prev, recorrencia: e.target.value }))}
              className="pt-select"
            >
              {RECORRENCIA_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {RECORRENCIA_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {/* Dias da semana (shown if recorrencia != UNICO) */}
          {form.recorrencia !== 'UNICO' && (
            <div>
              <label className="pt-label">Dias da semana</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DIAS_SEMANA_LABELS.map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDiaSemana(idx)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-headline font-bold transition-all duration-200 active:scale-[0.9]',
                      form.diasSemana.includes(idx)
                        ? 'bg-azul-light text-azul'
                        : 'bg-white text-texto-soft hover:bg-creme-dark',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pt-label">Horário início</label>
              <input
                type="time"
                value={form.horarioInicio}
                onChange={(e) => setForm((prev) => ({ ...prev, horarioInicio: e.target.value }))}
                className="pt-input"
              />
            </div>
            <div>
              <label className="pt-label">Horário fim</label>
              <input
                type="time"
                value={form.horarioFim}
                onChange={(e) => setForm((prev) => ({ ...prev, horarioFim: e.target.value }))}
                className="pt-input"
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="pt-label">Data início</label>
              <input
                type="date"
                value={form.dataInicio}
                onChange={(e) => setForm((prev) => ({ ...prev, dataInicio: e.target.value }))}
                className="pt-input"
              />
            </div>
            <div>
              <label className="pt-label">Data fim</label>
              <input
                type="date"
                value={form.dataFim}
                onChange={(e) => setForm((prev) => ({ ...prev, dataFim: e.target.value }))}
                className="pt-input"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.titulo.trim()}
            className="w-full pt-btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              'Salvar compromisso'
            )}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
