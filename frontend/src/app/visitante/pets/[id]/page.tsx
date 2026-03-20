'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { visitantesApi, governanceApi, healthApi, eventsApi, registrosApi } from '@/lib/api';
import { VisitantePet, Vacina, Medicamento, Evento, PermissaoVisitante, PetUsuario } from '@/types';
import { especieLabel, petAge, eventoIcon, formatRelative } from '@/lib/utils';
import { PetImage } from '@/components/PetImage';
import { useAuth } from '@/contexts/AuthContext';

// ─── Helper components ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-card">
      <h3 className="pt-section-title mb-3">{title}</h3>
      {children}
    </div>
  );
}

function LockedSection({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-creme-dark p-4 opacity-50">
      <div className="flex items-center gap-2.5 text-texto-soft">
        <span className="text-base">🔒</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-xs text-texto-soft mt-1 ml-[30px]">Sem permissão para visualizar.</p>
    </div>
  );
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    TUTOR_PRINCIPAL: 'Tutor principal',
    TUTOR_EMERGENCIA: 'Tutor de emergência',
    FAMILIAR: 'Familiar',
    AMIGO: 'Amigo',
    PASSEADOR: 'Passeador',
    ADESTRADOR: 'Adestrador',
    VETERINARIO: 'Veterinário',
    OUTRO: 'Outro',
  };
  return map[role] || role;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VisitantePetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params?.id as string;
  const { user } = useAuth();

  const [pet, setPet] = useState<VisitantePet | null>(null);
  const [tutores, setTutores] = useState<PetUsuario[]>([]);
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);

  // Observation form state
  const [observacao, setObservacao] = useState('');
  const [savingObs, setSavingObs] = useState(false);
  const [obsSuccess, setObsSuccess] = useState(false);
  const [obsError, setObsError] = useState('');

  useEffect(() => {
    visitantesApi
      .listPets()
      .then(({ data }) => {
        const found = (data as VisitantePet[]).find((p) => p.id === petId);
        if (found) {
          setPet(found);
          return found;
        }
        router.replace('/visitante/pets');
        return null;
      })
      .catch(() => router.replace('/visitante/pets'))
      .finally(() => setLoading(false));
  }, [petId, router]);

  // Load data based on permissions
  useEffect(() => {
    if (!pet) return;
    const perms = new Set(pet.permissoesVisualizacao);

    // Always load tutores for "Quem cuida" section (public caretaker info)
    governanceApi.tutores(petId).then(({ data }) => {
      setTutores((data as unknown as PetUsuario[]) || []);
    }).catch(() => {});

    if (perms.has('HISTORICO_VACINACAO')) {
      healthApi.vacinas(petId).then(({ data }) => setVacinas(data as Vacina[])).catch(() => {});
    }
    if (perms.has('MEDICAMENTOS')) {
      healthApi.medicamentos(petId).then(({ data }) => setMedicamentos(data as Medicamento[])).catch(() => {});
    }
    if (perms.has('TIMELINE_ATUALIZACOES')) {
      eventsApi.historico(petId).then(({ data }) => {
        const raw = data as any;
        const flat: Evento[] = Array.isArray(raw?.eventos) ? raw.eventos : Array.isArray(raw) ? raw : [];
        flat.sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
        setEventos(flat.slice(0, 10));
      }).catch(() => {});
    }
  }, [pet, petId]);

  const handleLeave = async () => {
    if (!confirm('Tem certeza que deseja sair do acompanhamento deste pet?')) return;
    setLeaving(true);
    try {
      await visitantesApi.selfRevoke(petId);
      router.replace('/visitante/pets');
    } catch {
      setLeaving(false);
    }
  };

  const handleSubmitObservacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observacao.trim()) return;
    setSavingObs(true);
    setObsError('');
    try {
      await registrosApi.create(petId, {
        tipo: 'OBSERVACAO',
        titulo: `Observação de ${user?.nome || 'visitante'}`,
        descricao: observacao.trim(),
      });
      setObsSuccess(true);
      setObservacao('');
      setTimeout(() => setObsSuccess(false), 3000);
    } catch (err: any) {
      setObsError(err?.response?.data?.message || 'Erro ao registrar. Tente novamente.');
    } finally {
      setSavingObs(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pet) return null;

  const has = (p: PermissaoVisitante) => pet.permissoesVisualizacao.includes(p);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Pet header ── */}
      <div className="pt-card">
        <div className="flex items-start gap-4">
          <PetImage
            fotoUrl={pet.fotoUrl}
            nome={pet.nome}
            especie={pet.especie}
            className="w-20 h-20 bg-creme-dark"
            fallbackClassName="bg-creme-dark"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-texto">{pet.nome}</h2>
            <p className="text-sm text-texto-soft">
              {especieLabel(pet.especie)}
              {pet.raca ? ` · ${pet.raca}` : ''}
            </p>
            {pet.dataNascimento && (
              <p className="text-xs text-texto-soft mt-0.5">{petAge(pet.dataNascimento)}</p>
            )}
            {pet.relacao && (
              <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-creme-dark text-texto-soft mt-2">
                {pet.relacao}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Quem cuida do pet (always visible) ── */}
      <Section title={`Quem cuida de ${pet.nome}`}>
        {tutores.length === 0 ? (
          <p className="text-sm text-texto-soft">Informações dos tutores não disponíveis.</p>
        ) : (
          <div className="space-y-2">
            {tutores.map((t) => (
              <div key={t.usuarioId} className="flex items-center gap-3 py-1.5">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-coral-light flex items-center justify-center text-sm font-bold text-coral flex-shrink-0">
                  {(t.usuario?.nome || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-texto truncate">
                    {t.usuario?.nome || 'Tutor'}
                  </p>
                  <p className="text-xs text-texto-soft">{roleLabel(t.role)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Health status ── */}
      {has('STATUS_SAUDE') && (
        <Section title="Status de saúde">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-green-50">
              <p className="text-xs text-green-600 font-medium">Vacinas</p>
              <p className="text-lg font-bold text-green-700">{vacinas.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50">
              <p className="text-xs text-blue-600 font-medium">Medicamentos ativos</p>
              <p className="text-lg font-bold text-blue-700">
                {medicamentos.filter((m) => m.status === 'ATIVO').length}
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* ── Vaccination history ── */}
      {has('HISTORICO_VACINACAO') ? (
        <Section title="Vacinação">
          {vacinas.length === 0 ? (
            <p className="text-sm text-texto-soft">Nenhuma vacina registrada.</p>
          ) : (
            <div className="space-y-2">
              {vacinas.slice(0, 5).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-texto">{v.nome}</p>
                    <p className="text-xs text-texto-soft">
                      {new Date(v.dataAplicacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {v.proximaDose && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                      Próx: {new Date(v.proximaDose).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      ) : (
        <LockedSection label="Vacinação" />
      )}

      {/* ── Medications ── */}
      {has('MEDICAMENTOS') ? (
        <Section title="Medicamentos">
          {medicamentos.length === 0 ? (
            <p className="text-sm text-texto-soft">Nenhum medicamento registrado.</p>
          ) : (
            <div className="space-y-2">
              {medicamentos
                .filter((m) => m.status === 'ATIVO')
                .map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-texto">{m.nome}</p>
                      <p className="text-xs text-texto-soft">
                        {m.dosagem} · {m.frequencia}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      Ativo
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Section>
      ) : (
        <LockedSection label="Medicamentos" />
      )}

      {/* ── Timeline + Observation form (if TIMELINE_ATUALIZACOES) ── */}
      {has('TIMELINE_ATUALIZACOES') ? (
        <>
          {/* Observation form */}
          <Section title="Adicionar observação">
            {obsSuccess ? (
              <div className="text-center py-2">
                <p className="text-sm text-green-700 font-medium">Observação registrada!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitObservacao} className="space-y-2">
                <textarea
                  className="pt-input resize-none w-full"
                  rows={3}
                  maxLength={280}
                  placeholder={`Ex: ${pet.nome} comeu pouco hoje, estava um pouco quieto...`}
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-texto-soft">{observacao.length}/280</span>
                  <button
                    type="submit"
                    disabled={savingObs || !observacao.trim()}
                    className="pt-btn text-sm px-4 py-1.5"
                  >
                    {savingObs ? 'Registrando...' : 'Registrar'}
                  </button>
                </div>
                {obsError && <p className="text-xs text-red-600">{obsError}</p>}
              </form>
            )}
          </Section>

          {/* Timeline feed */}
          <Section title="Atualizações recentes">
            {eventos.length === 0 ? (
              <p className="text-sm text-texto-soft">Nenhuma atualização recente.</p>
            ) : (
              <div className="space-y-2">
                {eventos.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start gap-3 py-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-base flex-shrink-0">
                      {eventoIcon(ev.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-texto leading-snug">
                        {ev.titulo}
                      </p>
                      {ev.descricao && (
                        <p className="text-xs text-texto-soft mt-0.5 line-clamp-1">{ev.descricao}</p>
                      )}
                      <p className="text-xs text-texto-soft mt-1">
                        {formatRelative(ev.criadoEm)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </>
      ) : (
        <LockedSection label="Timeline de atualizações" />
      )}

      {/* Locked sections */}
      {!has('AGENDA_CONSULTAS') && <LockedSection label="Agenda de consultas" />}
      {!has('PRESTADORES_PET') && <LockedSection label="Prestadores" />}

      {/* Leave button */}
      <div className="pt-2 pb-6">
        <button
          onClick={handleLeave}
          disabled={leaving}
          className="w-full py-3 text-sm font-medium text-erro bg-erro-light hover:bg-red-100 rounded-xl transition-colors"
        >
          {leaving ? 'Saindo...' : 'Sair do acompanhamento'}
        </button>
      </div>
    </div>
  );
}
