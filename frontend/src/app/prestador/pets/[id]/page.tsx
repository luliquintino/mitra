'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { prestadoresApi, healthApi, registrosApi, governanceApi } from '@/lib/api';
import { Pet, Registro, TipoRegistro, Evento, Vacina, Medicamento, PetUsuario } from '@/types';
import {
  especieLabel,
  generoLabel,
  petAge,
  formatDate,
  eventoIcon,
  formatRelative,
  cn,
} from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { PetImage } from '@/components/PetImage';
import { generatePrestadorBriefing, BriefingCard } from '@/lib/smart-cards';

// ─── Action configuration by profissao ───────────────────────────────────────

interface AcaoConfig {
  icon: string;
  label: string;
  tipo: TipoRegistro;
  tituloDefault: string;
}

function getAcoesByProfissao(profissao: string | undefined): AcaoConfig[] {
  switch (profissao) {
    case 'VETERINARIO':
    case 'VETERINARIA':
      return [
        { icon: '🏥', label: 'Registrar consulta', tipo: 'OBSERVACAO', tituloDefault: 'Consulta veterinária' },
        { icon: '💉', label: 'Registrar vacina', tipo: 'OBSERVACAO', tituloDefault: 'Vacinação' },
        { icon: '📝', label: 'Observação clínica', tipo: 'OBSERVACAO', tituloDefault: 'Observação clínica' },
      ];
    case 'HOTEL':
    case 'DAY_CARE':
    case 'CRECHE':
      return [
        { icon: '🏨', label: 'Check-in', tipo: 'CHECK_IN', tituloDefault: 'Check-in realizado' },
        { icon: '🚪', label: 'Check-out', tipo: 'CHECK_OUT', tituloDefault: 'Check-out realizado' },
        { icon: '📝', label: 'Registrar comportamento', tipo: 'OBSERVACAO', tituloDefault: 'Observação de comportamento' },
      ];
    case 'ADESTRADOR':
      return [
        { icon: '🎯', label: 'Registrar sessão', tipo: 'SESSAO', tituloDefault: 'Sessão de adestramento' },
        { icon: '⭐', label: 'Registrar progresso', tipo: 'PROGRESSO', tituloDefault: 'Progresso registrado' },
        { icon: '🏋️', label: 'Registrar exercício', tipo: 'SESSAO', tituloDefault: 'Exercício realizado' },
      ];
    case 'PET_SITTER':
    case 'PASSEADOR':
    case 'CUIDADOR':
    default:
      return [
        { icon: '🐕', label: 'Registrar visita', tipo: 'VISITA', tituloDefault: 'Visita realizada' },
        { icon: '🍽️', label: 'Registrar alimentação', tipo: 'ALIMENTACAO', tituloDefault: 'Alimentação realizada' },
        { icon: '📝', label: 'Registrar observação', tipo: 'OBSERVACAO', tituloDefault: 'Observação' },
      ];
  }
}

// ─── Registro Modal ───────────────────────────────────────────────────────────

interface RegistroModalProps {
  petNome: string;
  acao: AcaoConfig;
  onClose: () => void;
  onSaved: (ev: Evento) => void;
  petId: string;
}

