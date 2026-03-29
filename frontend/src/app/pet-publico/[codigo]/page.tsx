'use client';

/**
 * Public Pet Page (F9)
 * Accessible without login. Shows emergency data for a pet via its public code.
 * URL: /pet-publico/[codigo]
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Pet, Vacina, Medicamento, PetUsuario } from '@/types';
import { formatDate, petAge, getInitials } from '@/lib/utils';
import {
  AlertTriangle,
  Pill,
  Syringe,
  Heart,
  User,
  Stethoscope,
  PawPrint,
} from 'lucide-react';

// For the public page, we directly import mock data (no auth needed)
import {
  mockPets,
  mockVacinasLuna, mockVacinasThor,
  mockMedicamentosLuna, mockMedicamentosThor,
  mockPetUsuariosLuna, mockPetUsuariosMochi, mockPetUsuariosThor, mockPetUsuariosNemo,
} from '@/lib/mock-data';

const ESPECIE_EMOJI: Record<string, string> = {
  CACHORRO: '🐶', GATO: '🐱', CAVALO: '🐴', PEIXE: '🐟',
  PASSARO: '🐦', ROEDOR: '🐹', COELHO: '🐰', REPTIL: '🦎',
  FURAO: '🦦', OUTRO: '🐾',
};

// Lookup tables for mock data
const VACINAS_MAP: Record<string, Vacina[]> = {
  'pet-luna': mockVacinasLuna,
  'pet-thor': mockVacinasThor,
};

const MEDS_MAP: Record<string, Medicamento[]> = {
  'pet-luna': mockMedicamentosLuna,
  'pet-thor': mockMedicamentosThor,
};

const TUTORES_MAP: Record<string, any[]> = {
  'pet-luna': mockPetUsuariosLuna,
  'pet-mochi': mockPetUsuariosMochi,
  'pet-thor': mockPetUsuariosThor,
  'pet-nemo': mockPetUsuariosNemo,
};

export default function PetPublicoPage() {
  const params = useParams();
  const codigo = params?.codigo as string;

  const [pet, setPet] = useState<Pet | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Find pet by codigoPet or by id
    const allPets = Object.values(mockPets);
    const found = allPets.find((p) => p.codigoPet === codigo || p.id === codigo);
    if (found) {
      setPet(found as Pet);
    } else {
      setNotFound(true);
    }
  }, [codigo]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center p-6">
        <PawPrint className="w-16 h-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pet não encontrado</h1>
        <p className="text-gray-500 text-center">Este código não corresponde a nenhum pet registrado no MITRA.</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const emoji = ESPECIE_EMOJI[pet.especie] || '🐾';
  const vacinas = VACINAS_MAP[pet.id] || [];
  const medicamentos = MEDS_MAP[pet.id] || [];
  const tutores = TUTORES_MAP[pet.id] || [];
  const medsAtivos = medicamentos.filter((m: Medicamento) => m.status === 'ATIVO');
  const tutorPrincipal = tutores.find((t: any) => t.role === 'TUTOR_PRINCIPAL');
  const vet = tutores.find((t: any) => t.role === 'VETERINARIO');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header with MITRA branding */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PawPrint className="w-5 h-5 text-violet-600" />
          <span className="font-bold text-violet-600 text-sm tracking-tight">MITRA</span>
        </div>
        <span className="text-xs text-gray-400">Perfil de emergência</span>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Emergency Banner */}
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-bold text-lg">EMERGÊNCIA</h2>
          </div>
          <p className="text-sm text-white/80">Dados de emergência</p>
        </div>

        {/* Basic Data */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{emoji}</span>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{pet.nome}</h3>
              <p className="text-sm text-gray-500">
                {pet.raca || pet.especie}
                {pet.dataNascimento && ` · ${petAge(pet.dataNascimento)}`}
              </p>
            </div>
          </div>
          {pet.peso && (
            <p className="text-sm text-gray-700"><strong>Peso:</strong> {pet.peso} kg</p>
          )}
          {pet.microchip && (
            <p className="text-sm text-gray-700"><strong>Microchip:</strong> <code className="text-xs">{pet.microchip}</code></p>
          )}
          {pet.observacoes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-700 mb-1">⚠️ Observações</p>
              <p className="text-sm text-gray-800">{pet.observacoes}</p>
            </div>
          )}
        </div>

        {/* Active Medications */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-500" />
            <h3 className="font-bold text-sm text-gray-900">Medicamentos ativos ({medsAtivos.length})</h3>
          </div>
          {medsAtivos.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum</p>
          ) : (
            medsAtivos.map((m: Medicamento) => (
              <div key={m.id} className="bg-teal-50 border border-teal-100 rounded-xl p-3">
                <p className="font-bold text-sm text-gray-900">{m.nome}</p>
                <p className="text-xs text-gray-500">{m.dosagem} · {m.frequencia}</p>
              </div>
            ))
          )}
        </div>

        {/* Recent Vaccines */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-sm text-gray-900">Vacinas ({vacinas.length})</h3>
          </div>
          {vacinas.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma registrada</p>
          ) : (
            vacinas.slice(0, 5).map((v: Vacina) => (
              <div key={v.id} className="flex items-center justify-between py-1">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{v.nome}</p>
                  <p className="text-[11px] text-gray-400">Aplicada: {formatDate(v.dataAplicacao)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contacts */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-violet-500" />
            <h3 className="font-bold text-sm text-gray-900">Contatos</h3>
          </div>
          {tutorPrincipal && (
            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-sm font-bold text-violet-600">
                  {getInitials(tutorPrincipal.usuario.nome)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{tutorPrincipal.usuario.nome}</p>
                <p className="text-xs text-violet-500">Tutor principal</p>
              </div>
            </div>
          )}
          {vet && (
            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                <span className="text-sm font-bold text-sky-600">
                  {getInitials(vet.usuario.nome)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{vet.usuario.nome}</p>
                <p className="text-xs text-sky-500">Veterinário</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-400">
            Gerado por <strong className="text-violet-500">MITRA</strong> · Rede de cuidado pet
          </p>
        </div>
      </main>
    </div>
  );
}
