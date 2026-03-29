import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string | Date | null | undefined,
  fmt = 'dd/MM/yyyy',
): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '—';
    return format(d, fmt, { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatRelative(
  date: string | Date | null | undefined,
): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '—';
    return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
}

export function petAge(
  dataNascimento: string | Date | null | undefined,
): string {
  if (!dataNascimento) return 'Idade desconhecida';
  try {
    const d =
      typeof dataNascimento === 'string'
        ? parseISO(dataNascimento)
        : dataNascimento;
    if (!isValid(d)) return '—';
    const now = new Date();
    const years = now.getFullYear() - d.getFullYear();
    const months = now.getMonth() - d.getMonth();
    const totalMonths = years * 12 + months;

    if (totalMonths < 12) return `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'}`;
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    if (m === 0) return `${y} ${y === 1 ? 'ano' : 'anos'}`;
    return `${y} ${y === 1 ? 'ano' : 'anos'} e ${m} ${m === 1 ? 'mês' : 'meses'}`;
  } catch {
    return '—';
  }
}

export function especieLabel(especie: string): string {
  const map: Record<string, string> = {
    CACHORRO: 'Cachorro',
    GATO: 'Gato',
    CAVALO: 'Cavalo',
    PEIXE: 'Peixe',
    PASSARO: 'Pássaro',
    ROEDOR: 'Roedor',
    COELHO: 'Coelho',
    REPTIL: 'Réptil',
    FURAO: 'Furão',
    OUTRO: 'Outro',
  };
  return map[especie] || especie;
}

export function generoLabel(genero: string | null): string {
  if (!genero) return '—';
  const map: Record<string, string> = {
    MACHO: 'Macho',
    FEMEA: 'Fêmea',
  };
  return map[genero] || genero;
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    TUTOR_PRINCIPAL: 'Tutor principal',
    TUTOR_EMERGENCIA: 'Tutor emergência',
    ADESTRADOR: 'Adestrador',
    PASSEADOR: 'Passeador',
    VETERINARIO: 'Veterinário',
    FAMILIAR: 'Família',
    AMIGO: 'Amigo',
    OUTRO: 'Outro',
  };
  return map[role] || role;
}

export function eventoIcon(tipo: string): string {
  const map: Record<string, string> = {
    // Core pet events
    PET_CRIADO: '🐾',
    PET_ARQUIVADO: '📦',
    PET_REATIVADO: '✨',
    // Health
    VACINA_REGISTRADA: '💉',
    VACINA_ATUALIZADA: '💉',
    MEDICAMENTO_ADMINISTRADO: '💊',
    SINTOMA_REGISTRADO: '🩺',
    PLANO_SAUDE_ATUALIZADO: '🏥',
    // Tutor actions
    CONSULTA_REGISTRADA: '🏥',
    EXAME_ANEXADO: '📄',
    // Governance
    SOLICITACAO_CRIADA: '📋',
    SOLICITACAO_APROVADA: '✅',
    SOLICITACAO_RECUSADA: '❌',
    SOLICITACAO_EXPIRADA: '⏰',
    TUTOR_ADICIONADO: '👤',
    TUTOR_REMOVIDO: '👤',
    GUARDA_ALTERADA: '🔄',
    // Compromissos
    COMPROMISSO_CRIADO: '📅',
    // Prestador actions
    VISITA_REGISTRADA: '🐕',
    ALIMENTACAO_REGISTRADA: '🍽️',
    CHECK_IN_REGISTRADO: '🏨',
    CHECK_OUT_REGISTRADO: '🚪',
    SESSAO_REGISTRADA: '🎯',
    PROGRESSO_REGISTRADO: '⭐',
    // Visitante
    OBSERVACAO_REGISTRADA: '📝',
  };
  return map[tipo] || '📌';
}

export function solicitacaoStatusLabel(status: string): {
  label: string;
  color: string;
} {
  const map: Record<string, { label: string; color: string }> = {
    PENDENTE: { label: 'Pendente', color: 'amber' },
    APROVADA: { label: 'Aprovada', color: 'green' },
    RECUSADA: { label: 'Recusada', color: 'red' },
    EXPIRADA: { label: 'Expirada', color: 'stone' },
    SUGESTAO: { label: 'Sugestão', color: 'blue' },
  };
  return map[status] || { label: status, color: 'stone' };
}

export function getInitials(nome: string): string {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

// ─── F2: Aniversário e Marcos Temporais ──────────────────────────────────

export function daysUntilBirthday(dataNascimento: string | null | undefined): number | null {
  if (!dataNascimento) return null;
  try {
    const birth = typeof dataNascimento === 'string' ? parseISO(dataNascimento) : dataNascimento;
    if (!isValid(birth)) return null;
    const now = new Date();
    const thisYearBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (thisYearBirthday < now) {
      // Already passed this year, calculate for next year
      thisYearBirthday.setFullYear(now.getFullYear() + 1);
    }
    return Math.ceil((thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export function petAgeYears(dataNascimento: string | null | undefined): number | null {
  if (!dataNascimento) return null;
  try {
    const birth = typeof dataNascimento === 'string' ? parseISO(dataNascimento) : dataNascimento;
    if (!isValid(birth)) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  } catch {
    return null;
  }
}

export interface MitraMilestone {
  id: string;
  emoji: string;
  label: string;
  achieved: boolean;
  days: number;
}

export function mitraMilestones(criadoEm: string): MitraMilestone[] {
  const created = parseISO(criadoEm);
  if (!isValid(created)) return [];
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

  const defs = [
    { days: 7, emoji: '🌱', label: '1 semana no MITRA' },
    { days: 30, emoji: '🌿', label: '1 mês no MITRA' },
    { days: 100, emoji: '🌟', label: '100 dias no MITRA' },
    { days: 365, emoji: '🏆', label: '1 ano no MITRA' },
    { days: 730, emoji: '💎', label: '2 anos no MITRA' },
  ];

  return defs.map((d) => ({
    id: `milestone-${d.days}`,
    emoji: d.emoji,
    label: d.label,
    achieved: daysSinceCreation >= d.days,
    days: d.days,
  }));
}