function RegistroModal({ petNome, acao, onClose, onSaved, petId }: RegistroModalProps) {
  const [titulo, setTitulo] = useState(acao.tituloDefault);
  const [descricao, setDescricao] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const registro: Registro = {
        tipo: acao.tipo,
        titulo: titulo || acao.tituloDefault,
        descricao: descricao || undefined,
      };
      const { data } = await registrosApi.create(petId, registro);
      onSaved(data as Evento);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao registrar. Tente novamente.');
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl p-6 space-y-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-texto">
              {acao.icon} {acao.label}
            </h3>
            <p className="text-xs text-texto-soft">{petNome}</p>
          </div>
          <button onClick={onClose} className="text-texto-soft hover:text-texto text-xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="pt-label">Título</label>
            <input
              type="text"
              className="pt-input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={acao.tituloDefault}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="pt-label">Descrição (opcional)</label>
            <textarea
              className="pt-input resize-none"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={
                acao.tipo === 'VISITA'
                  ? 'Duração, comportamento, locais visitados...'
                  : acao.tipo === 'ALIMENTACAO'
                  ? 'Horário, quantidade, ração utilizada...'
                  : acao.tipo === 'SESSAO'
                  ? 'Exercícios praticados, duração, observações...'
                  : acao.tipo === 'PROGRESSO'
                  ? 'Habilidade desenvolvida, nível de evolução...'
                  : 'Detalhes adicionais...'
              }
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="pt-btn flex-1"
            >
              {saving ? 'Registrando...' : 'Registrar'}
            </button>
            <button type="button" onClick={onClose} className="pt-btn-secondary px-4">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrestadorPetPage() {
  const params = useParams();
  const petId = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [sintomas, setSintomas] = useState<{ id: string; descricao: string; dataFim?: string; intensidade?: number }[]>([]);
  const [tutores, setTutores] = useState<PetUsuario[]>([]);
  const [permissoes, setPermissoes] = useState<string[]>([]);
  const [registros, setRegistros] = useState<Evento[]>([]);
  const [loadingRegistros, setLoadingRegistros] = useState(false);

  // Modal state
  const [activeAcao, setActiveAcao] = useState<AcaoConfig | null>(null);

  const acoes = getAcoesByProfissao(user?.profissao);

  const loadPet = useCallback(async () => {
    try {
      const { data: petData } = await prestadoresApi.getPet(petId);
      if (!petData) {
        setError('Pet não encontrado ou você não tem acesso a este pet.');
        setLoading(false);
        return;
      }
      setPet((petData as any) as Pet);
      const perms = (petData as any)?.permissoes || [];
      setPermissoes(perms);

      // Fetch health data in parallel if permitted
      const healthFetches: Promise<void>[] = [];
      if (perms.includes('VISUALIZAR') || perms.includes('REGISTRAR_VACINA')) {
        healthFetches.push(
          healthApi.vacinas(petId).then(({ data }) => setVacinas((data as Vacina[]) || [])).catch(() => {}),
          healthApi.medicamentos(petId).then(({ data }) => setMedicamentos((data as Medicamento[]) || [])).catch(() => {}),
          healthApi.sintomas(petId).then(({ data }) => setSintomas((data as any[]) || [])).catch(() => {}),
          governanceApi.tutores(petId).then(({ data }) => setTutores((data as unknown as PetUsuario[]) || [])).catch(() => {}),
        );
      }
      await Promise.all(healthFetches);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar dados do pet.');
    } finally {
      setLoading(false);
    }
  }, [petId]);

  const loadRegistros = useCallback(async () => {
    setLoadingRegistros(true);
    try {
      const { data } = await registrosApi.listMeus(petId);
      setRegistros((data as Evento[]) || []);
    } catch {
      // silent
    } finally {
      setLoadingRegistros(false);
    }
  }, [petId]);

  useEffect(() => {
    if (petId) {
      loadPet();
      loadRegistros();
    }
  }, [petId, loadPet, loadRegistros]);

  const handleRegistroSaved = (ev: Evento) => {
    setActiveAcao(null);
    setRegistros((prev) => [ev, ...prev]);
  };

  // Generate briefing cards (must be before any early returns)
  const briefingCards = useMemo(() => {
    if (!pet) return [];
    return generatePrestadorBriefing(pet, vacinas, medicamentos, sintomas, tutores);
  }, [pet, vacinas, medicamentos, sintomas, tutores]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="pt-card h-20 pt-skeleton" />
        ))}
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="pt-card bg-erro-light p-6 text-center">
        <p className="text-red-800 font-medium">{error || 'Pet não encontrado'}</p>
        <button onClick={() => router.push('/home')} className="pt-btn mt-4">
          Voltar para home
        </button>
      </div>
    );
  }

  if (!permissoes.includes('VISUALIZAR')) {
    return (
      <div className="pt-card bg-amber-50 p-6 text-center">
        <p className="text-amber-800 font-medium">
          Você não tem permissão para visualizar este pet
        </p>
        <button onClick={() => router.push('/home')} className="pt-btn mt-4">
          Voltar para home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Briefing de entrada ── */}
      {briefingCards.length > 0 && (
        <div className="space-y-2 animate-slide-up">
          <p className="font-headline text-xs uppercase tracking-[0.2em] text-texto-soft font-semibold px-1">
            Briefing de {pet.nome}
          </p>
          <div className="space-y-1.5">
            {briefingCards.map((card) => (
              <div
                key={card.id}
                className={cn(
                  'rounded-2xl p-3.5 flex items-center gap-3',
                  card.status === 'ok' && 'bg-emerald-50',
                  card.status === 'warning' && 'bg-amber-50',
                  card.status === 'info' && 'bg-blue-50',
                )}
              >
                <span className="text-lg flex-shrink-0">{card.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-xs font-medium uppercase tracking-wide',
                    card.status === 'ok' && 'text-emerald-600',
                    card.status === 'warning' && 'text-amber-600',
                    card.status === 'info' && 'text-blue-600',
                  )}>
                    {card.label}
                  </p>
                  <p className={cn(
                    'text-sm font-medium leading-snug',
                    card.status === 'ok' && 'text-emerald-800',
                    card.status === 'warning' && 'text-amber-800',
                    card.status === 'info' && 'text-blue-800',
                  )}>
                    {card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dados do pet */}
      <div className="pt-card space-y-4">
        <div className="flex items-center gap-4">
          <PetImage
            fotoUrl={pet.fotoUrl}
            nome={pet.nome}
            especie={pet.especie}
            className="w-20 h-20 bg-gradient-to-br from-coral-light to-coral-light/60"
            fallbackClassName="bg-gradient-to-br from-coral-light to-coral-light/60"
          />
          <div>
            <h2 className="text-xl font-bold text-texto tracking-tight">{pet.nome}</h2>
            <p className="text-sm text-texto-soft">
              {especieLabel(pet.especie)}
              {pet.raca ? ` · ${pet.raca}` : ''}
            </p>
            {pet.dataNascimento && (
              <p className="text-xs text-texto-soft mt-0.5">
                {petAge(pet.dataNascimento)} · nascido em {formatDate(pet.dataNascimento)}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {pet.genero && (
            <div className="bg-white rounded-xl px-3 py-2">
              <p className="text-xs text-texto-soft">Gênero</p>
              <p className="text-sm font-medium text-texto">{generoLabel(pet.genero)}</p>
            </div>
          )}
          {pet.cor && (
            <div className="bg-white rounded-xl px-3 py-2">
              <p className="text-xs text-texto-soft">Cor</p>
              <p className="text-sm font-medium text-texto">{pet.cor}</p>
            </div>
          )}
          {pet.peso && (
            <div className="bg-white rounded-xl px-3 py-2">
              <p className="text-xs text-texto-soft">Peso</p>
              <p className="text-sm font-medium text-texto">{pet.peso} kg</p>
            </div>
          )}
          {pet.microchip && (
            <div className="bg-white rounded-xl px-3 py-2">
              <p className="text-xs text-texto-soft">Microchip</p>
              <p className="text-sm font-medium text-texto truncate">{pet.microchip}</p>
            </div>
          )}
        </div>

        {pet.observacoes && (
          <div className="bg-white rounded-xl px-3 py-2.5">
            <p className="text-xs text-texto-soft mb-1">Observações do tutor</p>
            <p className="text-sm text-texto">{pet.observacoes}</p>
          </div>
        )}
      </div>

      {/* ── Ações por tipo de prestador ── */}
      {permissoes.includes('REGISTRAR_SERVICO') && (
        <div className="pt-card space-y-3">
          <p className="pt-section-title">Registrar serviço</p>
          <div className="grid grid-cols-3 gap-2">
            {acoes.map((acao) => (
              <button
                key={`${acao.tipo}-${acao.label}`}
                onClick={() => setActiveAcao(acao)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white hover:bg-coral-light/50 transition-all active:scale-[0.95]"
              >
                <span className="text-2xl">{acao.icon}</span>
                <span className="text-xs font-medium text-texto-soft text-center leading-tight">
                  {acao.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Vacinações — se autorizado ── */}
      {permissoes.includes('REGISTRAR_VACINA') && (
        <div className="pt-card space-y-3">
          <p className="pt-section-title">Vacinações</p>
          {vacinas.length === 0 ? (
            <p className="text-sm text-texto-soft text-center py-4">
              Nenhuma vacinação registrada
            </p>
          ) : (
            <div className="space-y-2">
              {vacinas.map((vacina: any) => (
                <div key={vacina.id} className="bg-white rounded-xl px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-texto">{vacina.nome || vacina.vacina}</p>
                      <p className="text-xs text-texto-soft">{formatDate(vacina.dataAplicacao || vacina.data)}</p>
                    </div>
                    {(vacina.proximaDose || vacina.proximaData) && (
                      <p className="text-xs text-amber-600">
                        Reforço: {formatDate(vacina.proximaDose || vacina.proximaData)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Meus registros recentes ── */}
      <div className="pt-card space-y-3">
        <p className="pt-section-title">Meus registros recentes</p>
        {loadingRegistros ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 pt-skeleton rounded-xl" />
            ))}
          </div>
        ) : registros.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-texto-soft">
              Nenhum registro ainda. Use os botões acima para registrar!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {registros.slice(0, 5).map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-3 py-2.5"
              >
                <span className="text-xl w-8 text-center">{eventoIcon(ev.tipo)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-texto truncate">{ev.titulo}</p>
                  <p className="text-xs text-texto-soft">{formatRelative(ev.criadoEm)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registro modal */}
      {activeAcao && (
        <RegistroModal
          petId={petId}
          petNome={pet.nome}
          acao={activeAcao}
          onClose={() => setActiveAcao(null)}
          onSaved={handleRegistroSaved}
        />
      )}
    </div>
  );
}
