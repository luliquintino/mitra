'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { petsApi, governanceApi, usersApi, custodyApi } from '@/lib/api';
import { BottomSheet } from '@/components/BottomSheet';
import { Pet, PetUsuario, PetVisitante } from '@/types';
import {
  especieLabel,
  generoLabel,
  petAge,
  formatDate,
  roleLabel,
  getInitials,
  cn,
} from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { PetImage } from '@/components/PetImage';

export default function PerfilPage() {
  const params = useParams();
  const petId = params?.id as string;
  const router = useRouter();
  const { user } = useAuth();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    tipo: 'SUGESTAO',
    mensagem: '',
  });
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [showAddTutor, setShowAddTutor] = useState(false);
  const [tutorForm, setTutorForm] = useState({ email: '', role: 'TUTOR_EMERGENCIA' });
  const [tutorSaving, setTutorSaving] = useState(false);
  const [tutorError, setTutorError] = useState('');
  const [editingAirTag, setEditingAirTag] = useState(false);
  const [airTagInput, setAirTagInput] = useState('');
  const [airTagSaving, setAirTagSaving] = useState(false);
  const [airTagError, setAirTagError] = useState('');
  const [guardas, setGuardas] = useState<any[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [showGuardaForm, setShowGuardaForm] = useState(false);
  const [guardaForm, setGuardaForm] = useState({ tipo: 'TEMPORARIA', motivo: '', dataInicio: '', dataFim: '' });
  const [guardaSaving, setGuardaSaving] = useState(false);

  // Rede de Cuidado state
  const [showAddPrestador, setShowAddPrestador] = useState(false);
  const [prestadorForm, setPrestadorForm] = useState({ email: '', permissoes: [] as string[] });
  const [prestadorSaving, setPrestadorSaving] = useState(false);
  const [prestadorError, setPrestadorError] = useState('');

  const [visitantes, setVisitantes] = useState<PetVisitante[]>([]);
  const [visitantesLoading, setVisitantesLoading] = useState(false);
  const [showAddVisitante, setShowAddVisitante] = useState(false);
  const [visitanteForm, setVisitanteForm] = useState({
    email: '',
    relacao: '',
    permissoes: ['DADOS_BASICOS', 'STATUS_SAUDE'] as string[],
  });
  const [visitanteSaving, setVisitanteSaving] = useState(false);
  const [visitanteError, setVisitanteError] = useState('');

  useEffect(() => {
    Promise.all([
      petsApi.get(petId),
      custodyApi.guardas(petId),
      custodyApi.solicitacoes(petId),
    ]).then(([petRes, guardasRes, solRes]) => {
      setPet(petRes.data);
      setGuardas((guardasRes.data as any[]) || []);
      setSolicitacoes((solRes.data as any[]) || []);
    }).catch(() => router.replace('/home'))
      .finally(() => setLoading(false));

    // Load visitantes
    setVisitantesLoading(true);
    petsApi.listVisitantes(petId)
      .then(({ data }) => setVisitantes(Array.isArray(data) ? data : []))
      .catch(() => setVisitantes([]))
      .finally(() => setVisitantesLoading(false));
  }, [petId, router]);

  const handleAddTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTutorError('');
    setTutorSaving(true);
    try {
      const { data } = await governanceApi.adicionarTutor(
        petId,
        tutorForm.email,
        tutorForm.role,
      );
      setConfirmation(data.mensagem);
      setShowAddTutor(false);
      // Recarregar pet
      const { data: petData } = await petsApi.get(petId);
      setPet(petData);
      setTimeout(() => setConfirmation(''), 5000);
    } catch (err: any) {
      setTutorError(
        err?.response?.data?.message || 'Erro ao adicionar tutor.',
      );
    } finally {
      setTutorSaving(false);
    }
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSaving(true);
    try {
      const { data } = await usersApi.feedback(
        feedbackForm.tipo,
        feedbackForm.mensagem,
      );
      setConfirmation(data.mensagem);
      setShowFeedback(false);
      setFeedbackForm({ tipo: 'SUGESTAO', mensagem: '' });
      setTimeout(() => setConfirmation(''), 5000);
    } catch {
      setConfirmation('Erro ao enviar feedback. Tente novamente.');
      setTimeout(() => setConfirmation(''), 5000);
    } finally {
      setFeedbackSaving(false);
    }
  };

  const handleSaveAirTag = async () => {
    setAirTagSaving(true);
    setAirTagError('');
    try {
      const url = airTagInput.trim() || undefined;
      await petsApi.update(petId, { airTagUrl: url ?? null });
      setPet((prev) => prev ? { ...prev, airTagUrl: url } : prev);
      setEditingAirTag(false);
    } catch (err: any) {
      setAirTagError(err?.response?.data?.message || 'Erro ao salvar link. Tente novamente.');
    } finally {
      setAirTagSaving(false);
    }
  };

  const handleGuardaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardaSaving(true);
    try {
      await custodyApi.criar(petId, guardaForm);
      setConfirmation('Solicitacao enviada com sucesso!');
      setShowGuardaForm(false);
      setGuardaForm({ tipo: 'TEMPORARIA', motivo: '', dataInicio: '', dataFim: '' });
      // Refresh solicitacoes
      const { data } = await custodyApi.solicitacoes(petId);
      setSolicitacoes((data as any[]) || []);
      setTimeout(() => setConfirmation(''), 5000);
    } catch (err: any) {
      setConfirmation(err?.response?.data?.message || 'Erro ao enviar solicitacao.');
      setTimeout(() => setConfirmation(''), 5000);
    } finally {
      setGuardaSaving(false);
    }
  };

  const handleAddPrestador = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrestadorError('');
    setPrestadorSaving(true);
    try {
      await petsApi.invitePrestador(petId, prestadorForm.email, prestadorForm.permissoes.length > 0 ? prestadorForm.permissoes : undefined);
      setConfirmation('Prestador convidado com sucesso!');
      setShowAddPrestador(false);
      setPrestadorForm({ email: '', permissoes: [] });
      const { data: petData } = await petsApi.get(petId);
      setPet(petData);
      setTimeout(() => setConfirmation(''), 5000);
    } catch (err: any) {
      setPrestadorError(err?.response?.data?.message || 'Erro ao convidar prestador.');
    } finally {
      setPrestadorSaving(false);
    }
  };

  const handleAddVisitante = async (e: React.FormEvent) => {
    e.preventDefault();
    setVisitanteError('');
    setVisitanteSaving(true);
    try {
      await petsApi.inviteVisitante(petId, {
        email: visitanteForm.email,
        relacao: visitanteForm.relacao || undefined,
        permissoes: visitanteForm.permissoes,
      });
      setConfirmation('Visitante convidado com sucesso!');
      setShowAddVisitante(false);
      setVisitanteForm({ email: '', relacao: '', permissoes: ['DADOS_BASICOS', 'STATUS_SAUDE'] });
      const { data } = await petsApi.listVisitantes(petId);
      setVisitantes(Array.isArray(data) ? data : []);
      setTimeout(() => setConfirmation(''), 5000);
    } catch (err: any) {
      setVisitanteError(err?.response?.data?.message || 'Erro ao convidar visitante.');
    } finally {
      setVisitanteSaving(false);
    }
  };

  const handleRemoveVisitante = async (visitanteId: string) => {
    try {
      await petsApi.revokeVisitante(petId, visitanteId);
      setConfirmation('Acesso do visitante removido.');
      const { data } = await petsApi.listVisitantes(petId);
      setVisitantes(Array.isArray(data) ? data : []);
      setTimeout(() => setConfirmation(''), 5000);
    } catch (err: any) {
      setConfirmation(err?.response?.data?.message || 'Erro ao remover visitante.');
      setTimeout(() => setConfirmation(''), 5000);
    }
  };

  const toggleVisitantePermissao = (perm: string) => {
    setVisitanteForm((f) => ({
      ...f,
      permissoes: f.permissoes.includes(perm)
        ? f.permissoes.filter((p) => p !== perm)
        : [...f.permissoes, perm],
    }));
  };

  if (loading || !pet) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-creme">
        <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tutores = pet.petUsuarios || [];
  const plano = (pet as any).planoSaude;

  // Rede de Cuidado derived lists
  const PRESTADOR_ROLES = ['VETERINARIO', 'ADESTRADOR', 'PASSEADOR'];
  const tutoresList = tutores.filter((t) => ['TUTOR_PRINCIPAL', 'TUTOR_EMERGENCIA'].includes(t.role));
  const prestadoresList = tutores.filter((t) => PRESTADOR_ROLES.includes(t.role));

  // Compute pet age numbers for bento cards
  const ageText = pet.dataNascimento ? petAge(pet.dataNascimento) : null;
  // Extract numeric years if possible (e.g. "2 anos" -> 2)
  const ageMatch = ageText?.match(/(\d+)/);
  const ageYears = ageMatch ? parseInt(ageMatch[1]) : null;
  const humanYears = ageYears != null ? ageYears * 7 : null;

  // Weight for paw graph (scale 1-5)
  const pesoNum = pet.peso ? parseFloat(String(pet.peso)) : null;
  const pawsFilled = pesoNum != null ? Math.min(5, Math.max(1, Math.round(pesoNum / 10))) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {confirmation && (
        <div className="bg-coral-light text-coral rounded-xl px-4 py-3 flex items-center gap-3 font-body">
          <span className="text-xl">✅</span>
          <span>{confirmation}</span>
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <div className="relative">
          {/* Decorative blobs */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-rosa-light rounded-full -z-10 animate-pulse" />
          <div className="absolute -bottom-2 -right-6 w-32 h-32 bg-azul-light rounded-full -z-10" />
          {/* Pet photo */}
          <PetImage
            fotoUrl={pet.fotoUrl}
            nome={pet.nome}
            especie={pet.especie}
            className="w-64 h-64 rounded-full border-[12px] border-white shadow-xl overflow-hidden transform rotate-2"
            fallbackClassName="bg-gradient-to-br from-coral-light to-azul-light"
          />
          {/* Paw badge */}
          <div className="absolute bottom-4 right-4 bg-coral-light p-4 rounded-full shadow-lg border-4 border-white">
            <span className="text-2xl">🐾</span>
          </div>
        </div>
        <h1 className="font-headline text-5xl font-extrabold text-texto tracking-tighter text-center">
          {pet.nome}
        </h1>
        <div className="bg-azul-light text-azul px-6 py-2 rounded-full font-bold text-lg">
          {especieLabel(pet.especie)}{pet.raca ? ` · ${pet.raca}` : ''}
        </div>
      </div>

      {/* Bento Grid — Age & Weight */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Age card */}
        <div className="md:col-span-7 bg-white/70 backdrop-blur-md rounded-xl p-8 shadow-sm border-b-8 border-azul-light">
          <p className="pt-label mb-4">Idade</p>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-7xl font-extrabold text-texto">{ageYears ?? '—'}</span>
              <span className="text-lg font-body text-texto-soft ml-2">anos pet</span>
            </div>
            <div className="bg-creme rounded-full p-3">
              <span className="text-2xl text-azul">🔄</span>
            </div>
            <div>
              <span className="text-7xl font-extrabold text-rosa">{humanYears ?? '—'}</span>
              <span className="text-lg font-body text-texto-soft ml-2">anos humanos</span>
            </div>
          </div>
          {pet.dataNascimento && (
            <p className="text-sm text-texto-soft mt-3 font-body">
              Nascido em {formatDate(pet.dataNascimento)}
            </p>
          )}
        </div>

        {/* Weight card */}
        <div className="md:col-span-5 bg-white/70 backdrop-blur-md rounded-xl p-8 shadow-sm border-b-8 border-coral-light">
          <p className="pt-label mb-4">Peso</p>
          {pesoNum != null ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-extrabold text-coral">{pesoNum}</span>
                <span className="text-2xl font-body text-texto-soft">kg</span>
              </div>
              <div className="flex gap-2 mt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      'text-3xl',
                      i <= pawsFilled ? 'text-coral' : 'text-creme-dark'
                    )}
                  >
                    🐾
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-texto-soft font-body">Não informado</p>
          )}
        </div>
      </div>

      {/* Dados do pet — Detail fields */}
      <div className="pt-card space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-headline text-3xl font-extrabold text-coral">Dados do pet</p>
          <button
            onClick={() => router.push(`/pets/${petId}/editar`)}
            className="pt-btn-ghost text-sm"
          >
            <span className="text-lg">✏️</span>
            Editar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {pet.genero && (
            <Field label="Gênero" value={generoLabel(pet.genero)} />
          )}
          {pet.cor && <Field label="Cor" value={pet.cor} />}
          {pet.peso && <Field label="Peso" value={`${pet.peso} kg`} />}
          {pet.microchip && (
            <Field label="Microchip" value={pet.microchip} />
          )}
        </div>

        {pet.observacoes && (
          <div className="bg-white rounded-xl px-4 py-3">
            <p className="text-xs text-texto-soft mb-1 font-headline font-bold uppercase tracking-widest">Observações</p>
            <p className="text-sm text-texto font-body">{pet.observacoes}</p>
          </div>
        )}

        {pet.codigoPet && (
          <CodigoPetDisplay codigo={pet.codigoPet} nome={pet.nome} />
        )}

        {pet.status === 'ARQUIVADO' && (
          <div className="bg-azul-light rounded-xl px-4 py-3">
            <p className="text-sm text-azul font-headline font-bold">
              <span className="text-base align-middle mr-1">📦</span>
              Pet arquivado
            </p>
            <p className="text-xs text-azul/70 mt-0.5 font-body">
              Para reativar, todos os tutores precisam confirmar.
            </p>
          </div>
        )}
      </div>

      {/* Localização — AirTag */}
      <div className="pt-card space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-headline text-3xl font-extrabold text-rosa">Localização</p>
          {!editingAirTag && (
            <button
              onClick={() => { setAirTagInput(pet.airTagUrl ?? ''); setEditingAirTag(true); }}
              className="pt-btn-ghost text-sm"
            >
              <span className="text-lg">📍</span>
              {pet.airTagUrl ? 'Alterar' : 'Cadastrar'}
            </button>
          )}
        </div>

        {editingAirTag ? (
          <div className="space-y-3">
            <p className="text-xs text-texto-soft font-body">
              Cole o link de compartilhamento do Apple Find My (gerado pelo app no iPhone).
            </p>
            <input
              type="url"
              className="pt-input"
              placeholder="https://findmy.apple.com/..."
              value={airTagInput}
              onChange={(e) => { setAirTagInput(e.target.value); setAirTagError(''); }}
              autoFocus
            />
            {airTagError && <p className="text-xs text-erro font-body">{airTagError}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleSaveAirTag}
                disabled={airTagSaving}
                className="pt-btn flex-1 text-sm"
              >
                {airTagSaving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={() => { setEditingAirTag(false); setAirTagError(''); }}
                className="pt-btn-secondary text-sm px-4"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : pet.airTagUrl ? (
          <div className="space-y-3">
            <p className="text-xs text-texto-soft truncate font-body">
              <span className="text-sm align-middle mr-1">📡</span>
              {pet.airTagUrl}
            </p>
            <a
              href={pet.airTagUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pt-btn flex items-center justify-center gap-2 w-full text-sm"
            >
              <span className="text-lg">📍</span>
              Ver localização no Find My
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-3 py-2">
            <span className="text-3xl text-rosa">📡</span>
            <div>
              <p className="text-sm font-headline font-bold text-texto">Nenhum AirTag cadastrado</p>
              <p className="text-xs text-texto-soft font-body">
                Adicione o link do Find My para localizar {pet.nome} rapidamente
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Guarda */}
      <div className="pt-card space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-headline text-3xl font-extrabold text-coral">Guarda</p>
          <span className="bg-coral-light text-coral rounded-full px-4 py-1.5 text-sm font-headline font-bold">
            Conjunta
          </span>
        </div>

        {/* Guarda atual */}
        <div className="bg-white rounded-xl p-6">
          <p className="text-xs text-texto-soft mb-1 font-headline font-bold uppercase tracking-widest">Atualmente com</p>
          <p className="text-sm font-headline font-bold text-texto">
            {tutores.find(t => t.role === 'TUTOR_PRINCIPAL')?.usuario?.nome || 'Tutor principal'}
          </p>
        </div>

        {/* Guardas temporarias agendadas */}
        {guardas.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-azul font-headline font-bold uppercase tracking-widest">
              Proximas guardas
            </p>
            {guardas.map((g: any, i: number) => (
              <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-3">
                <span className="text-xl text-azul">📅</span>
                <div>
                  <p className="text-sm font-headline font-bold text-texto">{g.responsavel || 'Responsavel'}</p>
                  <p className="text-xs text-rosa font-body">
                    {g.dataInicio ? formatDate(g.dataInicio) : ''} — {g.dataFim ? formatDate(g.dataFim) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Solicitacoes pendentes */}
        {solicitacoes.filter((s: any) => s.status === 'PENDENTE').length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-azul font-headline font-bold uppercase tracking-widest">
              Solicitacoes pendentes
            </p>
            {solicitacoes.filter((s: any) => s.status === 'PENDENTE').map((s: any) => (
              <div key={s.id} className="bg-rosa-light text-rosa rounded-xl px-4 py-3 flex items-center gap-3 font-body">
                <span>⏳</span>
                <span>{s.descricao || 'Solicitacao de alteracao de guarda'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Solicitar alteracao button */}
        <button
          onClick={() => setShowGuardaForm(true)}
          className="pt-btn-secondary w-full text-sm"
        >
          Solicitar alteracao
        </button>
      </div>

      {/* Tutores */}
      <div className="pt-card space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-headline text-3xl font-extrabold text-coral">
            Pessoas vinculadas ({tutores.length})
          </p>
          <button
            onClick={() => setShowAddTutor(!showAddTutor)}
            className="pt-btn-ghost text-sm"
          >
            <span className="text-lg">👤</span>
            Convidar
          </button>
        </div>

        {showAddTutor && (
          <form
            onSubmit={handleAddTutor}
            className="space-y-3 bg-white rounded-xl p-6"
          >
            <h4 className="font-headline font-bold text-texto">
              Convidar pessoa
            </h4>
            <p className="text-xs text-texto-soft font-body">
              A pessoa receberá acesso ao perfil do pet com as permissões do papel selecionado.
            </p>
            <div>
              <label className="pt-label">E-mail *</label>
              <input
                type="email"
                className="pt-input"
                placeholder="veterinario@email.com"
                value={tutorForm.email}
                onChange={(e) =>
                  setTutorForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="pt-label">Papel</label>
              <select
                className="pt-input"
                value={tutorForm.role}
                onChange={(e) =>
                  setTutorForm((f) => ({ ...f, role: e.target.value }))
                }
              >
                <optgroup label="Tutores">
                  <option value="TUTOR_EMERGENCIA">Tutor de emergência — cuida em emergências</option>
                </optgroup>
                <optgroup label="Profissionais">
                  <option value="VETERINARIO">Veterinário — saúde e medicina</option>
                  <option value="ADESTRADOR">Adestrador — treinamento</option>
                  <option value="PASSEADOR">Passeador — passeios regulares</option>
                </optgroup>
                <optgroup label="Pessoal">
                  <option value="FAMILIAR">Familiar — membro da família</option>
                  <option value="AMIGO">Amigo — contato de confiança</option>
                  <option value="OUTRO">Outro vínculo</option>
                </optgroup>
              </select>
            </div>
            {tutorError && (
              <p className="text-xs text-erro font-body">{tutorError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={tutorSaving}
                className="pt-btn flex-1 text-sm"
              >
                {tutorSaving ? 'Adicionando...' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddTutor(false)}
                className="pt-btn-secondary text-sm px-4"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {tutores.map((pu) => (
            <TutorRow key={pu.id} pu={pu} isMe={pu.usuarioId === user?.id} />
          ))}
        </div>
      </div>

      {/* Plano de saúde resumo */}
      {plano && (
        <div className="pt-card">
          <p className="font-headline text-3xl font-extrabold text-rosa mb-4">Plano de saúde</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rosa-light flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <p className="font-headline font-bold text-texto">{plano.operadora}</p>
              <p className="text-xs text-texto-soft font-body">{plano.plano || 'Plano'}{plano.dataExpiracao ? ` · Expira ${formatDate(plano.dataExpiracao)}` : ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── REDE DE CUIDADO ─── */}
      <div className="pt-card space-y-6">
        <p className="font-headline text-3xl font-extrabold text-azul">Rede de Cuidado</p>

        {/* === Tutores === */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-headline text-lg font-bold text-texto">
              Tutores ({tutoresList.length})
            </p>
            <button
              onClick={() => { setShowAddTutor(!showAddTutor); setShowAddPrestador(false); setShowAddVisitante(false); }}
              className="pt-btn-ghost text-sm"
            >
              + Convidar tutor
            </button>
          </div>

          {showAddTutor && (
            <form onSubmit={handleAddTutor} className="space-y-3 bg-azul-light/30 rounded-xl p-5">
              <h4 className="font-headline font-bold text-texto text-sm">Convidar tutor</h4>
              <div>
                <label className="pt-label">E-mail *</label>
                <input
                  type="email"
                  className="pt-input"
                  placeholder="email@exemplo.com"
                  value={tutorForm.email}
                  onChange={(e) => setTutorForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="pt-label">Papel</label>
                <select
                  className="pt-input"
                  value={tutorForm.role}
                  onChange={(e) => setTutorForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <option value="TUTOR_EMERGENCIA">Tutor de emergencia</option>
                </select>
              </div>
              {tutorError && <p className="text-xs text-erro font-body">{tutorError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={tutorSaving} className="pt-btn flex-1 text-sm">
                  {tutorSaving ? 'Adicionando...' : 'Enviar convite'}
                </button>
                <button type="button" onClick={() => setShowAddTutor(false)} className="pt-btn-secondary text-sm px-4">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {tutoresList.length === 0 ? (
            <div className="text-center py-6">
              <span className="text-3xl">👥</span>
              <p className="text-sm text-texto-soft font-body mt-2">Nenhum tutor vinculado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tutoresList.map((pu) => (
                <TutorRow key={pu.id} pu={pu} isMe={pu.usuarioId === user?.id} />
              ))}
            </div>
          )}
        </div>

        <hr className="border-creme-dark" />

        {/* === Prestadores === */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-headline text-lg font-bold text-texto">
              Prestadores ({prestadoresList.length})
            </p>
            <button
              onClick={() => { setShowAddPrestador(!showAddPrestador); setShowAddTutor(false); setShowAddVisitante(false); }}
              className="pt-btn-ghost text-sm"
            >
              + Convidar prestador
            </button>
          </div>

          {showAddPrestador && (
            <form onSubmit={handleAddPrestador} className="space-y-3 bg-rosa-light/30 rounded-xl p-5">
              <h4 className="font-headline font-bold text-texto text-sm">Convidar prestador</h4>
              <div>
                <label className="pt-label">E-mail *</label>
                <input
                  type="email"
                  className="pt-input"
                  placeholder="veterinario@email.com"
                  value={prestadorForm.email}
                  onChange={(e) => setPrestadorForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              {prestadorError && <p className="text-xs text-erro font-body">{prestadorError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={prestadorSaving} className="pt-btn flex-1 text-sm">
                  {prestadorSaving ? 'Convidando...' : 'Enviar convite'}
                </button>
                <button type="button" onClick={() => setShowAddPrestador(false)} className="pt-btn-secondary text-sm px-4">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {prestadoresList.length === 0 ? (
            <div className="text-center py-6">
              <span className="text-3xl">🩺</span>
              <p className="text-sm text-texto-soft font-body mt-2">Nenhum prestador vinculado</p>
              <p className="text-xs text-texto-soft font-body">Veterinarios, adestradores e passeadores aparecerao aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {prestadoresList.map((pu) => (
                <TutorRow key={pu.id} pu={pu} isMe={pu.usuarioId === user?.id} />
              ))}
            </div>
          )}
        </div>

        <hr className="border-creme-dark" />

        {/* === Visitantes === */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-headline text-lg font-bold text-texto">
              Visitantes ({visitantes.length})
            </p>
            <button
              onClick={() => { setShowAddVisitante(!showAddVisitante); setShowAddTutor(false); setShowAddPrestador(false); }}
              className="pt-btn-ghost text-sm"
            >
              + Convidar visitante
            </button>
          </div>

          {showAddVisitante && (
            <form onSubmit={handleAddVisitante} className="space-y-3 bg-coral-light/30 rounded-xl p-5">
              <h4 className="font-headline font-bold text-texto text-sm">Convidar visitante</h4>
              <p className="text-xs text-texto-soft font-body">
                Visitantes tem acesso somente-leitura com permissoes configuraveis.
              </p>
              <div>
                <label className="pt-label">E-mail *</label>
                <input
                  type="email"
                  className="pt-input"
                  placeholder="visitante@email.com"
                  value={visitanteForm.email}
                  onChange={(e) => setVisitanteForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="pt-label">Relacao</label>
                <input
                  type="text"
                  className="pt-input"
                  placeholder="Ex: Avo, Vizinho, Dogsitter..."
                  value={visitanteForm.relacao}
                  onChange={(e) => setVisitanteForm((f) => ({ ...f, relacao: e.target.value }))}
                />
              </div>
              <div>
                <label className="pt-label">Permissoes</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {PERMISSAO_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => toggleVisitantePermissao(p.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-headline font-bold transition-all',
                        visitanteForm.permissoes.includes(p.value)
                          ? 'bg-coral text-white'
                          : 'bg-creme-dark text-texto-soft',
                        p.value === 'STATUS_SAUDE' && 'opacity-60 cursor-not-allowed',
                      )}
                      disabled={p.value === 'STATUS_SAUDE'}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-texto-soft font-body mt-1">Saude e sempre incluida.</p>
              </div>
              {visitanteError && <p className="text-xs text-erro font-body">{visitanteError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={visitanteSaving} className="pt-btn flex-1 text-sm">
                  {visitanteSaving ? 'Convidando...' : 'Enviar convite'}
                </button>
                <button type="button" onClick={() => setShowAddVisitante(false)} className="pt-btn-secondary text-sm px-4">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {visitantesLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-creme-dark/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : visitantes.length === 0 ? (
            <div className="text-center py-6">
              <span className="text-3xl">👁️</span>
              <p className="text-sm text-texto-soft font-body mt-2">Nenhum visitante vinculado</p>
              <p className="text-xs text-texto-soft font-body">Visitantes podem visualizar informacoes com permissoes limitadas.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visitantes.map((v) => (
                <VisitanteRow key={v.id} visitante={v} onRemove={() => handleRemoveVisitante(v.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="pt-card space-y-3">
        <p className="font-headline text-3xl font-extrabold text-coral mb-2">Ações</p>
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white active:scale-[0.97] transition-all duration-200 text-left"
        >
          <span className="text-2xl text-azul">💬</span>
          <div>
            <p className="text-sm font-headline font-bold text-texto">
              Enviar feedback
            </p>
            <p className="text-xs text-texto-soft font-body">
              Compartilhe sua experiência
            </p>
          </div>
          <span className="ml-auto text-texto-soft"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>
        </button>

        {showFeedback && (
          <form
            onSubmit={handleFeedback}
            className="space-y-3 bg-white rounded-xl p-6"
          >
            <div>
              <label className="pt-label">Tipo</label>
              <select
                className="pt-input"
                value={feedbackForm.tipo}
                onChange={(e) =>
                  setFeedbackForm((f) => ({ ...f, tipo: e.target.value }))
                }
              >
                <option value="SUGESTAO">Sugestão</option>
                <option value="BUG">Bug</option>
                <option value="ELOGIO">Elogio</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div>
              <label className="pt-label">Mensagem *</label>
              <textarea
                className="pt-input resize-none"
                rows={3}
                value={feedbackForm.mensagem}
                onChange={(e) =>
                  setFeedbackForm((f) => ({ ...f, mensagem: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={feedbackSaving}
                className="pt-btn flex-1 text-sm"
              >
                {feedbackSaving ? 'Enviando...' : 'Enviar'}
              </button>
              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                className="pt-btn-secondary text-sm px-4"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-coral-light text-coral text-xs px-3 py-1 rounded-full font-headline font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
              Beta
            </span>
            <p className="text-xs text-texto-soft font-body">
              Você está no acesso antecipado do MITRA
            </p>
          </div>
        </div>
      </div>

      {/* Editar Perfil — big CTA */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => router.push(`/pets/${petId}/editar`)}
          className="group bg-coral-light text-coral font-headline font-black text-2xl px-16 py-6 rounded-full shadow-xl hover:scale-105 active:scale-90 transition-all duration-300 flex items-center gap-4"
        >
          <span className="text-3xl group-hover:rotate-45 transition-transform">✏️</span>
          Editar Perfil
        </button>
      </div>

      {/* Guarda BottomSheet */}
      <BottomSheet open={showGuardaForm} onClose={() => setShowGuardaForm(false)} title="Solicitar alteracao de guarda">
        <form onSubmit={handleGuardaSubmit} className="space-y-4">
          <div>
            <label className="pt-label">Tipo</label>
            <select className="pt-input" value={guardaForm.tipo} onChange={e => setGuardaForm(f => ({...f, tipo: e.target.value}))}>
              <option value="TEMPORARIA">Guarda temporaria</option>
              <option value="DEFINITIVA">Alteracao definitiva</option>
            </select>
          </div>
          <div>
            <label className="pt-label">Motivo</label>
            <textarea className="pt-input resize-none" rows={3} value={guardaForm.motivo} onChange={e => setGuardaForm(f => ({...f, motivo: e.target.value}))} placeholder="Descreva o motivo..." required />
          </div>
          {guardaForm.tipo === 'TEMPORARIA' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="pt-label">Data inicio</label>
                <input type="date" className="pt-input" value={guardaForm.dataInicio} onChange={e => setGuardaForm(f => ({...f, dataInicio: e.target.value}))} required />
              </div>
              <div>
                <label className="pt-label">Data fim</label>
                <input type="date" className="pt-input" value={guardaForm.dataFim} onChange={e => setGuardaForm(f => ({...f, dataFim: e.target.value}))} required />
              </div>
            </div>
          )}
          <button type="submit" disabled={guardaSaving} className="pt-btn w-full">
            {guardaSaving ? 'Enviando...' : 'Enviar solicitacao'}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl px-4 py-3">
      <p className="text-xs text-texto-soft mb-0.5 font-headline font-bold uppercase tracking-widest">{label}</p>
      <p className="text-sm font-headline font-bold text-texto">{value}</p>
    </div>
  );
}

const PERMISSAO_OPTIONS: { value: string; label: string }[] = [
  { value: 'DADOS_BASICOS', label: 'Dados basicos' },
  { value: 'STATUS_SAUDE', label: 'Saude' },
  { value: 'HISTORICO_VACINACAO', label: 'Vacinas' },
  { value: 'MEDICAMENTOS', label: 'Medicamentos' },
  { value: 'AGENDA_CONSULTAS', label: 'Consultas' },
  { value: 'PRESTADORES_PET', label: 'Prestadores' },
  { value: 'TIMELINE_ATUALIZACOES', label: 'Timeline' },
];

const PERMISSAO_LABELS: Record<string, string> = Object.fromEntries(
  PERMISSAO_OPTIONS.map((p) => [p.value, p.label]),
);

const ROLE_BADGE: Record<string, { bg: string; text: string }> = {
  TUTOR_PRINCIPAL:  { bg: 'bg-coral-light',    text: 'text-coral'    },
  TUTOR_EMERGENCIA: { bg: 'bg-rosa-light',   text: 'text-rosa'   },
  VETERINARIO:      { bg: 'bg-azul-light',  text: 'text-azul'  },
  ADESTRADOR:       { bg: 'bg-rosa-light',   text: 'text-rosa'   },
  PASSEADOR:        { bg: 'bg-coral-light',    text: 'text-coral'    },
  FAMILIAR:         { bg: 'bg-creme-dark', text: 'text-texto-soft'    },
  AMIGO:            { bg: 'bg-creme-dark', text: 'text-texto-soft'    },
  OUTRO:            { bg: 'bg-creme-dark', text: 'text-texto-soft'    },
};

function TutorRow({
  pu,
  isMe,
}: {
  pu: PetUsuario;
  isMe: boolean;
}) {
  const badge = ROLE_BADGE[pu.role] ?? { bg: 'bg-creme-dark', text: 'text-texto-soft' };
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-coral-light flex items-center justify-center flex-shrink-0">
        <span className="text-coral text-sm font-headline font-bold">
          {getInitials(pu.usuario.nome)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-headline font-bold text-texto truncate">
          {pu.usuario.nome}
          {isMe && (
            <span className="text-texto-soft font-normal text-xs ml-1 font-body">
              (você)
            </span>
          )}
        </p>
        <p className="text-xs text-texto-soft font-body">{pu.usuario.email}</p>
      </div>
      <span className={cn('px-4 py-1.5 rounded-full text-xs font-headline font-bold flex-shrink-0', badge.bg, badge.text)}>
        {roleLabel(pu.role)}
      </span>
    </div>
  );
}

function VisitanteRow({ visitante, onRemove }: { visitante: PetVisitante; onRemove: () => void }) {
  const nome = visitante.visitante?.nome || 'Visitante';
  const permissoes = visitante.permissoesVisualizacao || [];

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-rosa-light flex items-center justify-center flex-shrink-0">
          <span className="text-rosa text-sm font-headline font-bold">
            {getInitials(nome)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-headline font-bold text-texto truncate">{nome}</p>
          {visitante.relacao && (
            <p className="text-xs text-texto-soft font-body">{visitante.relacao}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="text-xs text-erro hover:text-erro/80 font-headline font-bold px-3 py-1.5 rounded-full bg-erro/10 flex-shrink-0 transition-colors"
          title="Remover acesso"
        >
          Remover
        </button>
      </div>
      {permissoes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 ml-13">
          {permissoes.map((p) => (
            <span
              key={p}
              className="px-3 py-1 rounded-full text-xs font-headline font-bold bg-coral-light text-coral"
            >
              {PERMISSAO_LABELS[p] || p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CodigoPetDisplay({ codigo, nome }: { codigo: string; nome: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-texto-soft mb-1 font-headline font-bold uppercase tracking-widest">Código do pet</p>
          <p className="text-lg font-mono font-bold text-texto tracking-wider">
            {codigo}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="pt-btn-ghost text-sm flex items-center gap-1.5"
          title="Copiar código"
        >
          <span className="text-lg">
            {copied ? '✅' : '📋'}
          </span>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <p className="text-xs text-texto-soft mt-2 font-body">
        Compartilhe para outros se vincularem a {nome}
      </p>
    </div>
  );
}
