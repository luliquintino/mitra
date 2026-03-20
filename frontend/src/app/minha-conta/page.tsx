'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials, cn } from '@/lib/utils';
import { notificationConfig } from '@/lib/config';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { useToast } from '@/components/ToastContainer';

// ─── Configuração de tipos de conta ──────────────────────────────────────────

const TIPOS_CONTA = [
  {
    value: 'TUTOR',
    emoji: '🐾',
    label: 'Tutor de pet',
    desc: 'Tenho pets e sou responsável por eles. Acesso completo aos dados do meu animal.',
  },
  {
    value: 'PRESTADOR',
    emoji: '🛠',
    label: 'Prestador de serviços',
    desc: 'Sou adestrador, passeador, veterinário, pet shop ou similar. Atendo pets de outras pessoas.',
  },
  {
    value: 'VISITANTE',
    emoji: '👀',
    label: 'Visitante',
    desc: 'Sou amigo ou familiar de um tutor. Tenho acesso limitado a informações do pet.',
  },
] as const;

const PROFISSOES = [
  { value: 'ADESTRADOR', label: 'Adestrador(a)' },
  { value: 'PASSEADOR', label: 'Passeador(a)' },
  { value: 'VETERINARIO', label: 'Veterinário(a)' },
  { value: 'PETSHOP', label: 'Pet Shop' },
  { value: 'BANHO_TOSA', label: 'Banho & Tosa' },
  { value: 'HOSPEDAGEM', label: 'Hospedagem pet' },
  { value: 'OUTRO', label: 'Outro' },
];

// ─── Matriz de acesso (informacional) ────────────────────────────────────────

