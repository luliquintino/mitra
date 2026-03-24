'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedLayout from '@/components/layout/ProtectedLayout';
import { petsApi } from '@/lib/api';
import { PetResumoCodigo } from '@/types';
import { especieLabel } from '@/lib/utils';
import { PetImage } from '@/components/PetImage';
import { ChevronLeft } from 'lucide-react';

const ROLE_OPTIONS_BASE = [
  { value: 'TUTOR_EMERGENCIA', label: 'Tutor de emergência', desc: 'Cuida em emergências' },
  { value: 'FAMILIAR', label: 'Familiar', desc: 'Membro da família' },
  { value: 'AMIGO', label: 'Amigo(a)', desc: 'Contato de confiança' },
  { value: 'OUTRO', label: 'Outro vínculo', desc: 'Outro tipo de relação' },
];

export default function VincularPetPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [petSummary, setPetSummary] = useState<PetResumoCodigo | null>(null);
  const [role, setRole] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [vinculando, setVinculando] = useState(false);
  const [error, setError] = useState('');

  const handleBuscar = async () => {
    if (codigo.length < 4) {
      setError('Digite o código completo do pet (6 caracteres).');
      return;
    }
    setError('');
    setBuscando(true);
    setPetSummary(null);
    setRole('');
    try {
      const { data } = await petsApi.findByCodigo(codigo);
      setPetSummary(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Pet não encontrado com este código.');
    } finally {
      setBuscando(false);
    }
  };

  const handleVincular = async () => {
    if (!role || !petSummary) return;
    setError('');
    setVinculando(true);
    try {
      const { data } = await petsApi.vincularByCodigo(codigo, role);
      router.push(`/pets/${data.petId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao vincular. Tente novamente.');
    } finally {
      setVinculando(false);
    }
  };

  const roleOptions = (() => {
    const opts = [];
    if (petSummary?.tipoGuarda === 'CONJUNTA' && petSummary.tutorPrincipalCount < petSummary.maxTutorPrincipal) {
      opts.push({ value: 'TUTOR_PRINCIPAL', label: 'Tutor principal', desc: 'Acesso completo e gestão do pet' });
    }
    return [...opts, ...ROLE_OPTIONS_BASE];
  })();

  return (
    <ProtectedLayout>
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg bg-surface-muted hover:bg-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold text-texto">Vincular pet</h1>
        </div>

        {/* Etapa 1: Código */}
        <div className="pt-card space-y-4">
          <div>
            <p className="text-sm font-medium text-texto mb-1">Código do pet</p>
            <p className="text-xs text-texto-soft mb-3">
              Peça o código de 6 caracteres ao tutor principal do pet.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="pt-input flex-1 text-center font-mono text-lg tracking-[0.2em] uppercase"
              placeholder="ABC123"
              maxLength={6}
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                if (petSummary) {
                  setPetSummary(null);
                  setRole('');
                }
                setError('');
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleBuscar(); }}
            />
            <button
              onClick={handleBuscar}
              disabled={buscando || codigo.length < 4}
              className="pt-btn px-5 text-sm"
            >
              {buscando ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Buscar'
              )}
            </button>
          </div>
          {error && !petSummary && (
            <p className="text-xs text-erro">{error}</p>
          )}
        </div>

        {/* Etapa 2: Preview + Papel */}
        {petSummary && (
          <div className="pt-card space-y-4 mt-4 animate-fade-in">
            <p className="text-sm font-medium text-texto">Pet encontrado</p>

            <div className="flex items-center gap-4 bg-white rounded-xl p-4">
              <PetImage
                fotoUrl={petSummary.fotoUrl}
                nome={petSummary.nome}
                especie={petSummary.especie}
                className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10"
                fallbackClassName="bg-gradient-to-br from-primary/20 to-primary/10"
              />
              <div>
                <h3 className="text-lg font-bold text-texto">{petSummary.nome}</h3>
                <p className="text-sm text-texto-soft">
                  {especieLabel(petSummary.especie)}
                  {petSummary.raca ? ` · ${petSummary.raca}` : ''}
                </p>
                {petSummary.tipoGuarda === 'CONJUNTA' && (
                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    👥 Guarda compartilhada
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="pt-label">Qual é o seu vínculo com este pet?</label>
              <div className="space-y-2 mt-2">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      role === opt.value
                        ? 'bg-primary/10 text-primary'
                        : 'bg-white text-texto-soft hover:bg-surface-muted'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      role === opt.value ? 'border-primary' : 'border-surface-muted'
                    }`}>
                      {role === opt.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${role === opt.value ? 'text-primary' : 'text-texto'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-texto-soft">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-erro">{error}</p>
            )}

            <button
              onClick={handleVincular}
              disabled={!role || vinculando}
              className="pt-btn w-full flex items-center justify-center gap-2"
            >
              {vinculando ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Vinculando...
                </>
              ) : (
                `Vincular a ${petSummary.nome}`
              )}
            </button>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
