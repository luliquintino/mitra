'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { governanceApi, custodyApi, eventsApi } from '@/lib/api';
import type { PetUsuario, Solicitacao, GuardaTemporaria, Evento } from '@/types';
import { cn } from '@/lib/utils';
import {
  Shield,
  Users,
  Clock,
  Calendar,
  FileText,
  Plus,
  Check,
  X,
  ChevronRight,
  AlertCircle,
  User,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtDateShort(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

const ROLE_LABELS: Record<string, string> = {
  TUTOR_PRINCIPAL: 'Tutor Principal',
  TUTOR_EMERGENCIA: 'Tutor Emergência',
  ADESTRADOR: 'Adestrador',
  PASSEADOR: 'Passeador',
  VETERINARIO: 'Veterinário',
  FAMILIAR: 'Familiar',
  AMIGO: 'Amigo',
  OUTRO: 'Outro',
};

const STATUS_LABELS: Record<string, string> = {
  AGENDADA: 'Pendente',
  CONFIRMADA: 'Ativa',
  EM_ANDAMENTO: 'Ativa',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

const STATUS_COLORS: Record<string, string> = {
  AGENDADA: 'mg-badge-warning',
  CONFIRMADA: 'mg-badge-success',
  EM_ANDAMENTO: 'mg-badge-success',
  CONCLUIDA: 'mg-badge-info',
  CANCELADA: 'mg-badge-error',
};

const CUSTODY_EVENT_TYPES = [
  'SOLICITACAO_CRIADA',
  'SOLICITACAO_APROVADA',
  'SOLICITACAO_RECUSADA',
  'TUTOR_ADICIONADO',
  'ALTERACAO_GUARDA',
  'GUARDA_TEMPORARIA_CRIADA',
  'GUARDA_TEMPORARIA_CONFIRMADA',
  'GUARDA_TEMPORARIA_CANCELADA',
];

// ─── Component ──────────────────────────────────────────────────────────────────

export default function GuardaPage() {
  const params = useParams();
  const petId = params?.id as string;

  const [tutores, setTutores] = useState<PetUsuario[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [temporarias, setTemporarias] = useState<GuardaTemporaria[]>([]);
  const [historico, setHistorico] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for nova guarda temporária
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    responsavelId: '',
    dataInicio: '',
    dataFim: '',
    observacoes: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Responder state
  const [respondendo, setRespondendo] = useState<string | null>(null);
  const [mensagemResposta, setMensagemResposta] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [tutoresRes, solRes, tempRes, histRes] = await Promise.all([
        governanceApi.tutores(petId),
        custodyApi.solicitacoes(petId),
        custodyApi.temporarias(petId),
        eventsApi.historico(petId),
      ]);

      const tutoresData = tutoresRes.data ?? tutoresRes;
      setTutores(Array.isArray(tutoresData) ? tutoresData : []);

      const solData = solRes.data ?? solRes;
      setSolicitacoes(Array.isArray(solData) ? solData : []);

      const tempData = tempRes.data ?? tempRes;
      setTemporarias(Array.isArray(tempData) ? tempData : []);

      const histData = histRes.data ?? histRes;
      const eventos: Evento[] = Array.isArray(histData)
        ? histData
        : (histData as any)?.eventos || [];
      setHistorico(
        eventos.filter((e) => CUSTODY_EVENT_TYPES.includes(e.tipo)),
      );
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  async function handleResponder(
    solId: string,
    tipo: 'APROVAR' | 'RECUSAR' | 'SUGERIR',
  ) {
    try {
      await custodyApi.responder(petId, solId, tipo, mensagemResposta || undefined);
      setRespondendo(null);
      setMensagemResposta('');
      await loadData();
    } catch {
      // handle error
    }
  }

  async function handleCriarTemporaria() {
    if (!formData.dataInicio || !formData.dataFim) return;
    setFormLoading(true);
    try {
      await custodyApi.criarTemporaria(petId, formData);
      setShowForm(false);
      setFormData({ responsavelId: '', dataInicio: '', dataFim: '', observacoes: '' });
      await loadData();
    } catch {
      // handle error
    } finally {
      setFormLoading(false);
    }
  }

  async function handleConfirmarTemporaria(id: string) {
    try {
      await custodyApi.confirmarTemporaria(petId, id);
      await loadData();
    } catch {
      // handle error
    }
  }

  async function handleCancelarTemporaria(id: string) {
    try {
      await custodyApi.cancelarTemporaria(petId, id);
      await loadData();
    } catch {
      // handle error
    }
  }

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const guardiao = tutores.find(
    (t) => t.role === 'TUTOR_PRINCIPAL' && t.ativo,
  );
  const pendentes = solicitacoes.filter((s) => s.status === 'PENDENTE');

  // ─── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 mg-skeleton rounded-lg" />
        <div className="h-4 w-64 mg-skeleton rounded-lg" />
        <div className="mg-card space-y-4">
          <div className="h-16 mg-skeleton rounded-xl" />
        </div>
        <div className="mg-card space-y-3">
          <div className="h-14 mg-skeleton rounded-xl" />
          <div className="h-14 mg-skeleton rounded-xl" />
        </div>
        <div className="mg-card space-y-3">
          <div className="h-14 mg-skeleton rounded-xl" />
          <div className="h-14 mg-skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section header */}
      <div>
        <h2 className="font-headline font-bold text-xl text-texto">Guarda</h2>
        <p className="text-sm text-texto-soft font-body">Gerencie a guarda e custodia do pet</p>
      </div>

      {/* ── 1. GUARDA ATUAL ──────────────────────────────────────────────────── */}
      <div className="mg-card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-headline text-lg font-bold text-texto">Guarda Atual</h3>
        </div>

        {guardiao ? (
          <div className="mg-card-solid rounded-xl p-3 flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {guardiao.usuario.avatarUrl ? (
                <img
                  src={guardiao.usuario.avatarUrl}
                  alt={guardiao.usuario.nome}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-primary text-sm font-headline font-bold">
                  {initials(guardiao.usuario.nome)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-headline font-bold text-texto truncate">
                {guardiao.usuario.nome}
              </p>
              <p className="text-xs text-texto-soft font-body">
                Desde {fmtDate(guardiao.adicionadoEm)}
              </p>
            </div>

            <span className="mg-badge mg-badge-primary flex-shrink-0">
              {ROLE_LABELS[guardiao.role] || guardiao.role}
            </span>
          </div>
        ) : (
          <div className="mg-card-solid rounded-xl py-8 flex flex-col items-center gap-2">
            <Shield className="w-8 h-8 text-texto-soft/40" />
            <p className="text-sm text-texto-soft font-body text-center">
              Nenhum tutor principal definido
            </p>
          </div>
        )}
      </div>

      {/* ── 2. SOLICITAÇÕES PENDENTES ───────────────────────────────────────── */}
      <div className="mg-card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-amber" />
          </div>
          <h3 className="font-headline text-lg font-bold text-texto">
            Solicitacoes Pendentes
          </h3>
        </div>

        {pendentes.length === 0 ? (
          <div className="mg-card-solid rounded-xl py-8 flex flex-col items-center gap-2">
            <Check className="w-8 h-8 text-texto-soft/40" />
            <p className="text-sm text-texto-soft font-body text-center">
              Nenhuma solicitacao pendente
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendentes.map((sol) => (
              <div
                key={sol.id}
                className="mg-card-solid rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-rose text-sm font-headline font-bold">
                        {initials(sol.solicitante.nome)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-headline font-bold text-texto truncate">
                        {sol.solicitante.nome}
                      </p>
                      <p className="text-xs text-texto-soft font-body">
                        {sol.tipo.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-texto-soft font-body whitespace-nowrap flex-shrink-0">
                    {fmtDateShort(sol.criadoEm)}
                  </span>
                </div>

                {sol.justificativa && (
                  <div className="bg-surface-muted/40 rounded-xl px-4 py-3">
                    <p className="text-sm text-texto font-body">{sol.justificativa}</p>
                  </div>
                )}

                <p className="text-xs text-texto-soft font-body">
                  Expira em: {fmtDate(sol.expiradoEm)}
                </p>

                {respondendo === sol.id && (
                  <div>
                    <textarea
                      className="mg-input resize-none"
                      rows={2}
                      placeholder="Mensagem (opcional)..."
                      value={mensagemResposta}
                      onChange={(e) => setMensagemResposta(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {respondendo === sol.id ? (
                    <>
                      <button
                        onClick={() => handleResponder(sol.id, 'APROVAR')}
                        className="mg-btn text-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirmar Aprovacao
                      </button>
                      <button
                        onClick={() => handleResponder(sol.id, 'RECUSAR')}
                        className="mg-btn-secondary text-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                        Confirmar Recusa
                      </button>
                      <button
                        onClick={() => handleResponder(sol.id, 'SUGERIR')}
                        className="mg-btn-ghost text-sm"
                      >
                        Enviar Sugestao
                      </button>
                      <button
                        onClick={() => {
                          setRespondendo(null);
                          setMensagemResposta('');
                        }}
                        className="mg-btn-ghost text-sm"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleResponder(sol.id, 'APROVAR')}
                        className="mg-btn text-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleResponder(sol.id, 'RECUSAR')}
                        className="mg-btn-secondary text-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                        Recusar
                      </button>
                      <button
                        onClick={() => setRespondendo(sol.id)}
                        className="mg-btn-ghost text-sm"
                      >
                        Sugerir
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. GUARDAS TEMPORÁRIAS ──────────────────────────────────────────── */}
      <div className="mg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-teal" />
            </div>
            <h3 className="font-headline text-lg font-bold text-texto">
              Guardas Temporarias
            </h3>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mg-btn-ghost text-sm"
          >
            {showForm ? (
              <>
                <X className="w-3.5 h-3.5" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Nova
              </>
            )}
          </button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="space-y-3 mg-card-solid rounded-xl p-5">
            <h4 className="font-headline font-bold text-texto text-sm">Nova guarda temporaria</h4>
            <div>
              <label className="mg-label">Responsavel</label>
              <select
                className="mg-select"
                value={formData.responsavelId}
                onChange={(e) =>
                  setFormData({ ...formData, responsavelId: e.target.value })
                }
              >
                <option value="">Selecione...</option>
                {tutores
                  .filter((t) => t.ativo)
                  .map((t) => (
                    <option key={t.usuarioId} value={t.usuarioId}>
                      {t.usuario.nome} — {ROLE_LABELS[t.role] || t.role}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mg-label">Data Inicio</label>
                <input
                  type="date"
                  className="mg-input"
                  value={formData.dataInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, dataInicio: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mg-label">Data Fim</label>
                <input
                  type="date"
                  className="mg-input"
                  value={formData.dataFim}
                  onChange={(e) =>
                    setFormData({ ...formData, dataFim: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="mg-label">Observacoes</label>
              <textarea
                className="mg-input resize-none"
                rows={2}
                placeholder="Observacoes opcionais..."
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
              />
            </div>

            <button
              onClick={handleCriarTemporaria}
              disabled={formLoading || !formData.dataInicio || !formData.dataFim}
              className={cn(
                'mg-btn w-full text-sm',
                (formLoading || !formData.dataInicio || !formData.dataFim) &&
                  'opacity-40 cursor-not-allowed',
              )}
            >
              {formLoading ? 'Criando...' : 'Criar Guarda Temporaria'}
            </button>
          </div>
        )}

        {/* List */}
        {temporarias.length === 0 && !showForm ? (
          <div className="mg-card-solid rounded-xl py-8 flex flex-col items-center gap-2">
            <Calendar className="w-8 h-8 text-texto-soft/40" />
            <p className="text-sm text-texto-soft font-body text-center">
              Nenhuma guarda temporaria registrada
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {temporarias.map((gt) => {
              const nome =
                gt.responsavel?.nome ||
                gt.petPrestador?.prestador?.usuario?.nome ||
                'Responsável';
              const statusKey = gt.status;
              return (
                <div
                  key={gt.id}
                  className="mg-card-solid rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-teal text-sm font-headline font-bold">
                          {initials(nome)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-headline font-bold text-texto truncate">{nome}</p>
                        <p className="text-xs text-texto-soft font-body">
                          {fmtDateShort(gt.dataInicio)} — {fmtDateShort(gt.dataFim)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'mg-badge flex-shrink-0',
                        STATUS_COLORS[statusKey] || 'mg-badge',
                      )}
                    >
                      {STATUS_LABELS[statusKey] || statusKey}
                    </span>
                  </div>

                  {gt.observacoes && (
                    <p className="text-xs text-texto-soft font-body pl-13">{gt.observacoes}</p>
                  )}

                  {(statusKey === 'AGENDADA' || statusKey === 'CONFIRMADA' || statusKey === 'EM_ANDAMENTO') && (
                    <div className="flex gap-2 pl-13">
                      {statusKey === 'AGENDADA' && (
                        <button
                          onClick={() => handleConfirmarTemporaria(gt.id)}
                          className="mg-btn text-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Confirmar
                        </button>
                      )}
                      <button
                        onClick={() => handleCancelarTemporaria(gt.id)}
                        className="mg-btn-secondary text-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 4. HISTÓRICO DE TROCAS ──────────────────────────────────────────── */}
      <div className="mg-card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-rose" />
          </div>
          <h3 className="font-headline text-lg font-bold text-texto">
            Historico de Trocas
          </h3>
        </div>

        {historico.length === 0 ? (
          <div className="mg-card-solid rounded-xl py-8 flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-texto-soft/40" />
            <p className="text-sm text-texto-soft font-body text-center">
              Nenhum evento de guarda registrado
            </p>
          </div>
        ) : (
          <div className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-surface-muted" />

            <div className="space-y-3">
              {historico.map((evt) => (
                <div key={evt.id} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-white" />

                  <div className="mg-card-solid rounded-xl p-3 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-headline font-bold text-texto">
                        {evt.titulo}
                      </p>
                      <span className="text-xs text-texto-soft font-body whitespace-nowrap flex-shrink-0">
                        {fmtDateShort(evt.criadoEm)}
                      </span>
                    </div>
                    {evt.descricao && (
                      <p className="text-xs text-texto-soft font-body">
                        {evt.descricao}
                      </p>
                    )}
                    <span className="mg-badge mg-badge-primary">
                      {evt.tipo.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
