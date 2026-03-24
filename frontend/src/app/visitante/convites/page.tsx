'use client';

import { useEffect, useState } from 'react';
import { visitantesApi } from '@/lib/api';
import { ConvitePendente } from '@/types';
import { cn, especieLabel } from '@/lib/utils';
import { PetImage } from '@/components/PetImage';

export default function ConvitesPage() {
  const [convites, setConvites] = useState<ConvitePendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchConvites = () => {
    setLoading(true);
    visitantesApi
      .listConvites()
      .then(({ data }) => setConvites(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConvites();
  }, []);

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      await visitantesApi.acceptInvite(id);
      setConvites((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // Error handling silently
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await visitantesApi.rejectInvite(id);
      setConvites((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // Error handling silently
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="pt-card h-32 pt-skeleton" />
        ))}
      </div>
    );
  }

  if (convites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
        <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center text-3xl">
          ✉️
        </div>
        <div>
          <p className="font-semibold text-texto">Nenhum convite pendente</p>
          <p className="text-sm text-texto-soft mt-1">
            Quando um tutor convidar você para acompanhar um pet, o convite aparecerá aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-texto-soft">
        {convites.length} {convites.length === 1 ? 'convite pendente' : 'convites pendentes'}
      </p>

      {convites.map((convite) => (
        <div key={convite.id} className="pt-card">
          <div className="flex items-start gap-3">
            <PetImage
              fotoUrl={convite.pet.fotoUrl}
              nome={convite.pet.nome}
              especie={convite.pet.especie}
              className="w-14 h-14 bg-amber-50"
              fallbackClassName="bg-amber-50"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-texto">{convite.pet.nome}</h3>
              <p className="text-sm text-texto-soft">
                {especieLabel(convite.pet.especie)}
                {convite.pet.raca ? ` · ${convite.pet.raca}` : ''}
              </p>
              {convite.relacao && (
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-surface-muted text-texto-soft mt-1">
                  {convite.relacao}
                </span>
              )}
            </div>
          </div>

          {/* Permissões */}
          <div className="mt-3 pt-3">
            <p className="text-xs text-texto-soft mb-1.5">Permissões de visualização:</p>
            <div className="flex flex-wrap gap-1">
              {convite.permissoesVisualizacao.map((p) => (
                <span
                  key={p}
                  className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                >
                  {PERMISSION_LABELS[p] ?? p}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleAccept(convite.id)}
              disabled={actionLoading === convite.id}
              className="pt-btn flex-1 text-sm py-2"
            >
              {actionLoading === convite.id ? 'Processando...' : 'Aceitar'}
            </button>
            <button
              onClick={() => handleReject(convite.id)}
              disabled={actionLoading === convite.id}
              className="pt-btn-secondary flex-1 text-sm py-2"
            >
              Recusar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const PERMISSION_LABELS: Record<string, string> = {
  DADOS_BASICOS: 'Dados básicos',
  STATUS_SAUDE: 'Status de saúde',
  HISTORICO_VACINACAO: 'Vacinação',
  MEDICAMENTOS: 'Medicamentos',
  AGENDA_CONSULTAS: 'Agenda',
  PRESTADORES_PET: 'Prestadores',
  TIMELINE_ATUALIZACOES: 'Timeline',
};
