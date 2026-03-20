/**
 * Smart Cards Engine
 * Motor de regras que analisa dados do pet e gera cards priorizados.
 * Usado pela home da tutora e briefing do prestador.
 */

import { differenceInDays } from 'date-fns';
import {
  Pet,
  Vacina,
  Medicamento,
  Evento,
  Compromisso,
  Solicitacao,
  PetUsuario,
} from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

export type SmartCardPriority =
  | 'urgent'
  | 'warning'
  | 'reminder'
  | 'info'
  | 'suggestion';

export interface SmartCard {
  id: string;
  priority: SmartCardPriority;
  icon: string;
  title: string;
  description?: string;
  action?: { label: string; href?: string };
}

export interface BriefingCard {
  id: string;
  icon: string;
  label: string;
  value: string;
  status: 'ok' | 'warning' | 'info';
}

// ─── Tutor Smart Cards ──────────────────────────────────────────────────────

interface SmartCardInput {
  pet: Pet;
  vacinas: Vacina[];
  medicamentos: Medicamento[];
  sintomas: {
    id: string;
    descricao: string;
    dataFim?: string;
    intensidade?: number;
  }[];
  eventos: Evento[];
  compromissos: Compromisso[];
  solicitacoes: Solicitacao[];
  tutores: PetUsuario[];
  guardas: {
    tutorId: string;
    dataInicio: string;
    dataFim?: string;
    ativa: boolean;
    observacoes?: string;
  }[];
  planoSaude?: {
    operadora: string;
    dataExpiracao?: string;
  } | null;
}

const PRIORITY_ORDER: Record<SmartCardPriority, number> = {
  urgent: 0,
  warning: 1,
  reminder: 2,
  info: 3,
  suggestion: 4,
};

export function generateTutorSmartCards(input: SmartCardInput): SmartCard[] {
  const cards: SmartCard[] = [];
  const now = new Date();
  const petId = input.pet.id;

  // ── URGENT: Vacina vencida ──
  for (const v of input.vacinas) {
    if (!v.proximaDose) continue;
    const diff = differenceInDays(new Date(v.proximaDose), now);
    if (diff < 0) {
      cards.push({
        id: `vac-overdue-${v.id}`,
        priority: 'urgent',
        icon: '🔴',
        title: `Vacina ${v.nome} está vencida`,
        description: `Vencida há ${Math.abs(diff)} dias. Agende o reforço.`,
        action: { label: 'Ver vacinas', href: `/pets/${petId}/saude` },
      });
    }
  }

  // ── URGENT: Solicitação pendente ──
  for (const s of input.solicitacoes) {
    if (s.status !== 'PENDENTE') continue;
    const expDiff = differenceInDays(new Date(s.expiradoEm), now);
    const tipoLabel =
      s.tipo === 'ALTERACAO_GUARDA'
        ? 'alteração de guarda'
        : s.tipo.toLowerCase().replace(/_/g, ' ');
    cards.push({
      id: `sol-${s.id}`,
      priority: 'urgent',
      icon: '🔴',
      title: `${s.solicitante.nome} solicitou ${tipoLabel}`,
      description:
        expDiff > 0
          ? `Expira em ${expDiff} dia${expDiff > 1 ? 's' : ''}`
          : 'Expirando hoje!',
      action: { label: 'Responder', href: `/pets/${petId}/guarda` },
    });
  }

  // ── WARNING: Vacina vencendo em 30 dias ──
  for (const v of input.vacinas) {
    if (!v.proximaDose) continue;
    const diff = differenceInDays(new Date(v.proximaDose), now);
    if (diff >= 0 && diff <= 30) {
      cards.push({
        id: `vac-soon-${v.id}`,
        priority: 'warning',
        icon: '🟠',
        title: `Vacina ${v.nome} vence em ${diff} dias`,
        description: 'Agende o reforço com antecedência.',
        action: { label: 'Ver vacinas', href: `/pets/${petId}/saude` },
      });
    }
  }

  // ── WARNING: Medicamento acabando ──
  for (const m of input.medicamentos) {
    if (m.status !== 'ATIVO' || !m.dataFim) continue;
    const diff = differenceInDays(new Date(m.dataFim), now);
    if (diff >= 0 && diff <= 7) {
      cards.push({
        id: `med-ending-${m.id}`,
        priority: 'warning',
        icon: '🟠',
        title: `${m.nome}: tratamento termina em ${diff} dias`,
        description: `${m.dosagem} — ${m.frequencia}`,
        action: {
          label: 'Ver medicamentos',
          href: `/pets/${petId}/saude`,
        },
      });
    }
  }

  // ── WARNING: Sintoma ativo ──
  for (const s of input.sintomas) {
    if (s.dataFim) continue;
    cards.push({
      id: `sint-${s.id}`,
      priority: 'warning',
      icon: '🟠',
      title: `Sintoma ativo: ${s.descricao}`,
      description: s.intensidade
        ? `Intensidade ${s.intensidade}/5`
        : undefined,
      action: { label: 'Ver saúde', href: `/pets/${petId}/saude` },
    });
  }

  // ── REMINDER: Medicamento ativo (não acabando) ──
  for (const m of input.medicamentos) {
    if (m.status !== 'ATIVO') continue;
    if (m.dataFim) {
      const diff = differenceInDays(new Date(m.dataFim), now);
      if (diff >= 0 && diff <= 7) continue; // já coberto em warning
    }
    cards.push({
      id: `med-active-${m.id}`,
      priority: 'reminder',
      icon: '🟡',
      title: `${m.nome}: ${m.dosagem}`,
      description: m.frequencia,
      action: {
        label: 'Ver medicamentos',
        href: `/pets/${petId}/saude`,
      },
    });
  }

  // ── REMINDER: Pet sem passeio recente ──
  const lastWalk = input.eventos.find(
    (e) => e.tipo === 'VISITA_REGISTRADA',
  );
  if (lastWalk) {
    const walkDiff = differenceInDays(now, new Date(lastWalk.criadoEm));
    if (walkDiff >= 3) {
      cards.push({
        id: 'no-walk',
        priority: 'reminder',
        icon: '🟡',
        title: `${input.pet.nome} não passeia há ${walkDiff} dias`,
        action: {
          label: 'Ver histórico',
          href: `/pets/${petId}/historico`,
        },
      });
    }
  }

  // ── REMINDER: Plano de saúde vencendo ──
  if (input.planoSaude?.dataExpiracao) {
    const diff = differenceInDays(
      new Date(input.planoSaude.dataExpiracao),
      now,
    );
    if (diff >= 0 && diff <= 30) {
      cards.push({
        id: 'plano-expiring',
        priority: 'reminder',
        icon: '🟡',
        title: `Plano ${input.planoSaude.operadora} vence em ${diff} dias`,
        action: { label: 'Ver plano', href: `/pets/${petId}/saude` },
      });
    }
  }

  // ── INFO: Guarda atual ──
  const guardaAtiva = input.guardas.find((g) => g.ativa);
  if (guardaAtiva) {
    const tutor = input.tutores.find(
      (t) => t.usuarioId === guardaAtiva.tutorId,
    );
    cards.push({
      id: 'guarda-atual',
      priority: 'info',
      icon: '🔵',
      title: `Guarda com ${tutor?.usuario?.nome || 'tutor'}`,
      description: guardaAtiva.dataFim
        ? `Até ${new Date(guardaAtiva.dataFim).toLocaleDateString('pt-BR')}`
        : undefined,
    });
  }

  // ── SUGGESTION: Poucos tutores ──
  if (input.tutores.length < 2) {
    cards.push({
      id: 'suggest-invite',
      priority: 'suggestion',
      icon: '💡',
      title: `Convide alguém para acompanhar ${input.pet.nome}`,
    });
  }

  // ── SUGGESTION: Sem compromissos ativos ──
  const activeCompromissos = input.compromissos.filter((c) => c.ativo);
  if (activeCompromissos.length === 0) {
    cards.push({
      id: 'suggest-prestador',
      priority: 'suggestion',
      icon: '💡',
      title: `Adicione um passeador ou creche para ${input.pet.nome}`,
    });
  }

  // Sort by priority
  cards.sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );

  return cards;
}

