'use client';

/**
 * Emergency Page (F8)
 * Quick-access page with critical pet information:
 * basic data, allergies, active medications, recent vaccines,
 * vet contact, tutor contact, health plan.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { petsApi, healthApi, governanceApi } from '@/lib/api';
import { Pet, Vacina, Medicamento, PetUsuario, PlanoSaude } from '@/types';
import { formatDate, petAge, cn, getInitials } from '@/lib/utils';
import {
  AlertTriangle,
  Phone,
  Pill,
  Syringe,
  Heart,
  Shield,
  User,
  Stethoscope,
  ChevronLeft,
  Copy,
  Check,
} from 'lucide-react';

const ESPECIE_EMOJI: Record<string, string> = {
  CACHORRO: '🐶', GATO: '🐱', CAVALO: '🐴', PEIXE: '🐟',
  PASSARO: '🐦', ROEDOR: '🐹', COELHO: '🐰', REPTIL: '🦎',
  FURAO: '🦦', OUTRO: '🐾',
};

export default function EmergenciaPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const petId = params?.id as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [tutores, setTutores] = useState<PetUsuario[]>([]);
  const [plano, setPlano] = useState<PlanoSaude | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (!petId) return;

    Promise.all([
      petsApi.get(petId),
      healthApi.vacinas(petId),
      healthApi.medicamentos(petId),
      governanceApi.tutores(petId),
      healthApi.planoSaude(petId).catch(() => ({ data: null })),
    ]).then(([petRes, vacsRes, medsRes, tutRes, planoRes]) => {
      setPet(petRes.data as Pet);
      setVacinas((vacsRes.data as Vacina[]) || []);
      setMedicamentos((medsRes.data as Medicamento[]) || []);
      setTutores((tutRes.data as unknown as PetUsuario[]) || []);
      setPlano(planoRes.data as PlanoSaude | null);
    }).catch(() => {
      router.replace('/home');
    }).finally(() => setLoading(false));
  }, [petId, user, authLoading, router]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/pet-publico/${pet?.codigoPet || petId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pet) return null;

  const emoji = ESPECIE_EMOJI[pet.especie] || '🐾';
  const medsAtivos = medicamentos.filter((m) => m.status === 'ATIVO');
  const recentVacinas = vacinas.slice(0, 5);
  const tutorPrincipal = tutores.find((t) => t.role === 'TUTOR_PRINCIPAL');
  const vet = tutores.find((t) => t.role === 'VETERINARIO');

  return (
    <div className="space-y-4 pb-12">
      {/* Emergency Banner */}
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="font-headline font-bold text-lg">EMERGÊNCIA</h2>
        </div>
        <p className="text-sm text-white/80 font-body">
          Informações essenciais de {pet.nome} para atendimento de emergência
        </p>
      </div>

      {/* Basic Data */}
      <div className="mg-card space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h3 className="font-headline font-bold text-lg text-texto">{pet.nome}</h3>
            <p className="text-sm text-texto-soft font-body">
              {pet.raca || pet.especie} · {pet.genero === 'MACHO' ? 'Macho' : pet.genero === 'FEMEA' ? 'Fêmea' : '—'}
              {pet.dataNascimento && ` · ${petAge(pet.dataNascimento)}`}
            </p>
          </div>
        </div>
        {pet.peso && (
          <div className="flex items-center gap-2 text-sm text-texto">
            <span className="font-headline font-bold">Peso:</span>
            <span className="font-body">{pet.peso} kg</span>
          </div>
        )}
        {pet.microchip && (
          <div className="flex items-center gap-2 text-sm text-texto">
            <span className="font-headline font-bold">Microchip:</span>
            <span className="font-body font-mono text-xs">{pet.microchip}</span>
          </div>
        )}
        {pet.observacoes && (
          <div className="bg-amber/10 border border-amber/20 rounded-xl p-3">
            <p className="text-xs font-headline font-bold text-amber mb-1">⚠️ Observações importantes</p>
            <p className="text-sm font-body text-texto">{pet.observacoes}</p>
          </div>
        )}
      </div>

      {/* Active Medications */}
      <div className="mg-card space-y-3">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-teal" />
          <h3 className="font-headline font-bold text-sm text-texto">
            Medicamentos ativos ({medsAtivos.length})
          </h3>
        </div>
        {medsAtivos.length === 0 ? (
          <p className="text-sm text-texto-soft font-body">Nenhum medicamento ativo</p>
        ) : (
          <div className="space-y-2">
            {medsAtivos.map((m) => (
              <div key={m.id} className="bg-teal/5 border border-teal/10 rounded-xl p-3">
                <p className="font-headline font-bold text-sm text-texto">{m.nome}</p>
                <p className="text-xs text-texto-soft font-body">
                  {m.dosagem} · {m.frequencia}
                </p>
                {m.observacoes && (
                  <p className="text-xs text-teal mt-1">{m.observacoes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Vaccines */}
      <div className="mg-card space-y-3">
        <div className="flex items-center gap-2">
          <Syringe className="w-5 h-5 text-rose" />
          <h3 className="font-headline font-bold text-sm text-texto">
            Vacinas recentes ({recentVacinas.length})
          </h3>
        </div>
        {recentVacinas.length === 0 ? (
          <p className="text-sm text-texto-soft font-body">Nenhuma vacina registrada</p>
        ) : (
          <div className="space-y-2">
            {recentVacinas.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-1.5">
                <div>
                  <p className="font-headline font-semibold text-sm text-texto">{v.nome}</p>
                  <p className="text-[11px] text-texto-soft font-body">
                    Aplicada: {formatDate(v.dataAplicacao)}
                  </p>
                </div>
                {v.proximaDose && (
                  <span className={cn(
                    'text-[10px] font-headline font-bold px-2 py-1 rounded-full',
                    new Date(v.proximaDose) < new Date()
                      ? 'bg-rose/10 text-rose'
                      : 'bg-primary/10 text-primary',
                  )}>
                    Próxima: {formatDate(v.proximaDose)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health Plan */}
      {plano && (
        <div className="mg-card space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-headline font-bold text-sm text-texto">Plano de Saúde</h3>
          </div>
          <p className="font-body text-sm text-texto">{plano.operadora}</p>
          {plano.numeroCartao && (
            <p className="text-xs text-texto-soft font-body">Cartão: {plano.numeroCartao}</p>
          )}
          {plano.plano && (
            <p className="text-xs text-texto-soft font-body">Plano: {plano.plano}</p>
          )}
        </div>
      )}

      {/* Contacts */}
      <div className="mg-card space-y-3">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          <h3 className="font-headline font-bold text-sm text-texto">Contatos</h3>
        </div>

        {tutorPrincipal && (
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {getInitials(tutorPrincipal.usuario.nome)}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-headline font-semibold text-sm text-texto">{tutorPrincipal.usuario.nome}</p>
              <p className="text-xs text-primary font-body">Tutor principal</p>
            </div>
            <User className="w-4 h-4 text-texto-soft" />
          </div>
        )}

        {vet && (
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
              <span className="text-sm font-bold text-info">
                {getInitials(vet.usuario.nome)}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-headline font-semibold text-sm text-texto">{vet.usuario.nome}</p>
              <p className="text-xs text-info font-body">Veterinário</p>
            </div>
            <Stethoscope className="w-4 h-4 text-texto-soft" />
          </div>
        )}
      </div>

      {/* Share link */}
      <button
        onClick={handleCopyLink}
        className="w-full mg-card-solid flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-headline font-bold text-primary hover:bg-primary/5 transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Link copiado!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copiar link de emergência
          </>
        )}
      </button>
    </div>
  );
}
