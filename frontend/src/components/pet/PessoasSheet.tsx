'use client';

import { useState, useEffect, useCallback } from 'react';
import { BottomSheet } from '@/components/BottomSheet';
import { governanceApi, petsApi } from '@/lib/api';
import { PetUsuario, PetVisitante, PermissaoVisitante } from '@/types';
import { roleLabel, getInitials, cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface PessoasSheetProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  tutores: PetUsuario[];
  onUpdate: () => void;
}

type SubTab = 'tutores' | 'prestadores' | 'visitantes';

const INVITE_ROLES = [
  { value: 'FAMILIAR', label: 'Familiar' },
  { value: 'AMIGO', label: 'Amigo' },
  { value: 'VETERINARIO', label: 'Veterinario' },
  { value: 'ADESTRADOR', label: 'Adestrador' },
  { value: 'PASSEADOR', label: 'Passeador' },
  { value: 'TUTOR_EMERGENCIA', label: 'Tutor de emergencia' },
] as const;

const PRESTADOR_ROLES = ['VETERINARIO', 'ADESTRADOR', 'PASSEADOR'];

const PERMISSAO_LABELS: Record<PermissaoVisitante, string> = {
  DADOS_BASICOS: 'Dados básicos',
  STATUS_SAUDE: 'Saúde',
  HISTORICO_VACINACAO: 'Vacinas',
  MEDICAMENTOS: 'Medicamentos',
  AGENDA_CONSULTAS: 'Consultas',
  PRESTADORES_PET: 'Prestadores',
  TIMELINE_ATUALIZACOES: 'Timeline',
};

// ─── Component ──────────────────────────────────────────────────────────────────