const ACCESS_MATRIX = [
  {
    role: 'Tutor principal / emergência',
    color: 'bg-emerald-100 text-emerald-700',
    access: {
      perfil: { label: 'Completo', ok: true },
      saude: { label: 'Completo', ok: true },
      guarda: { label: 'Completo', ok: true },
      historico: { label: 'Completo', ok: true },
    },
  },
  {
    role: 'Veterinário',
    color: 'bg-teal-100 text-teal-700',
    access: {
      perfil: { label: 'Básico', ok: true },
      saude: { label: 'Completo', ok: true },
      guarda: { label: 'Sem acesso', ok: false },
      historico: { label: 'Saúde', ok: true },
    },
  },
  {
    role: 'Adestrador',
    color: 'bg-blue-100 text-blue-700',
    access: {
      perfil: { label: 'Básico', ok: true },
      saude: { label: 'Vacinas', ok: true },
      guarda: { label: 'Sem acesso', ok: false },
      historico: { label: 'Básico', ok: true },
    },
  },
  {
    role: 'Passeador',
    color: 'bg-purple-100 text-purple-700',
    access: {
      perfil: { label: 'Básico', ok: true },
      saude: { label: 'Vacinas', ok: true },
      guarda: { label: 'Sem acesso', ok: false },
      historico: { label: 'Sem acesso', ok: false },
    },
  },
  {
    role: 'Família / Amigo',
    color: 'bg-rose-100 text-rose-700',
    access: {
      perfil: { label: 'Nome e foto', ok: true },
      saude: { label: 'Sem acesso', ok: false },
      guarda: { label: 'Sem acesso', ok: false },
      historico: { label: 'Sem acesso', ok: false },
    },
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MinhaContaPage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    bio: '',
    tipoConta: 'TUTOR' as 'TUTOR' | 'PRESTADOR' | 'VISITANTE',
    profissao: 'ADESTRADOR',
    crmv: '',
    descricaoServicos: '',
    areaAtuacao: '',
    site: '',
  });
  const [saving, setSaving] = useState(false);
  const [showAccessMatrix, setShowAccessMatrix] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome || '',
        telefone: user.telefone || '',
        bio: (user as any).bio || '',
        tipoConta: (user as any).tipoConta || 'TUTOR',
        profissao: (user as any).profissao || 'ADESTRADOR',
        crmv: (user as any).crmv || '',
        descricaoServicos: (user as any).descricaoServicos || '',
        areaAtuacao: (user as any).areaAtuacao || '',
        site: (user as any).site || '',
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nome: form.nome,
        telefone: form.telefone,
        bio: form.bio,
        tipoConta: form.tipoConta,
        profissao: form.tipoConta === 'PRESTADOR' ? form.profissao : undefined,
        crmv: form.tipoConta === 'PRESTADOR' && form.profissao === 'VETERINARIO' ? form.crmv : undefined,
        descricaoServicos: form.tipoConta === 'PRESTADOR' ? form.descricaoServicos : undefined,
        areaAtuacao: form.tipoConta === 'PRESTADOR' ? form.areaAtuacao : undefined,
        site: form.site || undefined,
      };
      await usersApi.updateProfile(payload);
      updateUser(payload);
      toast.success('Perfil atualizado com sucesso.');
    } catch {
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const tipoAtual = TIPOS_CONTA.find((t) => t.value === form.tipoConta);

  return (
    <ProtectedLayout>
      <div className="space-y-5 animate-fade-in max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/home')}
            className="flex items-center gap-1.5 text-texto-soft hover:text-texto transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6" /></svg>
            <span className="text-sm font-medium">Início</span>
          </button>
        </div>

        {/* Avatar + nome */}
        <div className="pt-card flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral-light to-coral flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-white">
              {user ? getInitials(user.nome) : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-texto truncate">{user?.nome}</p>
            <p className="text-xs text-texto-soft truncate">{user?.email}</p>
            {tipoAtual && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-texto-soft bg-creme-dark px-2.5 py-0.5 rounded-full">
                <span>{tipoAtual.emoji}</span> {tipoAtual.label}
              </span>
            )}
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSave} className="space-y-5">

          {/* ── Dados pessoais ── */}
          <div className="pt-card space-y-4">
            <p className="pt-section-title">Dados pessoais</p>

            <div>
              <label className="pt-label">Nome completo *</label>
              <input
                type="text"
                className="pt-input"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="pt-label">E-mail</label>
              <input
                type="email"
                className="pt-input bg-white text-texto-soft cursor-not-allowed"
                value={user?.email || ''}
                readOnly
                disabled
              />
              <p className="text-xs text-texto-soft mt-1">O e-mail não pode ser alterado.</p>
            </div>

            <div>
              <label className="pt-label">Telefone / WhatsApp</label>
              <input
                type="tel"
                className="pt-input"
                placeholder="(11) 99999-0000"
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              />
            </div>

            <div>
              <label className="pt-label">Bio</label>
              <textarea
                className="pt-input resize-none"
                rows={2}
                placeholder="Uma frase sobre você..."
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                maxLength={160}
              />
              <p className="text-xs text-texto-soft mt-1 text-right">{form.bio.length}/160</p>
            </div>
          </div>

          {/* ── Tipo de conta ── */}
          <div className="pt-card space-y-3">
            <div>
              <p className="pt-section-title">Tipo de conta</p>
              <p className="text-xs text-texto-soft mt-0.5">
                Define o nível de acesso e quais campos aparecem no seu perfil.
              </p>
            </div>

            <div className="space-y-2">
              {TIPOS_CONTA.map((tipo) => (
                <label
                  key={tipo.value}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all',
                    form.tipoConta === tipo.value
                      ? 'bg-coral-light/50'
                      : 'bg-white hover:bg-creme-dark',
                  )}
                >
                  <input
                    type="radio"
                    name="tipoConta"
                    value={tipo.value}
                    checked={form.tipoConta === tipo.value}
                    onChange={() => setForm((f) => ({ ...f, tipoConta: tipo.value }))}
                    className="mt-0.5 accent-coral"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-texto">
                      {tipo.emoji} {tipo.label}
                    </p>
                    <p className="text-xs text-texto-soft mt-0.5 leading-relaxed">{tipo.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ── Dados profissionais (somente PRESTADOR) ── */}
          {form.tipoConta === 'PRESTADOR' && (
            <div className="pt-card space-y-4">
              <div>
                <p className="pt-section-title">Dados profissionais</p>
                <p className="text-xs text-texto-soft mt-0.5">
                  Visíveis para os tutores dos pets que você atende.
                </p>
              </div>

              <div>
                <label className="pt-label">Profissão *</label>
                <select
                  className="pt-input"
                  value={form.profissao}
                  onChange={(e) => setForm((f) => ({ ...f, profissao: e.target.value }))}
                >
                  {PROFISSOES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {form.profissao === 'VETERINARIO' && (
                <div>
                  <label className="pt-label">CRMV</label>
                  <input
                    type="text"
                    className="pt-input"
                    placeholder="12345-SP"
                    value={form.crmv}
                    onChange={(e) => setForm((f) => ({ ...f, crmv: e.target.value }))}
                  />
                </div>
              )}

              <div>
                <label className="pt-label">Descrição dos serviços</label>
                <textarea
                  className="pt-input resize-none"
                  rows={3}
                  placeholder="Descreva o que você oferece..."
                  value={form.descricaoServicos}
                  onChange={(e) => setForm((f) => ({ ...f, descricaoServicos: e.target.value }))}
                />
              </div>

              <div>
                <label className="pt-label">Área de atuação</label>
                <input
                  type="text"
                  className="pt-input"
                  placeholder="Ex: Vila Mariana, Moema - SP"
                  value={form.areaAtuacao}
                  onChange={(e) => setForm((f) => ({ ...f, areaAtuacao: e.target.value }))}
                />
              </div>

              <div>
                <label className="pt-label">Site / Instagram</label>
                <input
                  type="text"
                  className="pt-input"
                  placeholder="instagram.com/seuperfil"
                  value={form.site}
                  onChange={(e) => setForm((f) => ({ ...f, site: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Site para tutores também (opcional) */}
          {form.tipoConta !== 'PRESTADOR' && (
            <div className="pt-card space-y-3">
              <p className="pt-section-title">Contato opcional</p>
              <div>
                <label className="pt-label">Site / Instagram</label>
                <input
                  type="text"
                  className="pt-input"
                  placeholder="instagram.com/seuperfil"
                  value={form.site}
                  onChange={(e) => setForm((f) => ({ ...f, site: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Salvar */}
          <button
            type="submit"
            disabled={saving}
            className="pt-btn w-full text-sm py-3"
          >
            {saving ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </form>

        {/* ── Privacidade e acesso ── */}
        <div className="pt-card space-y-3">
          <button
            onClick={() => setShowAccessMatrix(!showAccessMatrix)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-texto">Privacidade e acesso</p>
                <p className="text-xs text-texto-soft">O que cada pessoa pode ver no seu pet</p>
              </div>
            </div>
            <span className={cn('text-texto-soft transition-transform text-[18px]', showAccessMatrix && 'rotate-90')}>&#x276F;</span>
          </button>

          {showAccessMatrix && (
            <div className="space-y-3 pt-1 animate-slide-up">
              <p className="text-xs text-texto-soft leading-relaxed">
                Quando você adiciona alguém ao seu pet, o nível de acesso é definido pelo vínculo atribuído.
                Tutores têm acesso total; prestadores e visitantes têm acesso limitado.
              </p>

              {/* Cabeçalho da tabela */}
              <div className="grid grid-cols-5 gap-1 text-xs text-texto-soft font-medium px-1">
                <div className="col-span-2">Vínculo</div>
                <div className="text-center">Perfil</div>
                <div className="text-center">Saúde</div>
                <div className="text-center">Guarda</div>
              </div>

              <div className="space-y-2">
                {ACCESS_MATRIX.map((row) => (
                  <div
                    key={row.role}
                    className="grid grid-cols-5 gap-1 items-center bg-white rounded-xl px-3 py-2.5"
                  >
                    <div className="col-span-2">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', row.color)}>
                        {row.role}
                      </span>
                    </div>
                    <AccessCell entry={row.access.perfil} />
                    <AccessCell entry={row.access.saude} />
                    <AccessCell entry={row.access.guarda} />
                  </div>
                ))}
              </div>

              <p className="text-xs text-texto-soft italic">
                * A aplicação de controle de acesso será reforçada progressivamente conforme o produto evolui.
              </p>
            </div>
          )}
        </div>

        {/* ── Segurança ── */}
        <div className="pt-card space-y-1">
          <p className="pt-section-title mb-3">Segurança</p>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-erro-light transition-colors text-left group"
          >
            <svg
              className="text-texto-soft group-hover:text-red-500 transition-colors"
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <div>
              <p className="text-sm font-medium text-texto group-hover:text-red-600 transition-colors">
                Sair da conta
              </p>
              <p className="text-xs text-texto-soft">Encerrar sessão neste dispositivo</p>
            </div>
          </button>
        </div>

        <div className="pb-6" />
      </div>
    </ProtectedLayout>
  );
}

function AccessCell({ entry }: { entry: { label: string; ok: boolean } }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={cn('text-sm', entry.ok ? 'text-emerald-500' : 'text-texto-muted')}>
        {entry.ok ? '✓' : '✕'}
      </span>
      <span className="text-[10px] text-texto-soft text-center leading-tight">{entry.label}</span>
    </div>
  );
}
