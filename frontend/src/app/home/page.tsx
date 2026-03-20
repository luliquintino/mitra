'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificacoes } from '@/contexts/NotificacaoContext';
import { petsApi, visitantesApi } from '@/lib/api';
import { Pet, VisitantePet, ConvitePendente, Notificacao } from '@/types';
import { cn, especieLabel, petAge } from '@/lib/utils';
import { timeConfig } from '@/lib/config';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { PetImage } from '@/components/PetImage';

// ─── Role config ──────────────────────────────────────────────────────────────

const TUTOR_ROLES = new Set(['TUTOR_PRINCIPAL', 'TUTOR_EMERGENCIA']);

interface RoleStyle {
  label: string;
  bg: string;
  text: string;
}

const ROLE_STYLE: Record<string, RoleStyle> = {
  TUTOR_PRINCIPAL:  { label: 'Principal',   bg: 'bg-coral-light',    text: 'text-coral'       },
  TUTOR_EMERGENCIA: { label: 'Emergência',  bg: 'bg-rosa-light',     text: 'text-rosa'        },
  VETERINARIO:      { label: 'Veterinário', bg: 'bg-azul-light',     text: 'text-azul'        },
  ADESTRADOR:       { label: 'Adestrador',  bg: 'bg-amarelo-light',  text: 'text-amarelo'     },
  PASSEADOR:        { label: 'Passeador',   bg: 'bg-menta-light',    text: 'text-menta'       },
  FAMILIAR:         { label: 'Família',     bg: 'bg-creme-dark',     text: 'text-texto-soft'  },
  AMIGO:            { label: 'Amigo',       bg: 'bg-creme-dark',     text: 'text-texto-soft'  },
  OUTRO:            { label: 'Outro',       bg: 'bg-creme-dark',     text: 'text-texto-soft'  },
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
              <h1 className="text-2xl font-semibold font-headline text-texto tracking-tight">
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
                  className="pt-btn-secondary flex items-center gap-1.5 text-sm"
                >
                  <span>🔗</span>
                  Vincular
                </button>
                <button
                  onClick={() => router.push('/home/novo-pet')}
                  className="pt-btn flex items-center gap-2 text-sm"
                >
                  <span>🐾</span>
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
              <div key={i} className="pt-card">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 pt-skeleton rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 pt-skeleton w-2/3" />
                    <div className="h-3 pt-skeleton w-1/3" />
                    <div className="h-3 pt-skeleton w-1/2" />
                  </div>
                </div>
                <div className="mt-4 pt-4 flex justify-between">
                  <div className="h-3 pt-skeleton w-20" />
                  <div className="h-3 pt-skeleton w-12" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="pt-card bg-erro-light">
            <p className="text-sm text-erro">{error}</p>
          </div>
        )}

        {/* Empty */}
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-24 h-24 rounded-full bg-coral-light flex items-center justify-center text-5xl shadow-inner">
              🐾
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-texto text-base">Nenhum pet cadastrado</p>
              <p className="text-sm text-texto-soft">Adicione seu primeiro pet para começar</p>
            </div>
            <button
              onClick={() => router.push('/home/novo-pet')}
              className="pt-btn flex items-center gap-2 px-8 py-3 text-sm"
            >
              <span>🐾</span>
              Adicionar pet
            </button>
          </div>
        )}

        {/* Convites pendentes banner */}
        {!loading && convitesPendentes.length > 0 && (
          <button
            onClick={() => router.push('/visitante/convites')}
            className="w-full pt-card bg-rosa-light hover:bg-rosa-light/80 transition-colors text-left active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">✉️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-rosa">
                  {convitesPendentes.length} {convitesPendentes.length === 1 ? 'convite pendente' : 'convites pendentes'}
                </p>
                <p className="text-xs text-rosa/80 mt-0.5">
                  Toque para ver e aceitar convites de acompanhamento
                </p>
              </div>
              <span className="text-rosa/60 text-base">›</span>
            </div>
          </button>
        )}

        {/* Pets */}
        {!loading && (pets.length > 0 || prestadorPets.length > 0 || visitantePets.length > 0) && (
          <div className="space-y-8">

            {/* Seção tutor - Meus Pets */}
            {isTutor && myPets.length > 0 && (
              <section className="space-y-3">
                {hasBothTutorAndPrestador && (
                  <SectionLabel icon="🏠" label="Como tutor" />
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

            {/* Seção acesso compartilhado */}
            {isTutor && accessPets.length > 0 && (
              <section className="space-y-3">
                <SectionLabel icon="🔑" label="Acesso compartilhado" />
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

            {/* Seção prestador - Pets que atendo */}
            {isPrestador && (
              <section className="space-y-3">
                {hasBothTutorAndPrestador && (
                  <SectionLabel icon="🩺" label="Como prestador" />
                )}
                {prestadorPets.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {prestadorPets.map((pet) => (
                      <PetCard key={pet.id} pet={pet} onClick={() => router.push(`/prestador/pets/${pet.id}`)} />
                    ))}
                  </div>
                ) : (
                  <div className="pt-card border-2 border-dashed border-creme-dark">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-creme-dark flex items-center justify-center text-lg">
                        🩺
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

            {/* Seção visitante - Acompanhando */}
            {visitantePets.length > 0 && (
              <section className="space-y-3">
                <SectionLabel icon="👀" label="Acompanhando" />
                <div className="grid gap-4 sm:grid-cols-2">
                  {visitantePets.map((vp) => (
                    <button
                      key={vp.id}
                      onClick={() => router.push(`/visitante/pets/${vp.id}`)}
                      className="pt-card hover:shadow-card-hover active:scale-[0.98] text-left w-full group transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <PetImage
                          fotoUrl={vp.fotoUrl}
                          nome={vp.nome}
                          especie={vp.especie}
                          className="w-16 h-16 bg-creme-dark"
                          fallbackClassName="bg-creme-dark"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-texto group-hover:text-coral transition-colors truncate">
                            {vp.nome}
                          </h3>
                          <p className="text-sm text-texto-soft">
                            {especieLabel(vp.especie)}
                            {vp.raca ? ` · ${vp.raca}` : ''}
                          </p>
                          {vp.relacao && (
                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-creme-dark text-texto-soft mt-1">
                              {vp.relacao}
                            </span>
                          )}
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-texto-muted group-hover:text-coral transition-colors flex-shrink-0 mt-1"><path d="m9 18 6-6-6-6"/></svg>
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

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 animate-slide-up">
      <span className="text-sm">{icon}</span>
      <span className="text-xs font-semibold text-texto-soft uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── PetCard ──────────────────────────────────────────────────────────────────

function PetCard({ pet, onClick }: { pet: Pet; onClick: () => void }) {
  const isTutor = TUTOR_ROLES.has(pet.meuRole ?? '');
  const role = pet.meuRole ? ROLE_STYLE[pet.meuRole] : null;

  // Only count actual tutors (principal + emergência) for the avatar stack
  const tutoresVinculados = (pet.petUsuarios ?? []).filter((pu) =>
    TUTOR_ROLES.has(pu.role),
  );
  const hasAlert = (pet.medicamentosAtivos ?? 0) > 0 || !!pet.proximaVacina;

  return (
    <button
      onClick={onClick}
      className="pt-card hover:shadow-card-hover active:scale-[0.98] text-left w-full group transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar with Pet Image */}
        <PetImage
          fotoUrl={pet.fotoUrl}
          nome={pet.nome}
          especie={pet.especie}
          className={cn(
            'w-20 h-20',
            isTutor
              ? 'bg-coral-light'
              : role
                ? `${role.bg}`
                : 'bg-creme-dark',
          )}
          fallbackClassName={cn(
            isTutor
              ? 'bg-coral-light'
              : role
                ? `${role.bg}`
                : 'bg-creme-dark',
          )}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-texto text-base leading-tight truncate group-hover:text-coral transition-colors">
              {pet.nome}
            </h2>
            {hasAlert && (
              <span className="w-2 h-2 rounded-full bg-amarelo flex-shrink-0" title="Alertas pendentes" />
            )}
          </div>

          {/* Role badge — positioned right below the name */}
          {role && (
            <span className={cn('inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1.5', role.bg, role.text)}>
              {role.label}
            </span>
          )}

          <p className="text-sm text-texto-soft leading-snug">
            {especieLabel(pet.especie)}
            {pet.raca ? ` · ${pet.raca}` : ''}
          </p>
          {pet.dataNascimento && (
            <p className="text-xs text-texto-soft mt-0.5">{petAge(pet.dataNascimento)}</p>
          )}
        </div>

        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-texto-muted group-hover:text-coral transition-colors flex-shrink-0 mt-0.5"><path d="m9 18 6-6-6-6"/></svg>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 flex items-center justify-between">

        {/* Left: avatar stack for tutors; nothing for access */}
        {isTutor ? (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {tutoresVinculados.slice(0, 3).map((pu) => (
                <div
                  key={pu.id}
                  className="w-6 h-6 rounded-full bg-coral-light flex items-center justify-center"
                  title={pu.usuario.nome}
                >
                  <span className="text-coral text-[10px] font-semibold">
                    {pu.usuario.nome.charAt(0)}
                  </span>
                </div>
              ))}
              {tutoresVinculados.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-creme-dark flex items-center justify-center">
                  <span className="text-texto-soft text-[9px] font-semibold">+{tutoresVinculados.length - 3}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-texto-soft">
              {tutoresVinculados.length}{' '}
              {tutoresVinculados.length === 1 ? 'tutor' : 'tutores'}
            </span>
          </div>
        ) : (
          <span className="text-xs text-texto-soft">Acesso limitado</span>
        )}

        {/* Right: alerts + archived */}
        <div className="flex items-center gap-2">
          {(pet.medicamentosAtivos ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-amarelo font-medium">
              <span>💊</span>
              {pet.medicamentosAtivos}
            </span>
          )}
          {pet.proximaVacina && (pet.medicamentosAtivos ?? 0) === 0 && (
            <span className="flex items-center gap-1 text-xs text-blue-500 font-medium">
              <span>💉</span>
            </span>
          )}
          {pet.status === 'ARQUIVADO' && (
            <span className="pt-badge bg-creme-dark text-texto-soft">Arquivado</span>
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
    case 'CONVITE_PRESTADOR':        return '🤝';
    case 'PRESTADOR_ACEITO_CONVITE': return '✅';
    case 'ACESSO_REMOVIDO_PRESTADOR':return '🚫';
    default:                         return '📢';
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
      {/* Collapsed bar — always visible */}
      <button
        onClick={onToggleExpanded}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all',
          expanded
            ? 'bg-white rounded-b-none'
            : 'bg-white shadow-sm hover:shadow-card-hover',
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🔔</span>
          <span className="text-sm font-medium text-texto">Notificações</span>
          {contNaoLidas > 0 && (
            <span className="text-xs font-bold text-white bg-coral rounded-full w-5 h-5 flex items-center justify-center animate-scale-in">
              {contNaoLidas}
            </span>
          )}
          {contNaoLidas === 0 && notificacoes.length > 0 && (
            <span className="text-xs text-texto-soft">{notificacoes.length}</span>
          )}
        </div>
        <span
          className={cn(
            'text-texto-soft transition-transform duration-200',
            expanded && 'rotate-180',
          )}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </button>

      {/* Expanded content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="bg-white rounded-b-xl px-4 pb-4 pt-2 space-y-3">
          {/* Actions row */}
          {contNaoLidas > 0 && (
            <div className="flex justify-end">
              <button
                onClick={onReadAll}
                className="text-xs font-medium text-coral hover:text-coral/80 transition-colors"
              >
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
                  'rounded-xl p-3 transition-all',
                  !notif.lida
                    ? 'bg-coral-light/50'
                    : 'bg-creme/50',
                )}
              >
                <div className="flex gap-3">
                  <div className="text-lg flex-shrink-0 pt-0.5">
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
                        <div className="w-2 h-2 rounded-full bg-coral flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-texto-soft">
                        {formatarData(notif.criadoEm)}
                      </span>
                      <div className="flex gap-3">
                        {notif.deepLink && (
                          <Link
                            href={notif.deepLink}
                            className="text-xs font-medium text-coral hover:text-coral/80 transition-colors"
                          >
                            Ver
                          </Link>
                        )}
                        {!notif.lida && (
                          <button
                            onClick={() => onRead(notif.id)}
                            className="text-xs font-medium text-texto-soft hover:text-texto transition-colors flex items-center gap-1"
                          >
                            <span className="text-xs">✓</span>
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
              className="w-full text-center text-xs font-medium text-coral hover:text-coral/80 transition-colors py-1"
            >
              {showAll ? 'Ver menos' : `Ver todas (${notificacoes.length})`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
