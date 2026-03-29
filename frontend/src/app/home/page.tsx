'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificacoes } from '@/contexts/NotificacaoContext';
import { petsApi, visitantesApi } from '@/lib/api';
import { Pet, VisitantePet, ConvitePendente, Notificacao } from '@/types';
import { cn, especieLabel, petAge, daysUntilBirthday, petAgeYears } from '@/lib/utils';
import { timeConfig } from '@/lib/config';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { PetImage } from '@/components/PetImage';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Plus,
  Link2,
  PawPrint,
  Heart,
  Shield,
  Clock,
  Pill,
  Syringe,
  AlertCircle,
  Users,
  Eye,
  Check,
  X,
  Stethoscope,
  Mail,
  Key,
  Home,
  Megaphone,
  Handshake,
  UserCheck,
  Ban,
} from 'lucide-react';

// ─── Role config ──────────────────────────────────────────────────────────────

const TUTOR_ROLES = new Set(['TUTOR_PRINCIPAL', 'TUTOR_EMERGENCIA']);

interface RoleStyle {
  label: string;
  badge: string;
}

const ROLE_STYLE: Record<string, RoleStyle> = {
  TUTOR_PRINCIPAL:  { label: 'Principal',   badge: 'mg-badge-primary'  },
  TUTOR_EMERGENCIA: { label: 'Emergência',  badge: 'mg-badge-error'    },
  VETERINARIO:      { label: 'Veterinário', badge: 'mg-badge-info'     },
  ADESTRADOR:       { label: 'Adestrador',  badge: 'mg-badge-warning'  },
  PASSEADOR:        { label: 'Passeador',   badge: 'mg-badge-success'  },
  FAMILIAR:         { label: 'Família',     badge: 'mg-badge'          },
  AMIGO:            { label: 'Amigo',       badge: 'mg-badge'          },
  OUTRO:            { label: 'Outro',       badge: 'mg-badge'          },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { notificacoes, contNaoLidas, loading: notifLoading, marcarLida, marcarTodasLidas } = useNotificacoes();
  const [pets, setPets] = useState<Pet[]>([]);
  const [prestadorPets, setPrestadorPets] = useState<Pet[]>([]);
  const [visitantePets, setVisitantePets] = useState<VisitantePet[]>([]);
  const [convitesPendentes, setConvitesPendentes] = useState<ConvitePendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifExpanded, setNotifExpanded] = useState(false);

  useEffect(() => {
    petsApi
      .list()
      .then(({ data }) => setPets(data))
      .catch(() => setError('Erro ao carregar pets.'))
      .finally(() => setLoading(false));

    // Load visitor data
    visitantesApi.listPets().then(({ data }) => setVisitantePets(data)).catch(() => {});
    visitantesApi.listConvites().then(({ data }) => setConvitesPendentes(data)).catch(() => {});
  }, []);

  const myPets = pets.filter((p) => TUTOR_ROLES.has(p.meuRole ?? ''));
  const accessPets = pets.filter((p) => !TUTOR_ROLES.has(p.meuRole ?? ''));

  // Determine user type and sections to show
  const userType = user?.tipoUsuario ?? 'TUTOR';
  const isTutor = userType === 'TUTOR' || userType === 'AMBOS';
  const isPrestador = userType === 'PRESTADOR' || userType === 'AMBOS';

  const isEmpty = !loading && !error && pets.length === 0 && prestadorPets.length === 0 && visitantePets.length === 0;
  const hasBothTutorAndPrestador = isTutor && isPrestador && (myPets.length > 0 || prestadorPets.length > 0);

  return (
    <ProtectedLayout>
      <div className={cn('animate-fade-in', isEmpty ? 'flex flex-col min-h-[calc(100vh-80px)]' : 'space-y-6')}>

        {/* Header */}
        {!isEmpty && (
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-texto-soft font-medium mb-0.5">
                Olá, {user?.nome?.split(' ')[0]} 👋
              </p>
              <h1 className="text-2xl font-bold font-headline text-texto tracking-tight">
                {userType === 'TUTOR' && 'Meus pets'}
                {userType === 'PRESTADOR' && 'Pets que atendo'}
                {userType === 'AMBOS' && 'Dashboard'}
              </h1>
              {userType === 'AMBOS' && (
                <p className="text-xs text-texto-soft mt-1">Tutor e prestador de serviços</p>
              )}
            </div>
            {isTutor && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/home/vincular-pet')}
                  className="mg-btn-secondary flex items-center gap-1.5 text-sm"
                >
                  <Link2 className="w-4 h-4" />
                  Vincular
                </button>
                <button
                  onClick={() => router.push('/home/novo-pet')}
                  className="mg-btn flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar pet
                </button>
              </div>
            )}
          </div>
        )}

        {/* Notifications — only unread shown on home; read ones stay in notification history */}
        {!notifLoading && notificacoes.filter(n => !n.lida).length > 0 && (
          <NotificacoesSection
            notificacoes={notificacoes.filter(n => !n.lida)}
            contNaoLidas={contNaoLidas}
            expanded={notifExpanded}
            onToggleExpanded={() => setNotifExpanded((v) => !v)}
            onRead={marcarLida}
            onReadAll={marcarTodasLidas}
          />
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="mg-card">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 mg-skeleton rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 mg-skeleton rounded-lg w-2/3" />
                    <div className="h-3 mg-skeleton rounded-lg w-1/3" />
                    <div className="h-3 mg-skeleton rounded-lg w-1/2" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between">
                  <div className="h-3 mg-skeleton rounded-lg w-20" />
                  <div className="h-3 mg-skeleton rounded-lg w-12" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mg-card border-rose-200/50 bg-rose-50/60 backdrop-blur-[16px]">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#F43F5E] flex-shrink-0" />
              <p className="text-sm text-[#F43F5E] font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
            <div className="mg-card w-24 h-24 rounded-full flex items-center justify-center">
              <PawPrint className="w-10 h-10 text-[#7C3AED]" />
            </div>
            <div className="space-y-1">
              <p className="font-bold font-headline text-texto text-base">Nenhum pet cadastrado</p>
              <p className="text-sm text-texto-soft">Adicione seu primeiro pet para começar</p>
            </div>
            <button
              onClick={() => router.push('/home/novo-pet')}
              className="mg-btn flex items-center gap-2 px-8 py-3 text-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar pet
            </button>
          </div>
        )}

        {/* Convites pendentes banner */}
        {!loading && convitesPendentes.length > 0 && (
          <button
            onClick={() => router.push('/visitante/convites')}
            className="w-full mg-card border-[#14B8A6]/20 hover:shadow-glass-hover hover:-translate-y-0.5 text-left active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold font-headline text-[#14B8A6]">
                  {convitesPendentes.length} {convitesPendentes.length === 1 ? 'convite pendente' : 'convites pendentes'}
                </p>
                <p className="text-xs text-texto-soft mt-0.5">
                  Toque para ver e aceitar convites de acompanhamento
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#14B8A6]/60 flex-shrink-0" />
            </div>
          </button>
        )}

        {/* Pets */}
        {!loading && (pets.length > 0 || prestadorPets.length > 0 || visitantePets.length > 0) && (
          <div className="space-y-8">

            {/* Secao tutor - Meus Pets */}
            {isTutor && myPets.length > 0 && (
              <section className="space-y-3">
                {hasBothTutorAndPrestador && (
                  <SectionLabel icon={<Home className="w-4 h-4 text-[#7C3AED]" />} label="Como tutor" />
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {myPets.map((pet, i) => (
                    <div key={pet.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                      <PetCard pet={pet} onClick={() => router.push(`/pets/${pet.id}`)} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Secao acesso compartilhado */}
            {isTutor && accessPets.length > 0 && (
              <section className="space-y-3">
                <SectionLabel icon={<Key className="w-4 h-4 text-[#F59E0B]" />} label="Acesso compartilhado" />
                <p className="text-xs text-texto-soft -mt-1">
                  Você tem acesso a {accessPets.length === 1 ? 'este pet' : 'estes pets'} com permissões limitadas conforme seu papel.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {accessPets.map((pet) => (
                    <PetCard key={pet.id} pet={pet} onClick={() => router.push(`/pets/${pet.id}`)} />
                  ))}
                </div>
              </section>
            )}

            {/* Secao prestador - Pets que atendo */}
            {isPrestador && (
              <section className="space-y-3">
                {hasBothTutorAndPrestador && (
                  <SectionLabel icon={<Stethoscope className="w-4 h-4 text-[#14B8A6]" />} label="Como prestador" />
                )}
                {prestadorPets.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {prestadorPets.map((pet) => (
                      <PetCard key={pet.id} pet={pet} onClick={() => router.push(`/prestador/pets/${pet.id}`)} />
                    ))}
                  </div>
                ) : (
                  <div className="mg-card border-2 border-dashed border-white/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-[#14B8A6]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-texto">Nenhum pet convidado ainda</p>
                        <p className="text-xs text-texto-soft mt-0.5">Tutores podem convidá-lo para atender seus pets</p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Secao visitante - Acompanhando */}
            {visitantePets.length > 0 && (
              <section className="space-y-3">
                <SectionLabel icon={<Eye className="w-4 h-4 text-[#7C3AED]" />} label="Acompanhando" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {visitantePets.map((vp) => (
                    <button
                      key={vp.id}
                      onClick={() => router.push(`/visitante/pets/${vp.id}`)}
                      className="mg-card hover:shadow-glass-hover hover:-translate-y-0.5 active:scale-[0.98] text-left w-full group transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <PetImage
                          fotoUrl={vp.fotoUrl}
                          nome={vp.nome}
                          especie={vp.especie}
                          className="w-16 h-16 ring-2 ring-[#7C3AED]/20 rounded-2xl"
                          fallbackClassName="bg-[#7C3AED]/5"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold font-headline text-texto group-hover:text-[#7C3AED] transition-colors truncate">
                            {vp.nome}
                          </h3>
                          <p className="text-sm text-texto-soft">
                            {especieLabel(vp.especie)}
                            {vp.raca ? ` · ${vp.raca}` : ''}
                          </p>
                          {vp.relacao && (
                            <span className="mg-badge mt-1">
                              {vp.relacao}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-texto-muted group-hover:text-[#7C3AED] transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 animate-slide-up">
      {icon}
      <span className="text-xs font-bold font-headline text-texto-soft uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── PetCard ──────────────────────────────────────────────────────────────────

function PetCard({ pet, onClick }: { pet: Pet; onClick: () => void }) {
  const isTutor = TUTOR_ROLES.has(pet.meuRole ?? '');
  const role = pet.meuRole ? ROLE_STYLE[pet.meuRole] : null;

  // Only count actual tutors (principal + emergencia) for the avatar stack
  const tutoresVinculados = (pet.petUsuarios ?? []).filter((pu) =>
    TUTOR_ROLES.has(pu.role),
  );
  const hasAlert = (pet.medicamentosAtivos ?? 0) > 0 || !!pet.proximaVacina;

  return (
    <button
      onClick={onClick}
      className="mg-card hover:shadow-glass-hover hover:-translate-y-0.5 active:scale-[0.98] text-left w-full group transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar with Pet Image */}
        <div className="relative">
          <PetImage
            fotoUrl={pet.fotoUrl}
            nome={pet.nome}
            especie={pet.especie}
            className="w-20 h-20 ring-2 ring-[#7C3AED]/20 rounded-2xl"
            fallbackClassName="bg-[#7C3AED]/5"
          />
          {hasAlert && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F59E0B] border-2 border-white shadow-sm" title="Alertas pendentes" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-bold font-headline text-texto text-base leading-tight truncate group-hover:text-[#7C3AED] transition-colors">
              {pet.nome}
            </h2>
          </div>

          {/* Role badge */}
          {role && (
            <span className={cn('mg-badge mb-1.5', role.badge)}>
              {role.label}
            </span>
          )}

          <p className="text-sm text-texto-soft leading-snug">
            {especieLabel(pet.especie)}
            {pet.raca ? ` · ${pet.raca}` : ''}
          </p>
          {pet.dataNascimento && (
            <p className="text-xs text-texto-soft mt-0.5">
              {petAge(pet.dataNascimento)}
              {(() => {
                const days = daysUntilBirthday(pet.dataNascimento);
                if (days === null) return null;
                if (days === 0) return <span className="ml-1.5 text-primary font-bold">🎂 Hoje!</span>;
                if (days <= 30) {
                  const nextAge = (petAgeYears(pet.dataNascimento) ?? 0) + 1;
                  return <span className="ml-1.5 text-primary/80"> · 🎂 faz {nextAge} em {days}d</span>;
                }
                return null;
              })()}
            </p>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-texto-muted group-hover:text-[#7C3AED] transition-colors flex-shrink-0 mt-0.5" />
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">

        {/* Left: avatar stack for tutors; nothing for access */}
        {isTutor ? (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {tutoresVinculados.slice(0, 3).map((pu) => (
                <div
                  key={pu.id}
                  className="w-6 h-6 rounded-full bg-[#7C3AED]/10 border-2 border-white flex items-center justify-center"
                  title={pu.usuario.nome}
                >
                  <span className="text-[#7C3AED] text-[10px] font-semibold">
                    {pu.usuario.nome.charAt(0)}
                  </span>
                </div>
              ))}
              {tutoresVinculados.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-white/60 border-2 border-white flex items-center justify-center">
                  <span className="text-texto-soft text-[9px] font-semibold">+{tutoresVinculados.length - 3}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-texto-soft flex items-center gap-1">
              <Users className="w-3 h-3" />
              {tutoresVinculados.length}{' '}
              {tutoresVinculados.length === 1 ? 'tutor' : 'tutores'}
            </span>
          </div>
        ) : (
          <span className="text-xs text-texto-soft flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Acesso limitado
          </span>
        )}

        {/* Right: alerts + archived */}
        <div className="flex items-center gap-2">
          {(pet.medicamentosAtivos ?? 0) > 0 && (
            <span className="mg-badge-warning flex items-center gap-1">
              <Pill className="w-3 h-3" />
              {pet.medicamentosAtivos}
            </span>
          )}
          {pet.proximaVacina && (pet.medicamentosAtivos ?? 0) === 0 && (
            <span className="mg-badge-info flex items-center gap-1">
              <Syringe className="w-3 h-3" />
            </span>
          )}
          {pet.status === 'ARQUIVADO' && (
            <span className="mg-badge">Arquivado</span>
          )}
        </div>

      </div>
    </button>
  );
}

// ─── Notifications Section ───────────────────────────────────────────────────

const NOTIF_PREVIEW_COUNT = 3;

function getNotificacaoIcon(tipo: string) {
  switch (tipo) {
    case 'CONVITE_PRESTADOR':        return <Handshake className="w-5 h-5 text-[#7C3AED]" />;
    case 'PRESTADOR_ACEITO_CONVITE': return <UserCheck className="w-5 h-5 text-[#14B8A6]" />;
    case 'ACESSO_REMOVIDO_PRESTADOR':return <Ban className="w-5 h-5 text-[#F43F5E]" />;
    default:                         return <Megaphone className="w-5 h-5 text-[#F59E0B]" />;
  }
}

function formatarData(data: string) {
  const date = new Date(data);
  const agora = new Date();
  const diffMs = agora.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / timeConfig.MS_PER_MINUTE);
  const diffHoras = Math.floor(diffMs / timeConfig.MS_PER_HOUR);
  const diffDias = Math.floor(diffMs / timeConfig.MS_PER_DAY);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHoras < 24) return `${diffHoras}h atrás`;
  if (diffDias < 7) return `${diffDias}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

interface NotificacoesSectionProps {
  notificacoes: Notificacao[];
  contNaoLidas: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  onRead: (id: string) => Promise<void>;
  onReadAll: () => Promise<void>;
}

function NotificacoesSection({
  notificacoes,
  contNaoLidas,
  expanded,
  onToggleExpanded,
  onRead,
  onReadAll,
}: NotificacoesSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? notificacoes : notificacoes.slice(0, NOTIF_PREVIEW_COUNT);
  const hasMore = notificacoes.length > NOTIF_PREVIEW_COUNT;

  return (
    <section className="animate-fade-in">
      {/* Collapsed bar -- always visible */}
      <button
        onClick={onToggleExpanded}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all',
          expanded
            ? 'mg-card rounded-b-none'
            : 'mg-card hover:shadow-glass-hover',
        )}
      >
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-[#7C3AED]" />
          <span className="text-sm font-bold font-headline text-texto">Notificações</span>
          {contNaoLidas > 0 && (
            <span className="text-xs font-bold text-white bg-[#F43F5E] rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
              {contNaoLidas}
            </span>
          )}
          {contNaoLidas === 0 && notificacoes.length > 0 && (
            <span className="text-xs text-texto-soft">{notificacoes.length}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-texto-soft transition-transform duration-200',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {/* Expanded content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="bg-white/72 backdrop-blur-[16px] border border-t-0 border-white/30 rounded-b-xl px-4 pb-4 pt-2 space-y-3">
          {/* Actions row */}
          {contNaoLidas > 0 && (
            <div className="flex justify-end">
              <button
                onClick={onReadAll}
                className="text-xs font-medium text-[#7C3AED] hover:text-[#7C3AED]/80 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Marcar todas como lidas
              </button>
            </div>
          )}

          {/* Notification cards */}
          <div className="space-y-2">
            {visible.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  'mg-card-solid rounded-xl p-3 transition-all',
                  !notif.lida && 'ring-1 ring-[#7C3AED]/20 bg-[#7C3AED]/[0.03]',
                )}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 pt-0.5">
                    {getNotificacaoIcon(notif.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-texto line-clamp-1">
                          {notif.titulo}
                        </p>
                        {notif.mensagem && (
                          <p className="text-xs text-texto-soft mt-0.5 line-clamp-2">
                            {notif.mensagem}
                          </p>
                        )}
                      </div>
                      {!notif.lida && (
                        <div className="w-2 h-2 rounded-full bg-[#7C3AED] flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-texto-soft flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatarData(notif.criadoEm)}
                      </span>
                      <div className="flex gap-3">
                        {notif.deepLink && (
                          <Link
                            href={notif.deepLink}
                            className="text-xs font-medium text-[#7C3AED] hover:text-[#7C3AED]/80 transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Ver
                          </Link>
                        )}
                        {!notif.lida && (
                          <button
                            onClick={() => onRead(notif.id)}
                            className="text-xs font-medium text-texto-soft hover:text-texto transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="w-full text-center text-xs font-medium text-[#7C3AED] hover:text-[#7C3AED]/80 transition-colors py-1 flex items-center justify-center gap-1"
            >
              <ChevronDown className={cn('w-3 h-3 transition-transform', showAll && 'rotate-180')} />
              {showAll ? 'Ver menos' : `Ver todas (${notificacoes.length})`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
