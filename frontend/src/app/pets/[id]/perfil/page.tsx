'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { petsApi, governanceApi, usersApi, custodyApi, accessLogsApi } from '@/lib/api';
import { DEFAULT_PRESTADOR_SAUDE_PERMISSIONS } from '@/lib/mock-data';
import { BottomSheet } from '@/components/BottomSheet';
import { CareCircle } from '@/components/pet/CareCircle';
import { QRCodeSVG } from 'qrcode.react';
import { Pet, PetUsuario, PetVisitante, AccessLog } from '@/types';
import {
  especieLabel,
  generoLabel,
  petAge,
  formatDate,
  formatRelative,
  roleLabel,
  getInitials,
  cn,
} from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { PetImage } from '@/components/PetImage';
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
  Camera,
  Edit,
  Trash2,
  Heart,
  User,
  MapPin,
  Weight,
  Ruler,
  Tag,
  Settings,
  Save,
  Eye,
} from 'lucide-react';

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
  const [editingPrestadorPerms, setEditingPrestadorPerms] = useState<string | null>(null);
  const [prestadorPerms, setPrestadorPerms] = useState<Record<string, string[]>>({});
  const [permsSaving, setPermsSaving] = useState(false);

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

  // F10: Access logs
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);

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

    // F10: Load access logs
    accessLogsApi.list(petId)
      .then((data: any) => setAccessLogs(Array.isArray(data) ? data : []))
      .catch(() => setAccessLogs([]));
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
      setConfirmation('Solicitação enviada com sucesso!');
      setShowGuardaForm(false);
      setGuardaForm({ tipo: 'TEMPORARIA', motivo: '', dataInicio: '', dataFim: '' });
      // Refresh solicitacoes
      const { data } = await custodyApi.solicitacoes(petId);
      setSolicitacoes((data as any[]) || []);
      setTimeout(() => setConfirmation(''), 5000);
    } catch (err: any) {
      setConfirmation(err?.response?.data?.message || 'Erro ao enviar solicitação.');
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

  const handleRemoveTutor = async (tutorId: string, isSelf: boolean) => {
    const msg = isSelf
      ? 'Tem certeza que deseja se desvincular deste pet?'
      : 'Tem certeza que deseja remover este tutor?';
    if (!confirm(msg)) return;
    try {
      await governanceApi.removerTutor(petId, tutorId);
      setConfirmation(isSelf ? 'Você foi desvinculado do pet.' : 'Tutor removido com sucesso.');
      if (isSelf) {
        router.push('/home');
        return;
      }
      // Reload pet data to refresh tutor list
      const { data: petData } = await petsApi.get(petId);
      setPet(petData as Pet);
      setTimeout(() => setConfirmation(''), 5000);
    } catch (err: any) {
      setConfirmation(err?.response?.data?.message || 'Erro ao remover tutor.');
      setTimeout(() => setConfirmation(''), 5000);
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
      <div className="space-y-4">
        <div className="h-6 w-48 mg-skeleton rounded-lg" />
        <div className="h-4 w-32 mg-skeleton rounded-lg" />
        <div className="mg-card space-y-4">
          <div className="h-20 mg-skeleton rounded-xl" />
          <div className="h-20 mg-skeleton rounded-xl" />
        </div>
        <div className="mg-card space-y-3">
          <div className="h-14 mg-skeleton rounded-xl" />
          <div className="h-14 mg-skeleton rounded-xl" />
          <div className="h-14 mg-skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  const tutores = pet.petUsuarios || [];
  const plano = (pet as any).planoSaude;

  // Rede de Cuidado derived lists
  const PRESTADOR_ROLES_LIST = ['VETERINARIO', 'ADESTRADOR', 'PASSEADOR', 'PET_SITTER', 'DAY_CARE', 'HOTEL', 'CRECHE', 'CUIDADOR', 'OUTRO'];
  const tutoresList = tutores.filter((t) => ['TUTOR_PRINCIPAL', 'TUTOR_EMERGENCIA'].includes(t.role));
  const prestadoresList = tutores.filter((t) => PRESTADOR_ROLES_LIST.includes(t.role));

  // Compute pet age
  const ageText = pet.dataNascimento ? petAge(pet.dataNascimento) : null;
  const ageMatch = ageText?.match(/(\d+)/);
  const ageYears = ageMatch ? parseInt(ageMatch[1]) : null;
  const humanYears = ageYears != null ? ageYears * 7 : null;

  const pesoNum = pet.peso ? parseFloat(String(pet.peso)) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Confirmation banner */}
      {confirmation && (
        <div className="mg-card-solid rounded-xl px-4 py-3 flex items-center gap-2 animate-fade-in border-l-4 border-teal">
          <Check className="w-4 h-4 text-teal flex-shrink-0" />
          <span className="text-sm text-texto font-medium font-body">{confirmation}</span>
        </div>
      )}

      {/* Section header */}
      <div>
        <h2 className="font-headline font-bold text-xl text-texto">Perfil do Pet</h2>
        <p className="text-sm text-texto-soft font-body">Dados cadastrais, rede de cuidado e configurações</p>
      </div>

      {/* Section 1: Pet Info Card */}
      <div className="mg-card">
        <div className="flex items-center gap-4">
          <PetImage
            fotoUrl={pet.fotoUrl}
            nome={pet.nome}
            especie={pet.especie}
            className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
            fallbackClassName="bg-gradient-to-br from-primary/20 to-teal/20"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-headline text-lg font-bold text-texto truncate">{pet.nome}</h3>
            <span className="mg-badge mg-badge-info mt-1">
              {especieLabel(pet.especie)}{pet.raca ? ` · ${pet.raca}` : ''}
            </span>
          </div>
          <button
            onClick={() => router.push(`/pets/${petId}/editar`)}
            className="mg-btn-ghost text-sm flex-shrink-0"
          >
            <Edit className="w-3.5 h-3.5" />
            Editar
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="mg-card-solid rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-headline text-texto">{ageYears ?? '--'}</p>
            <p className="text-xs text-texto-soft font-body mt-0.5">anos pet</p>
          </div>
          <div className="mg-card-solid rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-rose/10 flex items-center justify-center mx-auto mb-2">
              <Heart className="w-4 h-4 text-rose" />
            </div>
            <p className="text-2xl font-bold font-headline text-rose">{humanYears ?? '--'}</p>
            <p className="text-xs text-texto-soft font-body mt-0.5">anos humanos</p>
          </div>
          <div className="mg-card-solid rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center mx-auto mb-2">
              <Weight className="w-4 h-4 text-teal" />
            </div>
            <p className="text-2xl font-bold font-headline text-teal">{pesoNum ?? '--'}</p>
            <p className="text-xs text-texto-soft font-body mt-0.5">kg</p>
          </div>
        </div>

        {pet.dataNascimento && (
          <p className="text-xs text-texto-soft font-body mt-3">
            Nascido em {formatDate(pet.dataNascimento)}
          </p>
        )}

        {pet.status === 'ARQUIVADO' && (
          <div className="mg-card-solid rounded-xl px-4 py-3 mt-3 border-l-4 border-primary">
            <p className="text-sm text-primary font-headline font-bold">Pet arquivado</p>
            <p className="text-xs text-primary/70 mt-0.5 font-body">
              Para reativar, todos os tutores precisam confirmar.
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Dados do Pet */}
      <div className="mg-card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-teal" />
          </div>
          <h3 className="font-headline text-lg font-bold text-texto">Dados do Pet</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {pet.genero && <Field label="Gênero" value={generoLabel(pet.genero)} />}
          {pet.cor && <Field label="Cor" value={pet.cor} />}
          {pet.peso && <Field label="Peso" value={`${pet.peso} kg`} />}
          {pet.microchip && <Field label="Microchip" value={pet.microchip} />}
        </div>

        {pet.observacoes && (
          <div className="mg-card-solid rounded-xl px-4 py-3">
            <p className="mg-label mb-1">Observações</p>
            <p className="text-sm text-texto font-body">{pet.observacoes}</p>
          </div>
        )}

        {pet.codigoPet && (
          <CodigoPetDisplay codigo={pet.codigoPet} nome={pet.nome} />
        )}

        {/* AirTag */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <p className="mg-label">Localização (AirTag)</p>
            </div>
            {!editingAirTag && (
              <button
                onClick={() => { setAirTagInput(pet.airTagUrl ?? ''); setEditingAirTag(true); }}
                className="mg-btn-ghost text-sm"
              >
                {pet.airTagUrl ? 'Alterar' : 'Cadastrar'}
              </button>
            )}
          </div>

          {editingAirTag ? (
            <div className="space-y-3 mg-card-solid rounded-xl p-4">
              <p className="text-xs text-texto-soft font-body">
                Cole o link de compartilhamento do Apple Find My (gerado pelo app no iPhone).
              </p>
              <input
                type="url"
                className="mg-input"
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
                  className="mg-btn flex-1 text-sm"
                >
                  {airTagSaving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => { setEditingAirTag(false); setAirTagError(''); }}
                  className="mg-btn-secondary text-sm px-4"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : pet.airTagUrl ? (
            <div className="space-y-2">
              <p className="text-xs text-texto-soft truncate font-body">{pet.airTagUrl}</p>
              <a
                href={pet.airTagUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mg-btn-secondary flex items-center justify-center gap-2 w-full text-sm"
              >
                <MapPin className="w-3.5 h-3.5" />
                Ver localização no Find My
              </a>
            </div>
          ) : (
            <p className="text-xs text-texto-soft font-body">
              Nenhum AirTag cadastrado. Adicione o link do Find My para localizar {pet.nome} rapidamente.
            </p>
          )}
        </div>

        {/* Plano de saude resumo */}
        {plano && (
          <div className="mg-card-solid rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-rose" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-headline font-bold text-texto truncate">{plano.operadora}</p>
              <p className="text-xs text-texto-soft font-body">
                {plano.plano || 'Plano'}{plano.dataExpiracao ? ` · Expira ${formatDate(plano.dataExpiracao)}` : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Rede de Cuidado */}
      <div className="mg-card space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-headline text-lg font-bold text-texto">Rede de Cuidado</h3>
          </div>
          <p className="text-sm text-texto-soft font-body mt-1">Pessoas com acesso ao perfil de {pet.nome}</p>
        </div>

        {/* Care Circle Visual (F6) */}
        {tutores.length > 0 && (
          <CareCircle
            petNome={pet.nome}
            petEmoji={({'CACHORRO':'🐶','GATO':'🐱','CAVALO':'🐴','PEIXE':'🐟','PASSARO':'🐦','ROEDOR':'���','COELHO':'🐰','REPTIL':'🦎','FURAO':'🦦'} as Record<string, string>)[pet.especie] || '🐾'}
            tutores={tutores}
            className="py-2"
          />
        )}

        {/* === Tutores === */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-headline text-sm font-bold text-texto">
              Tutores ({tutoresList.length})
            </p>
            <button
              onClick={() => { setShowAddTutor(!showAddTutor); setShowAddPrestador(false); setShowAddVisitante(false); }}
              className="mg-btn-ghost text-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Convidar
            </button>
          </div>

          {showAddTutor && (
            <form onSubmit={handleAddTutor} className="space-y-3 mg-card-solid rounded-xl p-5">
              <h4 className="font-headline font-bold text-texto text-sm">Convidar tutor</h4>
              <div>
                <label className="mg-label">E-mail *</label>
                <input
                  type="email"
                  className="mg-input"
                  placeholder="email@exemplo.com"
                  value={tutorForm.email}
                  onChange={(e) => setTutorForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="mg-label">Papel</label>
                <select
                  className="mg-select"
                  value={tutorForm.role}
                  onChange={(e) => setTutorForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <option value="TUTOR_EMERGENCIA">Tutor de emergência</option>
                </select>
              </div>
              {tutorError && <p className="text-xs text-erro font-body">{tutorError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={tutorSaving} className="mg-btn flex-1 text-sm">
                  {tutorSaving ? 'Adicionando...' : 'Enviar convite'}
                </button>
                <button type="button" onClick={() => setShowAddTutor(false)} className="mg-btn-secondary text-sm px-4">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {tutoresList.length === 0 ? (
            <div className="mg-card-solid rounded-xl py-6 flex flex-col items-center gap-2">
              <User className="w-6 h-6 text-texto-soft/40" />
              <p className="text-sm text-texto-soft font-body text-center">Nenhum tutor vinculado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tutoresList.map((pu) => (
                <TutorRow key={pu.id} pu={pu} isMe={pu.usuarioId === user?.id} onRemove={() => handleRemoveTutor(pu.usuarioId, pu.usuarioId === user?.id)} canRemove={tutoresList.length > 1} />
              ))}
            </div>
          )}
        </div>

        <hr className="border-surface-muted" />

        {/* === Prestadores === */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-headline text-sm font-bold text-texto">
              Prestadores ({prestadoresList.length})
            </p>
            <button
              onClick={() => { setShowAddPrestador(!showAddPrestador); setShowAddTutor(false); setShowAddVisitante(false); }}
              className="mg-btn-ghost text-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Convidar
            </button>
          </div>

          {showAddPrestador && (
            <form onSubmit={handleAddPrestador} className="space-y-3 mg-card-solid rounded-xl p-5">
              <h4 className="font-headline font-bold text-texto text-sm">Convidar prestador</h4>
              <div>
                <label className="mg-label">E-mail *</label>
                <input
                  type="email"
                  className="mg-input"
                  placeholder="veterinario@email.com"
                  value={prestadorForm.email}
                  onChange={(e) => setPrestadorForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              {prestadorError && <p className="text-xs text-erro font-body">{prestadorError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={prestadorSaving} className="mg-btn flex-1 text-sm">
                  {prestadorSaving ? 'Convidando...' : 'Enviar convite'}
                </button>
                <button type="button" onClick={() => setShowAddPrestador(false)} className="mg-btn-secondary text-sm px-4">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {prestadoresList.length === 0 ? (
            <div className="mg-card-solid rounded-xl py-6 flex flex-col items-center gap-2">
              <Users className="w-6 h-6 text-texto-soft/40" />
              <p className="text-sm text-texto-soft font-body text-center">Nenhum prestador vinculado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {prestadoresList.map((pu) => {
                const isEditing = editingPrestadorPerms === pu.usuarioId;
                const currentPerms = prestadorPerms[pu.usuarioId] || pu.permissoesSaude || DEFAULT_PRESTADOR_SAUDE_PERMISSIONS[pu.role] || ['mural'];
                const isTutor = pet.meuRole === 'TUTOR_PRINCIPAL' || pet.meuRole === 'TUTOR_EMERGENCIA';

                const togglePerm = (perm: string) => {
                  setPrestadorPerms(prev => {
                    const curr = prev[pu.usuarioId] || [...currentPerms];
                    return {
                      ...prev,
                      [pu.usuarioId]: curr.includes(perm) ? curr.filter(p => p !== perm) : [...curr, perm],
                    };
                  });
                };

                const handleSavePerms = async () => {
                  setPermsSaving(true);
                  try {
                    const permsToSave = prestadorPerms[pu.usuarioId] || currentPerms;
                    await petsApi.updatePrestadorPermissoes(petId, pu.usuarioId, permsToSave);
                    setEditingPrestadorPerms(null);
                  } catch {
                    // silent
                  } finally {
                    setPermsSaving(false);
                  }
                };

                const PERM_OPTIONS = [
                  { value: 'carteira', label: 'Carteira de vacinação' },
                  { value: 'vacinas', label: 'Vacinas' },
                  { value: 'medicamentos', label: 'Medicamentos' },
                  { value: 'sintomas', label: 'Sintomas' },
                  { value: 'mural', label: 'Mural' },
                  { value: 'plano', label: 'Plano de saúde' },
                  { value: 'consultas', label: 'Consultas' },
                ];

                const activePerms = prestadorPerms[pu.usuarioId] || currentPerms;

                return (
                  <div key={pu.id} className="space-y-0">
                    <div className="flex items-center justify-between">
                      <TutorRow pu={pu} isMe={pu.usuarioId === user?.id} />
                      {isTutor && (
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingPrestadorPerms(null);
                            } else {
                              setPrestadorPerms(prev => ({ ...prev, [pu.usuarioId]: [...currentPerms] }));
                              setEditingPrestadorPerms(pu.usuarioId);
                            }
                          }}
                          className="mg-btn-ghost text-xs gap-1 px-2 py-1 flex-shrink-0"
                          title="Configurar acesso"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {isEditing && (
                      <div className="mg-card-solid rounded-xl p-4 mt-2 space-y-3 animate-fade-in">
                        <p className="text-xs font-headline font-bold text-texto">Acesso à Saúde</p>
                        <p className="text-[11px] text-texto-soft font-body">Selecione as informações que {pu.usuario.nome.split(' ')[0]} pode ver</p>
                        <div className="flex flex-wrap gap-2">
                          {PERM_OPTIONS.map(opt => {
                            const active = activePerms.includes(opt.value);
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => togglePerm(opt.value)}
                                className={cn(
                                  'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                                  active
                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                    : 'bg-surface-muted border-surface-muted text-texto-soft hover:border-primary/20'
                                )}
                              >
                                {active && <Check className="w-3 h-3 inline mr-1" />}
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleSavePerms}
                            disabled={permsSaving}
                            className="mg-btn text-xs px-4 py-1.5 flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            {permsSaving ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            onClick={() => setEditingPrestadorPerms(null)}
                            className="mg-btn-ghost text-xs px-3 py-1.5"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <hr className="border-surface-muted" />

        {/* === Visitantes === */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-headline text-sm font-bold text-texto">
              Visitantes ({visitantes.length})
            </p>
            <button
              onClick={() => { setShowAddVisitante(!showAddVisitante); setShowAddTutor(false); setShowAddPrestador(false); }}
              className="mg-btn-ghost text-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Convidar
            </button>
          </div>

          {showAddVisitante && (
            <form onSubmit={handleAddVisitante} className="space-y-3 mg-card-solid rounded-xl p-5">
              <h4 className="font-headline font-bold text-texto text-sm">Convidar visitante</h4>
              <p className="text-xs text-texto-soft font-body">
                Visitantes têm acesso somente-leitura com permissões configuráveis.
              </p>
              <div>
                <label className="mg-label">E-mail *</label>
                <input
                  type="email"
                  className="mg-input"
                  placeholder="visitante@email.com"
                  value={visitanteForm.email}
                  onChange={(e) => setVisitanteForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="mg-label">Relação</label>
                <input
                  type="text"
                  className="mg-input"
                  placeholder="Ex: Avó, Vizinho, Dogsitter..."
                  value={visitanteForm.relacao}
                  onChange={(e) => setVisitanteForm((f) => ({ ...f, relacao: e.target.value }))}
                />
              </div>
              <div>
                <label className="mg-label">Permissões</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {PERMISSAO_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => toggleVisitantePermissao(p.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-headline font-bold transition-all',
                        visitanteForm.permissoes.includes(p.value)
                          ? 'bg-primary text-white'
                          : 'bg-surface-muted text-texto-soft',
                        p.value === 'STATUS_SAUDE' && 'opacity-60 cursor-not-allowed',
                      )}
                      disabled={p.value === 'STATUS_SAUDE'}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-texto-soft font-body mt-1">Saúde é sempre incluída.</p>
              </div>
              {visitanteError && <p className="text-xs text-erro font-body">{visitanteError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={visitanteSaving} className="mg-btn flex-1 text-sm">
                  {visitanteSaving ? 'Convidando...' : 'Enviar convite'}
                </button>
                <button type="button" onClick={() => setShowAddVisitante(false)} className="mg-btn-secondary text-sm px-4">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {visitantesLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 mg-skeleton rounded-xl" />
              ))}
            </div>
          ) : visitantes.length === 0 ? (
            <div className="mg-card-solid rounded-xl py-6 flex flex-col items-center gap-2">
              <User className="w-6 h-6 text-texto-soft/40" />
              <p className="text-sm text-texto-soft font-body text-center">Nenhum visitante vinculado</p>
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

      {/* Section 3b: Access Log (F10) */}
      {accessLogs.length > 0 && (
        <div className="mg-card space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-info" />
            </div>
            <h3 className="font-headline text-lg font-bold text-texto">Atividade de acesso</h3>
          </div>
          <p className="text-sm text-texto-soft font-body">Últimas ações na ficha de {pet.nome}</p>
          <div className="space-y-2">
            {accessLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-surface-muted/50 flex items-center justify-center shrink-0">
                  <Eye className="w-3.5 h-3.5 text-texto-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-headline font-semibold text-texto truncate">
                    {log.usuarioNome}
                  </p>
                  <p className="text-[10px] text-texto-soft font-body">{log.acao}</p>
                </div>
                <span className="text-[10px] text-texto-muted font-body whitespace-nowrap">
                  {formatRelative(log.criadoEm)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Acoes */}
      <div className="mg-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-amber" />
          </div>
          <h3 className="font-headline text-lg font-bold text-texto">Ações</h3>
        </div>

        <button
          onClick={() => setShowFeedback(!showFeedback)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-muted/30 active:scale-[0.98] transition-all text-left"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-headline font-bold text-texto">Enviar feedback</p>
            <p className="text-xs text-texto-soft font-body">Compartilhe sua experiência</p>
          </div>
          <ChevronRight className="w-4 h-4 text-texto-soft flex-shrink-0" />
        </button>

        {showFeedback && (
          <form onSubmit={handleFeedback} className="space-y-3 mg-card-solid rounded-xl p-5">
            <div>
              <label className="mg-label">Tipo</label>
              <select
                className="mg-select"
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
              <label className="mg-label">Mensagem *</label>
              <textarea
                className="mg-input resize-none"
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
                className="mg-btn flex-1 text-sm"
              >
                {feedbackSaving ? 'Enviando...' : 'Enviar'}
              </button>
              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                className="mg-btn-secondary text-sm px-4"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center gap-2 px-4 py-2">
          <span className="mg-badge mg-badge-primary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Beta
          </span>
          <p className="text-xs text-texto-soft font-body">
            Você está no acesso antecipado do MITRA
          </p>
        </div>

        <button
          onClick={() => router.push(`/pets/${petId}/editar`)}
          className="mg-btn w-full text-sm"
        >
          <Edit className="w-3.5 h-3.5" />
          Editar Perfil
        </button>
      </div>

      {/* Guarda BottomSheet */}
      <BottomSheet open={showGuardaForm} onClose={() => setShowGuardaForm(false)} title="Solicitar alteração de guarda">
        <form onSubmit={handleGuardaSubmit} className="space-y-4">
          <div>
            <label className="mg-label">Tipo</label>
            <select className="mg-select" value={guardaForm.tipo} onChange={e => setGuardaForm(f => ({...f, tipo: e.target.value}))}>
              <option value="TEMPORARIA">Guarda temporária</option>
              <option value="DEFINITIVA">Alteração definitiva</option>
            </select>
          </div>
          <div>
            <label className="mg-label">Motivo</label>
            <textarea className="mg-input resize-none" rows={3} value={guardaForm.motivo} onChange={e => setGuardaForm(f => ({...f, motivo: e.target.value}))} placeholder="Descreva o motivo..." required />
          </div>
          {guardaForm.tipo === 'TEMPORARIA' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mg-label">Data início</label>
                <input type="date" className="mg-input" value={guardaForm.dataInicio} onChange={e => setGuardaForm(f => ({...f, dataInicio: e.target.value}))} required />
              </div>
              <div>
                <label className="mg-label">Data fim</label>
                <input type="date" className="mg-input" value={guardaForm.dataFim} onChange={e => setGuardaForm(f => ({...f, dataFim: e.target.value}))} required />
              </div>
            </div>
          )}
          <button type="submit" disabled={guardaSaving} className="mg-btn w-full">
            {guardaSaving ? 'Enviando...' : 'Enviar solicitação'}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mg-card-solid rounded-xl px-4 py-3">
      <p className="mg-label mb-0.5">{label}</p>
      <p className="text-sm font-headline font-bold text-texto">{value}</p>
    </div>
  );
}

const PERMISSAO_OPTIONS: { value: string; label: string }[] = [
  { value: 'DADOS_BASICOS', label: 'Dados básicos' },
  { value: 'STATUS_SAUDE', label: 'Saúde' },
  { value: 'HISTORICO_VACINACAO', label: 'Vacinas' },
  { value: 'MEDICAMENTOS', label: 'Medicamentos' },
  { value: 'AGENDA_CONSULTAS', label: 'Consultas' },
  { value: 'PRESTADORES_PET', label: 'Prestadores' },
  { value: 'TIMELINE_ATUALIZACOES', label: 'Timeline' },
];

const PERMISSAO_LABELS: Record<string, string> = Object.fromEntries(
  PERMISSAO_OPTIONS.map((p) => [p.value, p.label]),
);

const ROLE_BADGE: Record<string, string> = {
  TUTOR_PRINCIPAL:  'mg-badge-primary',
  TUTOR_EMERGENCIA: 'mg-badge-warning',
  VETERINARIO:      'mg-badge-info',
  ADESTRADOR:       'mg-badge-success',
  PASSEADOR:        'mg-badge-primary',
  FAMILIAR:         'mg-badge',
  AMIGO:            'mg-badge',
  OUTRO:            'mg-badge',
};

function TutorRow({
  pu,
  isMe,
  onRemove,
  canRemove,
}: {
  pu: PetUsuario;
  isMe: boolean;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  const badgeClass = ROLE_BADGE[pu.role] ?? 'mg-badge';
  return (
    <div className="mg-card-solid rounded-xl p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-primary text-sm font-headline font-bold">
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
      <span className={cn('mg-badge flex-shrink-0', badgeClass)}>
        {roleLabel(pu.role)}
      </span>
      {canRemove && onRemove && (
        <button
          onClick={onRemove}
          className="text-texto-soft hover:text-erro transition-colors p-1 flex-shrink-0"
          title={isMe ? 'Desvincular-se' : 'Remover tutor'}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

function VisitanteRow({ visitante, onRemove }: { visitante: PetVisitante; onRemove: () => void }) {
  const nome = visitante.visitante?.nome || 'Visitante';
  const permissoes = visitante.permissoesVisualizacao || [];

  return (
    <div className="mg-card-solid rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center flex-shrink-0">
          <span className="text-rose text-sm font-headline font-bold">
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
          className="mg-badge mg-badge-error flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          title="Remover acesso"
        >
          <Trash2 className="w-3 h-3" />
          Remover
        </button>
      </div>
      {permissoes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-13">
          {permissoes.map((p) => (
            <span
              key={p}
              className="mg-badge mg-badge-primary"
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
  const [showQR, setShowQR] = useState(false);
  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/pet-publico/${codigo}`
    : `/pet-publico/${codigo}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codigo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mg-card-solid rounded-xl px-4 py-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="mg-label mb-0.5">Código do pet</p>
          <p className="text-sm font-mono font-bold text-texto tracking-wider">
            {codigo}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="mg-btn-ghost text-sm"
          title="Copiar código"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copiado!
            </>
          ) : (
            'Copiar'
          )}
        </button>
      </div>
      <p className="text-xs text-texto-soft font-body">
        Compartilhe para outros se vincularem a {nome}
      </p>

      {/* QR Code toggle */}
      <button
        onClick={() => setShowQR(!showQR)}
        className="text-xs font-headline font-bold text-primary flex items-center gap-1"
      >
        {showQR ? '▲ Esconder QR Code' : '▼ Mostrar QR Code'}
      </button>

      {showQR && (
        <div className="flex flex-col items-center gap-3 py-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border">
            <QRCodeSVG
              value={publicUrl}
              size={160}
              level="M"
              fgColor="#7C3AED"
              bgColor="#ffffff"
            />
          </div>
          <p className="text-[10px] text-texto-soft font-body text-center max-w-[200px]">
            Escaneie para acessar o perfil de emergência de {nome}
          </p>
          <button
            onClick={() => window.print()}
            className="mg-btn text-xs px-4 py-2"
          >
            🖨️ Imprimir cartão
          </button>
        </div>
      )}
    </div>
  );
}
