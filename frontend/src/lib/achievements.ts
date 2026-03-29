/**
 * Achievements / Conquistas Engine (F7)
 * 12+ conquistas em 4 categorias: Saúde, Cuidado, Comunidade, Registro.
 * Cada badge tem check function + progress/total.
 */

import { Pet, Vacina, Medicamento, Evento, PetUsuario, MuralPost } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AchievementCategory = 'SAUDE' | 'CUIDADO' | 'COMUNIDADE' | 'REGISTRO';

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  category: AchievementCategory;
  earned: boolean;
  progress: number;
  total: number;
}

interface AchievementInput {
  pet: Pet;
  vacinas: Vacina[];
  medicamentos: Medicamento[];
  eventos: Evento[];
  tutores: PetUsuario[];
  muralPosts: MuralPost[];
}

// ─── Badge Definitions ──────────────────────────────────────────────────────

interface BadgeDef {
  id: string;
  emoji: string;
  title: string;
  description: string;
  category: AchievementCategory;
  check: (input: AchievementInput) => { earned: boolean; progress: number; total: number };
}

const BADGE_DEFS: BadgeDef[] = [
  // ─── Saúde 💉 ──
  {
    id: 'first-vaccine',
    emoji: '💉',
    title: 'Primeira vacina',
    description: 'Registrou a primeira vacina',
    category: 'SAUDE',
    check: ({ vacinas }) => ({ earned: vacinas.length >= 1, progress: Math.min(vacinas.length, 1), total: 1 }),
  },
  {
    id: 'vaccine-champion',
    emoji: '🛡️',
    title: 'Campeão de vacinas',
    description: '5 vacinas registradas',
    category: 'SAUDE',
    check: ({ vacinas }) => ({ earned: vacinas.length >= 5, progress: Math.min(vacinas.length, 5), total: 5 }),
  },
  {
    id: 'health-warrior',
    emoji: '⚔️',
    title: 'Guerreiro da saúde',
    description: 'Primeiro medicamento registrado',
    category: 'SAUDE',
    check: ({ medicamentos }) => ({ earned: medicamentos.length >= 1, progress: Math.min(medicamentos.length, 1), total: 1 }),
  },

  // ─── Cuidado 🐾 ──
  {
    id: 'first-walk',
    emoji: '🐕',
    title: 'Primeiro passeio',
    description: 'Registrou o primeiro passeio',
    category: 'CUIDADO',
    check: ({ eventos }) => {
      const walks = eventos.filter((e) => e.tipo === 'VISITA_REGISTRADA');
      return { earned: walks.length >= 1, progress: Math.min(walks.length, 1), total: 1 };
    },
  },
  {
    id: 'walk-master',
    emoji: '🏃',
    title: 'Mestre dos passeios',
    description: '10 passeios registrados',
    category: 'CUIDADO',
    check: ({ eventos }) => {
      const walks = eventos.filter((e) => e.tipo === 'VISITA_REGISTRADA');
      return { earned: walks.length >= 10, progress: Math.min(walks.length, 10), total: 10 };
    },
  },
  {
    id: 'event-streak',
    emoji: '🔥',
    title: 'Em chamas',
    description: '20 eventos registrados',
    category: 'CUIDADO',
    check: ({ eventos }) => ({ earned: eventos.length >= 20, progress: Math.min(eventos.length, 20), total: 20 }),
  },

  // ─── Comunidade 👨‍👩‍👧 ──
  {
    id: 'first-friend',
    emoji: '🤝',
    title: 'Primeiro amigo',
    description: '2 pessoas na rede de cuidado',
    category: 'COMUNIDADE',
    check: ({ tutores }) => ({ earned: tutores.length >= 2, progress: Math.min(tutores.length, 2), total: 2 }),
  },
  {
    id: 'full-team',
    emoji: '👨‍👩‍👧‍👦',
    title: 'Rede completa',
    description: '3+ pessoas na rede de cuidado',
    category: 'COMUNIDADE',
    check: ({ tutores }) => ({ earned: tutores.length >= 3, progress: Math.min(tutores.length, 3), total: 3 }),
  },
  {
    id: 'social-pet',
    emoji: '🦋',
    title: 'Pet social',
    description: '5+ pessoas na rede de cuidado',
    category: 'COMUNIDADE',
    check: ({ tutores }) => ({ earned: tutores.length >= 5, progress: Math.min(tutores.length, 5), total: 5 }),
  },

  // ─── Registro 📸 ──
  {
    id: 'first-post',
    emoji: '📸',
    title: 'Primeiro post',
    description: 'Publicou no mural',
    category: 'REGISTRO',
    check: ({ muralPosts }) => {
      const userPosts = muralPosts.filter((p) => p.tipo !== 'AUTO_EVENT');
      return { earned: userPosts.length >= 1, progress: Math.min(userPosts.length, 1), total: 1 };
    },
  },
  {
    id: 'photo-lover',
    emoji: '🖼️',
    title: 'Fotógrafo oficial',
    description: '10 fotos no mural',
    category: 'REGISTRO',
    check: ({ muralPosts }) => {
      const totalPhotos = muralPosts.reduce((acc, p) => acc + (p.fotos?.length || 0), 0);
      return { earned: totalPhotos >= 10, progress: Math.min(totalPhotos, 10), total: 10 };
    },
  },
  {
    id: 'mitra-veteran',
    emoji: '🏆',
    title: 'Veterano MITRA',
    description: '100 dias no MITRA',
    category: 'REGISTRO',
    check: ({ pet }) => {
      const days = Math.floor((Date.now() - new Date(pet.criadoEm).getTime()) / (1000 * 60 * 60 * 24));
      return { earned: days >= 100, progress: Math.min(days, 100), total: 100 };
    },
  },
];

// ─── Engine ─────────────────────────────────────────────────────────────────

export function computeAchievements(input: AchievementInput): Achievement[] {
  return BADGE_DEFS.map((def) => {
    const result = def.check(input);
    return {
      id: def.id,
      emoji: def.emoji,
      title: def.title,
      description: def.description,
      category: def.category,
      earned: result.earned,
      progress: result.progress,
      total: result.total,
    };
  });
}

export const CATEGORY_LABELS: Record<AchievementCategory, { emoji: string; label: string }> = {
  SAUDE: { emoji: '💉', label: 'Saúde' },
  CUIDADO: { emoji: '🐾', label: 'Cuidado' },
  COMUNIDADE: { emoji: '👨‍👩‍👧', label: 'Comunidade' },
  REGISTRO: { emoji: '📸', label: 'Registro' },
};
