'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { prestadoresApi } from '@/lib/api';
import { PetImage } from '@/components/PetImage';
import { especieLabel, petAge, formatDate } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export default function PrestadorPetsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPets = async () => {
      try {
        const { data } = await prestadoresApi.listPets();
        setPets((data as any) || []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || 'Erro ao carregar pets.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPets();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="pt-card h-20 pt-skeleton" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-card bg-erro-light p-6 text-center">
        <p className="text-red-800 font-medium">{error}</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="pt-card text-center py-12">
        <p className="text-4xl mb-4">🐾</p>
        <p className="text-lg font-semibold text-texto mb-2">Nenhum pet atribuído ainda</p>
        <p className="text-sm text-texto-soft">Quando tutores lhe convidarem para atender seus pets, eles aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="mb-4">
        <p className="text-sm text-texto-soft">
          Você está atendendo <span className="font-semibold text-texto">{pets.length}</span> pet{pets.length !== 1 ? 's' : ''}
        </p>
      </div>

      {pets.map((pet) => (
        <Link
          key={pet.id}
          href={`/prestador/pets/${pet.id}`}
          className="pt-card hover:bg-primary/5 hover:shadow-card-hover active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <PetImage
              fotoUrl={pet.fotoUrl}
              nome={pet.nome}
              especie={pet.especie}
              className="w-16 h-16 flex-shrink-0"
              fallbackClassName="bg-surface-muted"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-texto truncate">
                  {pet.nome}
                </h3>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm text-texto-soft">
                  {especieLabel(pet.especie)}
                  {pet.raca ? ` · ${pet.raca}` : ''}
                </p>
                {pet.dataNascimento && (
                  <p className="text-xs text-texto-soft">
                    {petAge(pet.dataNascimento)} · {formatDate(pet.dataNascimento)}
                  </p>
                )}
                {pet.permissoes && pet.permissoes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pet.permissoes.includes('REGISTRAR_SERVICO') && (
                      <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                        Serviços
                      </span>
                    )}
                    {pet.permissoes.includes('REGISTRAR_VACINA') && (
                      <span className="inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                        Vacinações
                      </span>
                    )}
                    {pet.permissoes.includes('EDITAR_SAUDE') && (
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        Saúde completa
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <span className="text-texto-muted flex-shrink-0"><ChevronRight size={16} /></span>
          </div>
        </Link>
      ))}
    </div>
  );
}