// ─── Prestador Briefing ─────────────────────────────────────────────────────

export function generatePrestadorBriefing(
  pet: Pet,
  vacinas: Vacina[],
  medicamentos: Medicamento[],
  sintomas: {
    id: string;
    descricao: string;
    dataFim?: string;
    intensidade?: number;
  }[],
  tutores: PetUsuario[],
): BriefingCard[] {
  const cards: BriefingCard[] = [];
  const now = new Date();

  // Vacinas status
  const allUpToDate = vacinas.every((v) => {
    if (!v.proximaDose) return true;
    return new Date(v.proximaDose) > now;
  });
  cards.push({
    id: 'briefing-vacinas',
    icon: allUpToDate ? '✅' : '❌',
    label: 'Vacinas',
    value:
      vacinas.length === 0
        ? 'Nenhuma registrada'
        : allUpToDate
          ? `Todas em dia (${vacinas.length})`
          : 'Atenção: vacina vencida',
    status:
      vacinas.length === 0 ? 'warning' : allUpToDate ? 'ok' : 'warning',
  });

  // Medicamentos ativos
  const medsAtivos = medicamentos.filter((m) => m.status === 'ATIVO');
  if (medsAtivos.length > 0) {
    for (const m of medsAtivos) {
      cards.push({
        id: `briefing-med-${m.id}`,
        icon: '⚠️',
        label: 'Medicamento ativo',
        value: `${m.nome} — ${m.dosagem} (${m.frequencia})`,
        status: 'warning',
      });
    }
  } else {
    cards.push({
      id: 'briefing-meds',
      icon: '✅',
      label: 'Medicamentos',
      value: 'Nenhum ativo',
      status: 'ok',
    });
  }

  // Sintomas ativos
  const sintomasAtivos = sintomas.filter((s) => !s.dataFim);
  for (const s of sintomasAtivos) {
    cards.push({
      id: `briefing-sint-${s.id}`,
      icon: '⚠️',
      label: 'Sintoma ativo',
      value: `${s.descricao}${s.intensidade ? ` (intensidade ${s.intensidade}/5)` : ''}`,
      status: 'warning',
    });
  }

  // Contato do tutor principal
  const tutorPrincipal = tutores.find(
    (t) => t.role === 'TUTOR_PRINCIPAL',
  );
  if (tutorPrincipal) {
    cards.push({
      id: 'briefing-tutor',
      icon: '📱',
      label: 'Tutor',
      value: tutorPrincipal.usuario.nome,
      status: 'info',
    });
  }

  return cards;
}
