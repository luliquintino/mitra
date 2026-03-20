'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { governanceApi, custodyApi, eventsApi } from '@/lib/api';
import type { PetUsuario, Solicitacao, GuardaTemporaria, Evento } from '@/types';
import { cn } from '@/lib/utils';

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
  AGENDADA: 'bg-amarelo/20 text-amarelo-dark',
  CONFIRMADA: 'bg-menta/20 text-menta-dark',
  EM_ANDAMENTO: 'bg-menta/20 text-menta-dark',
  CONCLUIDA: 'bg-azul/20 text-azul-dark',
  CANCELADA: 'bg-erro/20 text-erro',
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
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-headline font-extrabold text-4xl tracking-tighter text-coral mb-1">
          Guarda
        </h2>
        <p className="text-azul font-medium text-base">
          Gerencie a guarda e custodia do pet
        </p>
      </div>

      {/* ── 1. GUARDA ATUAL ──────────────────────────────────────────────────── */}
      <section>
        <h3 className="font-headline font-bold text-lg text-menta-dark mb-3 tracking-tight">
          Guarda Atual
        </h3>

        {guardiao ? (
          <div className="bg-menta-light border-2 border-menta/30 rounded-2xl p-5 flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-menta flex items-center justify-center text-white font-bold text-lg shrink-0">
              {guardiao.usuario.avatarUrl ? (
                <img
                  src={guardiao.usuario.avatarUrl}
                  alt={guardiao.usuario.nome}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                initials(guardiao.usuario.nome)
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg text-azul-dark truncate">
                {guardiao.usuario.nome}
              </p>
              <span className="inline-block bg-menta/20 text-menta-dark text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5">
                {ROLE_LABELS[guardiao.role] || guardiao.role}
              </span>
              <p className="text-sm text-azul/70 mt-1">
                Desde: {fmtDate(guardiao.adicionadoEm)}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-creme rounded-2xl p-5 text-center text-azul/60">
            Nenhum tutor principal definido.
          </div>
        )}
      </section>

      {/* ── 2. SOLICITAÇÕES PENDENTES ───────────────────────────────────────── */}
      <section>
        <h3 className="font-headline font-bold text-lg text-coral mb-3 tracking-tight">
          Solicitações Pendentes
        </h3>

        {pendentes.length === 0 ? (
          <div className="bg-creme rounded-2xl p-5 text-center text-azul/60">
            Nenhuma solicitação pendente
          </div>
        ) : (
          <div className="space-y-3">
            {pendentes.map((sol) => (
              <div
                key={sol.id}
                className="bg-white border border-coral/20 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-bold text-azul-dark">
                      {sol.solicitante.nome}
                    </p>
                    <span className="text-xs text-azul/60">
                      {sol.tipo.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-azul/50 whitespace-nowrap">
                    {fmtDateShort(sol.criadoEm)}
                  </span>
                </div>

                {sol.justificativa && (
                  <p className="text-sm text-azul/80 bg-creme rounded-xl p-3 mb-3">
                    {sol.justificativa}
                  </p>
                )}

                <p className="text-xs text-azul/50 mb-3">
                  Expira em: {fmtDate(sol.expiradoEm)}
                </p>

                {respondendo === sol.id && (
                  <div className="mb-3">
                    <textarea
                      className="w-full border border-azul/20 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-menta/50"
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
                        className="px-4 py-2 bg-menta text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Confirmar Aprovação
                      </button>
                      <button
                        onClick={() => handleResponder(sol.id, 'RECUSAR')}
                        className="px-4 py-2 bg-erro text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Confirmar Recusa
                      </button>
                      <button
                        onClick={() => handleResponder(sol.id, 'SUGERIR')}
                        className="px-4 py-2 bg-azul text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Enviar Sugestão
                      </button>
                      <button
                        onClick={() => {
                          setRespondendo(null);
                          setMensagemResposta('');
                        }}
                        className="px-4 py-2 bg-creme text-azul/70 text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleResponder(sol.id, 'APROVAR')}
                        className="px-4 py-2 bg-menta text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleResponder(sol.id, 'RECUSAR')}
                        className="px-4 py-2 bg-erro text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Recusar
                      </button>
                      <button
                        onClick={() => setRespondendo(sol.id)}
                        className="px-4 py-2 bg-azul text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
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
      </section>

      {/* ── 3. GUARDAS TEMPORÁRIAS ──────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-headline font-bold text-lg text-azul-dark tracking-tight">
            Guardas Temporárias
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 bg-azul text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            {showForm ? 'Cancelar' : '+ Nova guarda temporária'}
          </button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="bg-azul-light border border-azul/20 rounded-2xl p-5 mb-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-azul-dark mb-1">
                Responsável (selecionar)
              </label>
              <select
                className="w-full border border-azul/20 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-azul/50"
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
                <label className="block text-xs font-semibold text-azul-dark mb-1">
                  Data Início
                </label>
                <input
                  type="date"
                  className="w-full border border-azul/20 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-azul/50"
                  value={formData.dataInicio}
                  onChange={(e) =>
                    setFormData({ ...formData, dataInicio: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-azul-dark mb-1">
                  Data Fim
                </label>
                <input
                  type="date"
                  className="w-full border border-azul/20 rounded-xl p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-azul/50"
                  value={formData.dataFim}
                  onChange={(e) =>
                    setFormData({ ...formData, dataFim: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-azul-dark mb-1">
                Observações
              </label>
              <textarea
                className="w-full border border-azul/20 rounded-xl p-2.5 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-azul/50"
                rows={2}
                placeholder="Observações opcionais..."
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
                'w-full py-2.5 text-white text-sm font-semibold rounded-xl transition-opacity',
                formLoading || !formData.dataInicio || !formData.dataFim
                  ? 'bg-azul/40 cursor-not-allowed'
                  : 'bg-azul hover:opacity-90',
              )}
            >
              {formLoading ? 'Criando...' : 'Criar Guarda Temporária'}
            </button>
          </div>
        )}

        {/* List */}
        {temporarias.length === 0 && !showForm ? (
          <div className="bg-creme rounded-2xl p-5 text-center text-azul/60">
            Nenhuma guarda temporária registrada
          </div>
        ) : (
          <div className="space-y-3">
            {temporarias.map((gt) => {
              const nome =
                gt.responsavel?.nome ||
                gt.petPrestador?.prestador?.usuario?.nome ||
                'Responsável';
              const statusKey = gt.status;
              return (
                <div
                  key={gt.id}
                  className="bg-white border border-azul/15 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-bold text-azul-dark">{nome}</p>
                    <span
                      className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-full',
                        STATUS_COLORS[statusKey] || 'bg-creme text-azul/60',
                      )}
                    >
                      {STATUS_LABELS[statusKey] || statusKey}
                    </span>
                  </div>

                  <p className="text-sm text-azul/70">
                    {fmtDateShort(gt.dataInicio)} — {fmtDateShort(gt.dataFim)}
                  </p>

                  {gt.observacoes && (
                    <p className="text-xs text-azul/60 mt-1">{gt.observacoes}</p>
                  )}

                  {(statusKey === 'AGENDADA' || statusKey === 'CONFIRMADA' || statusKey === 'EM_ANDAMENTO') && (
                    <div className="flex gap-2 mt-3">
                      {statusKey === 'AGENDADA' && (
                        <button
                          onClick={() => handleConfirmarTemporaria(gt.id)}
                          className="px-3 py-1.5 bg-menta text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
                        >
                          Confirmar
                        </button>
                      )}
                      <button
                        onClick={() => handleCancelarTemporaria(gt.id)}
                        className="px-3 py-1.5 bg-erro text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 4. HISTÓRICO DE TROCAS ──────────────────────────────────────────── */}
      <section>
        <h3 className="font-headline font-bold text-lg text-rosa-dark mb-3 tracking-tight">
          Histórico de Trocas
        </h3>

        {historico.length === 0 ? (
          <div className="bg-creme rounded-2xl p-5 text-center text-azul/60">
            Nenhum evento de guarda registrado
          </div>
        ) : (
          <div className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-rosa/30" />

            <div className="space-y-4">
              {historico.map((evt) => (
                <div key={evt.id} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[18px] top-1.5 w-3 h-3 rounded-full bg-rosa border-2 border-white" />

                  <div className="bg-white border border-rosa/15 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-azul-dark">
                        {evt.titulo}
                      </p>
                      <span className="text-xs text-azul/50 whitespace-nowrap shrink-0">
                        {fmtDateShort(evt.criadoEm)}
                      </span>
                    </div>
                    {evt.descricao && (
                      <p className="text-xs text-azul/70 mt-1">
                        {evt.descricao}
                      </p>
                    )}
                    <span className="inline-block text-[10px] font-medium text-rosa/70 bg-rosa/10 px-1.5 py-0.5 rounded mt-1.5">
                      {evt.tipo.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