export function PessoasSheet({ open, onClose, petId, tutores, onUpdate }: PessoasSheetProps) {
  const [subTab, setSubTab] = useState<SubTab>('tutores');
  const [visitantes, setVisitantes] = useState<PetVisitante[]>([]);
  const [visitantesLoading, setVisitantesLoading] = useState(false);
  const [visitantesError, setVisitantesError] = useState(false);

  // Invite form state
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('FAMILIAR');
  const [inviteSaving, setInviteSaving] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Confirmation banner
  const [confirmation, setConfirmation] = useState('');

  // Derived: prestadores filtered from tutores
  const prestadores = tutores.filter((t) => PRESTADOR_ROLES.includes(t.role));

  // Load visitantes when tab is selected
  const loadVisitantes = useCallback(async () => {
    setVisitantesLoading(true);
    setVisitantesError(false);
    try {
      const { data } = await petsApi.listVisitantes(petId);
      setVisitantes(Array.isArray(data) ? data : []);
    } catch {
      setVisitantesError(true);
      setVisitantes([]);
    } finally {
      setVisitantesLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    if (open && subTab === 'visitantes') {
      loadVisitantes();
    }
  }, [open, subTab, loadVisitantes]);

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setShowInviteForm(false);
      setInviteEmail('');
      setInviteRole('FAMILIAR');
      setInviteError('');
      setConfirmation('');
    }
  }, [open]);

  // Handle invite submit
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSaving(true);
    setInviteError('');
    try {
      const { data } = await governanceApi.adicionarTutor(petId, inviteEmail.trim(), inviteRole);
      const msg = (data as any)?.mensagem || 'Convite enviado com sucesso!';
      setConfirmation(msg);
      setShowInviteForm(false);
      setInviteEmail('');
      setInviteRole('FAMILIAR');
      onUpdate();
      setTimeout(() => setConfirmation(''), 4000);
    } catch (err: any) {
      setInviteError(
        err?.response?.data?.message || 'Erro ao convidar. Verifique o e-mail e tente novamente.'
      );
    } finally {
      setInviteSaving(false);
    }
  };

  const cancelInvite = () => {
    setShowInviteForm(false);
    setInviteEmail('');
    setInviteRole('FAMILIAR');
    setInviteError('');
  };

  // Sub-tab definitions with counts
  const tabs: { id: SubTab; label: string }[] = [
    { id: 'tutores', label: 'Tutores' },
    { id: 'prestadores', label: `Prestadores (${prestadores.length})` },
    { id: 'visitantes', label: 'Visitantes' },
  ];

  return (
    <BottomSheet open={open} onClose={onClose} title="Pessoas">
      {/* Confirmation banner */}
      {confirmation && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-creme-dark text-texto animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{confirmation}</span>
        </div>
      )}

      {/* Pill sub-tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              subTab === t.id
                ? 'pt-tab-active'
                : 'pt-tab',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {subTab === 'tutores' && (
        <TutoresTab
          tutores={tutores}
          showInviteForm={showInviteForm}
          onToggleForm={() => setShowInviteForm(!showInviteForm)}
          inviteEmail={inviteEmail}
          onEmailChange={setInviteEmail}
          inviteRole={inviteRole}
          onRoleChange={setInviteRole}
          inviteSaving={inviteSaving}
          inviteError={inviteError}
          onSubmit={handleInvite}
          onCancel={cancelInvite}
        />
      )}

      {subTab === 'prestadores' && (
        <PrestadoresTab prestadores={prestadores} />
      )}

      {subTab === 'visitantes' && (
        <VisitantesTab
          visitantes={visitantes}
          loading={visitantesLoading}
          hasError={visitantesError}
        />
      )}
    </BottomSheet>
  );
}

// ─── Tutores Tab ────────────────────────────────────────────────────────────────

function TutoresTab({
  tutores,
  showInviteForm,
  onToggleForm,
  inviteEmail,
  onEmailChange,
  inviteRole,
  onRoleChange,
  inviteSaving,
  inviteError,
  onSubmit,
  onCancel,
}: {
  tutores: PetUsuario[];
  showInviteForm: boolean;
  onToggleForm: () => void;
  inviteEmail: string;
  onEmailChange: (v: string) => void;
  inviteRole: string;
  onRoleChange: (v: string) => void;
  inviteSaving: boolean;
  inviteError: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* Invite button */}
      <div className="flex justify-end">
        <button
          onClick={onToggleForm}
          className="pt-btn text-sm"
        >
          + Convidar
        </button>
      </div>

      {/* Inline invite form */}
      {showInviteForm && (
        <form onSubmit={onSubmit} className="pt-card space-y-3 bg-coral-light/30">
          <h4 className="font-semibold text-texto text-sm">Convidar pessoa</h4>
          <div>
            <label className="pt-label">E-mail *</label>
            <input
              type="email"
              className="pt-input"
              placeholder="email@exemplo.com"
              value={inviteEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="pt-label">Papel</label>
            <select
              className="pt-input"
              value={inviteRole}
              onChange={(e) => onRoleChange(e.target.value)}
            >
              {INVITE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          {inviteError && <p className="text-xs text-erro">{inviteError}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={inviteSaving}
              className="pt-btn flex-1 text-sm"
            >
              {inviteSaving ? 'Enviando...' : 'Enviar convite'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="pt-btn-secondary text-sm px-4"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* People list */}
      {tutores.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Nenhum tutor vinculado"
          description="Convide pessoas para ajudar no cuidado do seu pet."
        />
      ) : (
        <div className="space-y-2">
          {tutores.map((pu) => (
            <PersonCard key={pu.id} petUsuario={pu} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Prestadores Tab ────────────────────────────────────────────────────────────

function PrestadoresTab({ prestadores }: { prestadores: PetUsuario[] }) {
  if (prestadores.length === 0) {
    return (
      <EmptyState
        icon="🩺"
        title="Nenhum prestador vinculado"
        description="Veterinarios, adestradores e passeadores vinculados ao pet aparecerao aqui."
      />
    );
  }

  return (
    <div className="space-y-2">
      {prestadores.map((pu) => (
        <PersonCard key={pu.id} petUsuario={pu} />
      ))}
    </div>
  );
}

// ─── Visitantes Tab ─────────────────────────────────────────────────────────────

function VisitantesTab({
  visitantes,
  loading,
  hasError,
}: {
  visitantes: PetVisitante[];
  loading: boolean;
  hasError: boolean;
}) {
  const [showComingSoon, setShowComingSoon] = useState(false);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 pt-skeleton rounded-2xl" />
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-3">
        <EmptyState
          icon="👁️"
          title="Funcionalidade em breve"
          description="O sistema de visitantes está sendo finalizado. Em breve você poderá convidar visitantes para acompanhar o pet."
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Invite button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowComingSoon(true)}
          className="pt-btn text-sm"
        >
          + Convidar visitante
        </button>
      </div>

      {showComingSoon && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-coral-light text-coral">
          <span>Em breve</span>
          <span className="text-coral/70">— o convite de visitantes sera habilitado em breve.</span>
          <button
            onClick={() => setShowComingSoon(false)}
            className="ml-auto text-coral/50 hover:text-coral"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {visitantes.length === 0 ? (
        <EmptyState
          icon="👁️"
          title="Nenhum visitante vinculado"
          description="Visitantes podem visualizar informações do pet com permissões limitadas."
        />
      ) : (
        <div className="space-y-2">
          {visitantes.map((v) => (
            <VisitanteCard key={v.id} visitante={v} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared Sub-components ──────────────────────────────────────────────────────

function PersonCard({ petUsuario }: { petUsuario: PetUsuario }) {
  const nome = petUsuario.usuario?.nome || 'Sem nome';
  const initials = getInitials(nome);

  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-azul-light flex items-center justify-center flex-shrink-0">
        <span className="text-azul text-xs font-semibold">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-texto truncate">{nome}</p>
        {petUsuario.usuario?.email && (
          <p className="text-xs text-texto-soft truncate">{petUsuario.usuario.email}</p>
        )}
      </div>
      <span className="pt-badge bg-azul-light text-azul flex-shrink-0">
        {roleLabel(petUsuario.role)}
      </span>
    </div>
  );
}

function VisitanteCard({ visitante }: { visitante: PetVisitante }) {
  const nome = visitante.visitante?.nome || 'Visitante';
  const initials = getInitials(nome);
  const permissoes = visitante.permissoesVisualizacao || [];

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-coral-light flex items-center justify-center flex-shrink-0">
          <span className="text-coral text-xs font-semibold">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-texto truncate">{nome}</p>
          {visitante.relacao && (
            <p className="text-xs text-texto-soft">{visitante.relacao}</p>
          )}
        </div>
      </div>
      {permissoes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2 ml-12">
          {permissoes.map((p) => (
            <span
              key={p}
              className="pt-badge bg-coral-light text-coral"
            >
              {PERMISSAO_LABELS[p] || p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="pt-card text-center py-10 space-y-3">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="font-semibold text-texto text-sm">{title}</p>
        <p className="text-xs text-texto-soft mt-1 max-w-xs mx-auto">{description}</p>
      </div>
    </div>
  );
}
