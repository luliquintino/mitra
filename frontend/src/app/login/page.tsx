'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="min-h-screen bg-creme bg-blobs flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3" style={{ animationDelay: '0ms' }}>
          <Image src="/logo.png" alt="MITRA" width={480} height={112} className="h-12 w-auto" priority />
        </div>

        {/* Hero text */}
        <div className="text-center space-y-3" style={{ animationDelay: '100ms' }}>
          <h2 className="font-headline font-extrabold text-4xl text-texto tracking-tight leading-tight">
            Bem-vindo de volta 🐾
          </h2>
          <p className="text-texto-soft text-lg">
            Gestão completa do pet num único lugar
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2" style={{ animationDelay: '200ms' }}>
          {[
            { emoji: '🏥', label: 'Saúde' },
            { emoji: '📅', label: 'Agenda' },
            { emoji: '🤝', label: 'Guarda' },
            { emoji: '📖', label: 'Histórico' },
          ].map(f => (
            <span key={f.label} className="inline-flex items-center gap-1.5 bg-creme-dark text-texto-soft px-4 py-2 rounded-full text-sm font-headline font-semibold">
              <span>{f.emoji}</span>
              {f.label}
            </span>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl p-8 shadow-card space-y-5" style={{ animationDelay: '300ms' }}>
          {/* Error message */}
          {error && (
            <div className="bg-erro/10 text-erro rounded-2xl px-4 py-3 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="pt-label">Email</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg pointer-events-none">📧</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="seu@email.com"
                  className="pt-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="pt-label">Senha</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg pointer-events-none">🔒</span>
                <input
                  type="password"
                  value={form.senha}
                  onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                  placeholder="••••••••"
                  className="pt-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="pt-btn w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Create account link */}
          <p className="text-center text-texto-soft text-sm">
            Não tem conta?{' '}
            <Link href="/register" className="text-coral font-bold hover:underline">
              Criar conta
            </Link>
          </p>
        </div>

        {/* Trust signal */}
        <div className="flex items-center justify-center gap-2 text-sm text-texto-muted" style={{ animationDelay: '400ms' }}>
          <span>🐾 Usado por tutores em todo o Brasil</span>
        </div>

        {/* Dev credentials */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-creme-dark rounded-2xl p-4 space-y-2" style={{ animationDelay: '500ms' }}>
            <p className="pt-section-title">Credenciais de teste</p>
            <div className="space-y-1 text-sm font-body">
              <p><strong className="text-coral">Tutor:</strong> ana@mitra.com / 123456</p>
              <p><strong className="text-azul">Vet:</strong> carlos@mitra.com / 123456</p>
              <p><strong className="text-menta">Prestador:</strong> marcos@mitra.com / 123456</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
