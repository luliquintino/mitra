'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Passo2Tipo } from './passo-2-tipo';
import { Passo3Profissional } from './passo-3-profissional';

type Passo = 1 | 2 | 3;

const STEP_LABELS = ['Dados', 'Perfil', 'Profissional'];

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasso1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.senha.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setPasso(2);
  };

  const handlePasso2 = (tipo: string) => {
    setTipoUsuario(tipo);
    if (tipo === 'TUTOR') {
      // Se é apenas tutor, vai direto para completar registro
      handleRegister({ ...form, tipoUsuario: tipo });
    } else {
      // Se é prestador ou ambos, vai para passo 3
      setPasso(3);
    }
  };

  const handlePasso3 = async (dadosProfissionais: any) => {
    await handleRegister({
      ...form,
      tipoUsuario: 'AMBOS',
      dadosProfissionais,
    });
  };

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

  return (
    <div className="min-h-screen bg-creme bg-blobs relative overflow-hidden">
      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Logo */}
        <div className="mb-6 animate-fade-in">
          <Image src="/logo.png" alt="MITRA" width={480} height={112} className="h-12 w-auto" priority />
        </div>

        {/* Form card */}
        <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-card p-6 sm:p-8 space-y-6 animate-fade-slide-up">
          {/* Visual stepper */}
          <div className="flex items-center justify-center gap-0 mb-2">
            {STEP_LABELS.map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = stepNum === passo;
              const isCompleted = stepNum < passo;
              return (
                <div key={label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        isCompleted
                          ? 'bg-menta text-white'
                          : isActive
                          ? 'bg-coral text-white'
                          : 'bg-creme-dark text-texto-muted'
                      }`}
                    >
                      {isCompleted ? '✓' : stepNum}
                    </div>
                    <span
                      className={`text-xs mt-1.5 font-medium ${
                        isActive ? 'text-coral' : isCompleted ? 'text-menta' : 'text-texto-muted'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < STEP_LABELS.length - 1 && (
                    <div
                      className={`w-12 sm:w-16 h-px mx-2 mb-5 transition-colors ${
                        stepNum < passo ? 'bg-menta' : 'bg-creme-dark'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step heading */}
          <div className="space-y-1">
            <h2 className="font-headline font-bold text-2xl text-texto">
              {passo === 1 ? 'Criar conta' : passo === 2 ? 'Tipo de usuário' : 'Dados profissionais'}
            </h2>
            <p className="text-texto-soft text-sm">
              {passo === 1
                ? 'Comece com suas informações básicas'
                : passo === 2
                ? 'Escolha como você deseja utilizar a MITRA'
                : 'Conte-nos sobre seus serviços'}
            </p>
          </div>

          {/* Passo 1: Dados básicos */}
          {passo === 1 && (
            <div className="animate-slide-up">
              <form onSubmit={handlePasso1} className="space-y-4">
                <div>
                  <label className="pt-label">Nome completo</label>
                  <input
                    type="text"
                    className="pt-input"
                    placeholder="Ana Souza"
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="pt-label">E-mail</label>
                  <input
                    type="email"
                    className="pt-input"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="pt-label">Telefone (opcional)</label>
                  <input
                    type="tel"
                    className="pt-input"
                    placeholder="11 99999-0001"
                    value={form.telefone}
                    onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="pt-label">Senha</label>
                  <input
                    type="password"
                    className="pt-input"
                    placeholder="Mínimo 8 caracteres"
                    value={form.senha}
                    onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                    required
                    minLength={8}
                  />
                </div>

                {error && (
                  <div className="bg-erro/10 text-erro rounded-2xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="pt-btn w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Continuando...
                    </>
                  ) : (
                    'Continuar'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Passo 2: Tipo de usuário */}
          {passo === 2 && (
            <div className="animate-slide-up">
              <Passo2Tipo
                onContinue={handlePasso2}
                onBack={() => setPasso(1)}
              />
            </div>
          )}

          {/* Passo 3: Dados profissionais */}
          {passo === 3 && (
            <div className="animate-slide-up">
              <Passo3Profissional
                tipoUsuario={tipoUsuario}
                onContinue={handlePasso3}
                onBack={() => setPasso(2)}
              />
            </div>
          )}

          {/* Link para login */}
          {passo === 1 && (
            <p className="text-center text-sm text-texto-soft">
              Já tem conta?{' '}
              <Link
                href="/login"
                className="text-coral font-bold hover:text-coral/80 transition-colors"
              >
                Entrar
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
