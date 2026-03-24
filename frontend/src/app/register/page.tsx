'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  PawPrint,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Check,
  Stethoscope,
  Dog,
  Scissors,
  UserCheck,
} from 'lucide-react';

type Passo = 1 | 2 | 3;

const STEP_LABELS = ['Dados Básicos', 'Tipo de Usuário', 'Dados Profissionais'];

const tiposServico = [
  { valor: 'VETERINARIO', label: 'Veterinário' },
  { valor: 'PET_SITTER', label: 'Pet Sitter' },
  { valor: 'DAY_CARE', label: 'Day Care' },
  { valor: 'ADESTRADOR', label: 'Adestrador' },
  { valor: 'BANHO_TOSA', label: 'Banho e Tosa' },
  { valor: 'CUIDADOR_EVENTUAL', label: 'Cuidador Eventual' },
  { valor: 'OUTRO', label: 'Outro' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [passo, setPasso] = useState<Passo>(1);
  const [tipoUsuario, setTipoUsuario] = useState('');

  // Passo 1: Dados básicos
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
  });

  // Passo 2: selected type
  const [selectedTipo, setSelectedTipo] = useState('');

  // Passo 3: Dados profissionais
  const [formPro, setFormPro] = useState({
    tipoPrestador: '',
    nomeEmpresa: '',
    cnpj: '',
    telefoneProfissional: '',
    endereco: '',
    registroProfissional: '',
    descricao: '',
    website: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Step 1 handler ---
  const handlePasso1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.senha.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setPasso(2);
  };

  // --- Step 2 handler ---
  const handlePasso2 = () => {
    if (!selectedTipo) return;
    setTipoUsuario(selectedTipo);
    if (selectedTipo === 'TUTOR') {
      handleRegister({ ...form, tipoUsuario: selectedTipo });
    } else {
      setPasso(3);
    }
  };

  // --- Step 3 handler ---
  const handlePasso3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !formPro.tipoPrestador ||
      !formPro.telefoneProfissional ||
      !formPro.endereco ||
      !formPro.descricao
    ) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    await handleRegister({
      ...form,
      tipoUsuario: tipoUsuario || 'AMBOS',
      dadosProfissionais: formPro,
    });
  };

  // --- Register handler ---
  const handleRegister = async (data: any) => {
    setError('');
    setLoading(true);
    try {
      await register(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Erro ao criar conta. Tente novamente.',
      );
      setLoading(false);
    }
  };

  // --- Type option cards for step 2 ---
  const tipoOpcoes = [
    {
      id: 'TUTOR',
      label: 'Sou Tutor',
      descricao: 'Tenho pet(s) e quero gerenciá-los',
      icon: Dog,
    },
    {
      id: 'PRESTADOR',
      label: 'Sou Prestador',
      descricao: 'Veterinário, pet sitter, adestrador, etc',
      icon: Stethoscope,
    },
    {
      id: 'AMBOS',
      label: 'Ambos',
      descricao: 'Tenho pets e também presto serviços',
      icon: UserCheck,
    },
  ];

  // Step heading data
  const stepHeadings: Record<Passo, { title: string; subtitle: string }> = {
    1: { title: 'Criar conta', subtitle: 'Comece com suas informações básicas' },
    2: { title: 'Tipo de usuário', subtitle: 'Escolha como você deseja utilizar a MITRA' },
    3: { title: 'Dados profissionais', subtitle: 'Conte-nos sobre seus serviços' },
  };

  return (
    <div className="mg-mesh-bg min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* MITRA Logo */}
        <div
          className="flex flex-col items-center gap-2 animate-fade-in"
          style={{ animationDelay: '0ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-2.5">
            <PawPrint className="w-8 h-8 text-[#7C3AED]" strokeWidth={2.5} />
            <h1 className="font-headline font-extrabold text-4xl bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent tracking-tight">
              MITRA
            </h1>
          </div>
        </div>

        {/* Glass card */}
        <div
          className="bg-white/[0.72] backdrop-blur-[16px] border border-white/30 shadow-glass rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-in"
          style={{ animationDelay: '150ms', animationFillMode: 'both' }}
        >
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-0">
            {STEP_LABELS.map((label, idx) => {
              const stepNum = (idx + 1) as Passo;
              const isActive = stepNum === passo;
              const isCompleted = stepNum < passo;
              return (
                <div key={label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                          : isActive
                          ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30'
                          : 'border-2 border-gray-300 text-gray-400 bg-white/50'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                    </div>
                    <span
                      className={`text-[11px] mt-1.5 font-semibold font-headline transition-colors whitespace-nowrap ${
                        isActive || isCompleted ? 'text-[#7C3AED]' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      className={`w-10 sm:w-14 h-0.5 mx-1.5 sm:mx-2.5 mb-5 rounded-full transition-colors duration-300 ${
                        stepNum < passo ? 'bg-[#7C3AED]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step heading */}
          <div className="space-y-1">
            <h2 className="font-headline font-bold text-2xl text-gray-800">
              {stepHeadings[passo].title}
            </h2>
            <p className="text-gray-500 font-body text-sm">
              {stepHeadings[passo].subtitle}
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-[#F43F5E]/10 backdrop-blur-sm border border-[#F43F5E]/20 text-[#F43F5E] rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 animate-fade-in">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#F43F5E]" />
              {error}
            </div>
          )}

          {/* ===== PASSO 1: Dados Básicos ===== */}
          {passo === 1 && (
            <div className="animate-fade-in" key="step-1">
              <form onSubmit={handlePasso1} className="space-y-4">
                {/* Nome */}
                <div className="space-y-1.5">
                  <label className="mg-label">Nome completo</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      className="mg-input pl-10"
                      placeholder="Ana Souza"
                      value={form.nome}
                      onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="mg-label">E-mail</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      className="mg-input pl-10"
                      placeholder="seu@email.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Telefone */}
                <div className="space-y-1.5">
                  <label className="mg-label">Telefone (opcional)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      className="mg-input pl-10"
                      placeholder="11 99999-0001"
                      value={form.telefone}
                      onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-1.5">
                  <label className="mg-label">Senha</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      className="mg-input pl-10"
                      placeholder="Mínimo 8 caracteres"
                      value={form.senha}
                      onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="mg-btn w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Próximo
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ===== PASSO 2: Tipo de Usuário ===== */}
          {passo === 2 && (
            <div className="animate-fade-in" key="step-2">
              <div className="space-y-3 mb-6">
                {tipoOpcoes.map((opcao) => {
                  const isSelected = selectedTipo === opcao.id;
                  const IconComp = opcao.icon;
                  return (
                    <button
                      key={opcao.id}
                      onClick={() => setSelectedTipo(opcao.id)}
                      className={`w-full rounded-xl p-4 transition-all duration-200 text-left cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'bg-white/80 backdrop-blur-sm border-2 border-[#7C3AED] ring-2 ring-[#7C3AED]/20 shadow-md'
                          : 'bg-white/40 backdrop-blur-sm border-2 border-white/30 hover:bg-white/60 hover:border-white/50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                              : 'bg-gray-100/80 text-gray-400'
                          }`}
                        >
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-headline font-semibold ${isSelected ? 'text-[#7C3AED]' : 'text-gray-700'}`}>
                            {opcao.label}
                          </p>
                          <p className="text-sm text-gray-500 font-body">{opcao.descricao}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  onClick={() => setPasso(1)}
                  className="mg-btn-ghost flex-1 flex items-center justify-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
                <button
                  onClick={handlePasso2}
                  disabled={!selectedTipo || loading}
                  className="mg-btn flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : selectedTipo === 'TUTOR' ? (
                    <>
                      Criar conta
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Próximo
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ===== PASSO 3: Dados Profissionais ===== */}
          {passo === 3 && (
            <div className="animate-fade-in" key="step-3">
              <form onSubmit={handlePasso3} className="space-y-4">
                {/* Tipo de serviço */}
                <div className="space-y-1.5">
                  <label className="mg-label">Tipo de serviço *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <select
                      className="mg-select pl-10"
                      value={formPro.tipoPrestador}
                      onChange={(e) =>
                        setFormPro((f) => ({ ...f, tipoPrestador: e.target.value }))
                      }
                    >
                      <option value="">Selecione</option>
                      {tiposServico.map((tipo) => (
                        <option key={tipo.valor} value={tipo.valor}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Empresa grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="mg-label">Nome da empresa</label>
                    <input
                      type="text"
                      className="mg-input"
                      placeholder="Opcional"
                      value={formPro.nomeEmpresa}
                      onChange={(e) =>
                        setFormPro((f) => ({ ...f, nomeEmpresa: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="mg-label">CNPJ</label>
                    <input
                      type="text"
                      className="mg-input"
                      placeholder="Opcional"
                      value={formPro.cnpj}
                      onChange={(e) => setFormPro((f) => ({ ...f, cnpj: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Telefone profissional */}
                <div className="space-y-1.5">
                  <label className="mg-label">Telefone profissional *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      className="mg-input pl-10"
                      placeholder="11 99999-9999"
                      value={formPro.telefoneProfissional}
                      onChange={(e) =>
                        setFormPro((f) => ({
                          ...f,
                          telefoneProfissional: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-1.5">
                  <label className="mg-label">Endereço *</label>
                  <input
                    type="text"
                    className="mg-input"
                    placeholder="Rua, número, cidade, estado"
                    value={formPro.endereco}
                    onChange={(e) =>
                      setFormPro((f) => ({ ...f, endereco: e.target.value }))
                    }
                    required
                  />
                </div>

                {/* Registro profissional */}
                <div className="space-y-1.5">
                  <label className="mg-label">Registro profissional</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <Stethoscope className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      className="mg-input pl-10"
                      placeholder="Ex: CRMV 123456"
                      value={formPro.registroProfissional}
                      onChange={(e) =>
                        setFormPro((f) => ({
                          ...f,
                          registroProfissional: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div className="space-y-1.5">
                  <label className="mg-label">Descrição do serviço *</label>
                  <textarea
                    className="mg-input resize-none"
                    rows={3}
                    placeholder="Descreva seu serviço, especialidades, etc"
                    value={formPro.descricao}
                    onChange={(e) =>
                      setFormPro((f) => ({ ...f, descricao: e.target.value }))
                    }
                    required
                  />
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="mg-label">Site</label>
                  <input
                    type="url"
                    className="mg-input"
                    placeholder="https://..."
                    value={formPro.website}
                    onChange={(e) =>
                      setFormPro((f) => ({ ...f, website: e.target.value }))
                    }
                  />
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPasso(2)}
                    className="mg-btn-ghost flex-1 flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="mg-btn flex-1 flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Criar conta
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Login link - only on step 1 */}
          {passo === 1 && (
            <p className="text-center text-gray-500 font-body text-sm pt-1">
              Já tem conta?{' '}
              <Link
                href="/login"
                className="text-[#7C3AED] font-bold hover:underline transition-colors"
              >
                Entrar
              </Link>
            </p>
          )}
        </div>

        {/* Trust signal */}
        <div
          className="flex items-center justify-center gap-2 text-sm text-gray-400 font-body animate-fade-in"
          style={{ animationDelay: '300ms', animationFillMode: 'both' }}
        >
          <PawPrint className="w-3.5 h-3.5" />
          <span>Cuidando de quem cuida dos pets</span>
        </div>
      </div>
    </div>
  );
}
