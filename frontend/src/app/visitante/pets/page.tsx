'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { visitantesApi } from '@/lib/api';
import { VisitantePet } from '@/types';
import { especieLabel } from '@/lib/utils';
import { PetImage } from '@/components/PetImage';
import { ChevronRight } from 'lucide-react';

export default function VisitantePetsPage() {
  const router = useRouter();
  const [pets, setPets] = useState<VisitantePet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    visitantesApi
      .listPets()
      .then(({ data }) => setPets(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="pt-card h-36 pt-skeleton" />
        ))}
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center text-3xl">
          👀
        </div>
        <div>
          <p className="font-semibold text-texto">Nenhum pet para acompanhar</p>
          <p className="text-sm text-texto-soft mt-1">
            Aceite convites de tutores para acompanhar pets aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {pets.map((pet) => (
        <button
          key={pet.id}
          onClick={() => router.push(`/visitante/pets/${pet.id}`)}
          className="pt-card hover:shadow-card-hover active:scale-[0.98] transition-all duration-200 text-left w-full group"
        >
          <div className="flex items-start gap-3">
            <PetImage
              fotoUrl={pet.fotoUrl}
              nome={pet.nome}
              especie={pet.especie}
              className="w-14 h-14 bg-surface-muted"
              fallbackClassName="bg-surface-muted"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-texto group-hover:text-primary transition-colors">
                {pet.nome}
              </h3>
              <p className="text-sm text-texto-soft">
                {especieLabel(pet.especie)}
                {pet.raca ? ` · ${pet.raca}` : ''}
              </p>
              {pet.relacao && (
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-surface-muted text-texto-soft mt-1">
                  {pet.relacao}
                </span>
              )}
            </div>
            <span className="text-texto-muted group-hover:text-primary transition-colors flex-shrink-0 mt-1"><ChevronRight size={16} /></span>
          </div>

          {/* Permission badges */}
          <div className="mt-3 pt-3 flex flex-wrap gap-1">
            {pet.permissoesVisualizacao.slice(0, 3).map((p) => (
              <span
                key={p}
                className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary"
              >
                {PERMISSION_LABELS[p] ?? p}
              </span>
            ))}
            {pet.permissoesVisualizacao.length > 3 && (
              <span className="text-xs text-texto-soft">
                +{pet.permissoesVisualizacao.length - 3}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

const PERMISSION_LABELS: Record<string, string> = {
  DADOS_BASICOS: 'Dados básicos',
  STATUS_SAUDE: 'Saúde',
  HISTORICO_VACINACAO: 'Vacinação',
  MEDICAMENTOS: 'Medicamentos',
  AGENDA_CONSULTAS: 'Agenda',
  PRESTADORES_PET: 'Prestadores',
  TIMELINE_ATUALIZACOES: 'Timeline',
};
