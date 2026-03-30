'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mail,
  Lock,
  PawPrint,
  ArrowRight,
  Heart,
  Shield,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.senha);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Credenciais inválidas. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  const featurePills = [
    { icon: Heart, label: 'Saúde', delay: '200ms' },
    { icon: Clock, label: 'Agenda', delay: '250ms' },
    { icon: Shield, label: 'Guarda', delay: '300ms' },
    { icon: PawPrint, label: 'Histórico', delay: '350ms' },
  ];

  return (
    <div className="mg-mesh-bg min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Logo */}
        <div
          className="flex flex-col items-center gap-2 animate-fade-in"
          style={{ animationDelay: '0ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-2">
            <PawPrint className="w-8 h-8 text-primary" strokeWidth={2.5} />
            <h1 className="font-headline font-extrabold text-4xl bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent tracking-tight">
              MITRA
            </h1>
          </div>
        </div>

        {/* Hero text */}
        <div
          className="text-center space-y-2 animate-fade-in"
          style={{ animationDelay: '100ms', animationFillMode: 'both' }}
        >
          <h2 className="font-headline font-bold text-2xl sm:text-3xl text-gray-800 tracking-tight leading-tight">
            Bem-vindo de volta
          </h2>
          <p className="text-gray-500 font-body text-base">
            Gestão completa do seu pet num único lugar
          </p>
        </div>

        {/* Feature pills */}
        <div
          className="flex flex-wrap justify-center gap-2 animate-fade-in"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        >
          {featurePills.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1.5 bg-white/50 backdrop-blur-sm border border-white/40 text-gray-600 px-3.5 py-1.5 rounded-full text-sm font-headline font-semibold shadow-sm"
            >
              <f.icon className="w-3.5 h-3.5 text-primary" />
              {f.label}
            </span>
          ))}
        </div>

        {/* Form card — glassmorphism */}
        <div
          className="bg-white/80 backdrop-blur-2xl border border-white/30 shadow-glass rounded-2xl p-6 sm:p-8 space-y-5 animate-fade-in"
          style={{ animationDelay: '300ms', animationFillMode: 'both' }}
        >
          {/* Error message */}
          {error && (
            <div className="bg-rose-50/80 backdrop-blur-sm border border-rose-200/50 text-rose-600 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-rose-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="mg-label">Email</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="seu@email.com"
                  className="mg-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="mg-label">Senha</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.senha}
                  onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
                  placeholder="••••••••"
                  className="mg-input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mg-btn w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Create account link */}
          <p className="text-center text-gray-500 font-body text-sm">
            Não tem conta?{' '}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline transition-colors"
            >
              Criar conta
            </Link>
          </p>
        </div>

        {/* Trust signal */}
        <div
          className="flex items-center justify-center gap-2 text-sm text-gray-400 font-body animate-fade-in"
          style={{ animationDelay: '400ms', animationFillMode: 'both' }}
        >
          <PawPrint className="w-3.5 h-3.5" />
          <span>Usado por tutores em todo o Brasil</span>
        </div>

      </div>
    </div>
  );
}
