/**
 * Pet Personality Engine
 * Analisa eventos, espécie, idade e dados do pet para gerar
 * títulos de personalidade, frases dinâmicas e humor contextual.
 * Usado por F1 (Personalidade) e F3 (Humor/Stickers).
 */

import { differenceInDays, differenceInYears } from 'date-fns';
import { Pet, Vacina, Medicamento, Evento } from '@/types';

// ─── Archetypes ────────────────────────────────────────────────────────────

export type Archetype =
  | 'AVENTUREIRA'
  | 'ATLETA'
  | 'SOCIAL_BUTTERFLY'
  | 'SENHOR_SAUDE'
  | 'PREGUICOSO_REAL';

interface ArchetypeDef {
  id: Archetype;
  emoji: string;
  titles: Record<string, string[]>; // especie -> titles
  defaultTitles: string[];
  phrases: Record<string, string[]>;
  defaultPhrases: string[];
}

const ARCHETYPES: ArchetypeDef[] = [
  {
    id: 'AVENTUREIRA',
    emoji: '🏔️',
    titles: {
      CACHORRO: ['Aventureiro(a) Nato(a)', 'Desbravador(a)', 'Explorador(a) Oficial'],
      GATO: ['Caçador(a) Urbano(a)', 'Felino(a) Nômade', 'Explorador(a) Noturno(a)'],
      PEIXE: ['Navegador(a) dos Mares', 'Explorador(a) do Aquário'],
      CAVALO: ['Galopador(a) Livre', 'Espírito Selvagem'],
    },
    defaultTitles: ['Aventureiro(a)', 'Espírito Livre', 'Explorador(a)'],
    phrases: {
      CACHORRO: [
        'Sempre pronto(a) pra próxima aventura! 🐕',
        'O mundo é o quintal dele(a)!',
        'Cada passeio é uma expedição épica!',
      ],
      GATO: [
        'O território é vasto e precisa de patrulha 🐱',
        'Cada canto esconde um mistério para desvendar',
      ],
    },
    defaultPhrases: [
      'Sempre em busca da próxima aventura!',
      'O mundo é pequeno demais pra tanta energia!',
    ],
  },
  {
    id: 'ATLETA',
    emoji: '🏃',
    titles: {
      CACHORRO: ['Atleta de Elite', 'Corredor(a) Profissional', 'Maratonista'],
      GATO: ['Ninja Felino(a)', 'Acrobata', 'Parkour Master'],
      CAVALO: ['Campeão(ã) de Pista', 'Atleta Olímpico(a)'],
    },
    defaultTitles: ['Atleta de Elite', 'Esportista Nato(a)'],
    phrases: {
      CACHORRO: [
        'Energia que não acaba nunca! 💪',
        'Pronto(a) pro próximo treino!',
        'Bora correr! A pista tá chamando!',
      ],
      GATO: [
        'Pulos dignos de olimpíada! 🐱',
        'Agilidade de dar inveja!',
      ],
    },
    defaultPhrases: [
      'Energia pra dar e vender!',
      'Ninguém acompanha esse pique!',
    ],
  },
  {
    id: 'SOCIAL_BUTTERFLY',
    emoji: '🦋',
    titles: {
      CACHORRO: ['Social Butterfly 🦋', 'Amigão(ona)', 'Celebridade do Parque'],
      GATO: ['Influencer Felino(a)', 'Estrela do Bairro'],
      PEIXE: ['Rei/Rainha do Aquário', 'Showman Aquático'],
    },
    defaultTitles: ['Social Butterfly', 'Celebridade', 'Queridinho(a)'],
    phrases: {
      CACHORRO: [
        'Todo mundo é amigo(a)! 🐶',
        'O parque inteiro conhece!',
        'Rabo abanando 24h por dia!',
      ],
      GATO: [
        'Dignou-se a socializar. Sintam-se honrados. 😼',
        'Faz amigos... quando quer.',
      ],
    },
    defaultPhrases: [
      'O(A) mais popular da turma!',
      'Carisma que conquista qualquer um!',
    ],
  },
  {
    id: 'SENHOR_SAUDE',
    emoji: '💚',
    titles: {
      CACHORRO: ['Blindado(a) de Saúde', 'Senhor(a) Saúde', 'Imunidade de Ferro'],
      GATO: ['Gato(a) Imune', 'Saúde de Ferro Felina', 'Proteção Máxima'],
      PEIXE: ['Nadador(a) Saudável', 'Imunidade Aquática'],
    },
    defaultTitles: ['Senhor(a) Saúde', 'Blindado(a)', 'Proteção Total'],
    phrases: {
      CACHORRO: [
        'Vacinas em dia e prontinho(a) pro mundo! 🛡️',
        'Nenhum vírus passa por aqui!',
      ],
      GATO: [
        'Saúde impecável. Como tudo na vida dele(a). 😼',
        'Proteção em dia, obrigado(a).',
      ],
    },
    defaultPhrases: [
      'Saúde em dia, vida feliz!',
      'Blindado(a) contra tudo! 🛡️',
    ],
  },
  {
    id: 'PREGUICOSO_REAL',
    emoji: '👑',
    titles: {
      CACHORRO: ['Preguiçoso(a) Real 👑', 'Rei/Rainha do Sofá', 'Majestade do Descanso'],
      GATO: ['Sua Majestade Felina 👑', 'Imperador(a) da Soneca', 'Nobre Preguiçoso(a)'],
      PEIXE: ['Zen Master 🧘', 'Contemplador(a) Aquático(a)'],
      ROEDOR: ['Sonequinha Real 👑', 'Hamster da Realeza'],
    },
    defaultTitles: ['Preguiçoso(a) Real 👑', 'Majestade do Descanso'],
    phrases: {
      CACHORRO: [
        'Descansando depois de pensar em brincar 😴',
        'A cama é o trono e ninguém discute!',
        'Cochilo é coisa séria!',
      ],
      GATO: [
        'Dormindo 18h por dia. Produtividade máxima. 😼',
        'Acordou. Bocejou. Voltou a dormir.',
        'O sofá é o reino, e está tudo sob controle.',
      ],
      PEIXE: [
        'Flutuando em paz absoluta 🧘',
        'Zen level: máximo.',
      ],
    },
    defaultPhrases: [
      'Descansando como merece! 👑',
      'A vida é boa quando se é da realeza!',
    ],
  },
];

// ─── Personality Engine ────────────────────────────────────────────────────

interface PersonalityInput {
  pet: Pet;
  vacinas: Vacina[];
  medicamentos: Medicamento[];
  eventos: Evento[];
}

interface PersonalityResult {
  archetype: Archetype;
  emoji: string;
  title: string;
  phrase: string;
}

function pickRandom<T>(arr: T[]): T {
  // Use pet-stable seed based on day so it changes daily but stays consistent per session
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return arr[dayOfYear % arr.length];
}

function computeScores(input: PersonalityInput): Record<Archetype, number> {
  const scores: Record<Archetype, number> = {
    AVENTUREIRA: 0,
    ATLETA: 0,
    SOCIAL_BUTTERFLY: 0,
    SENHOR_SAUDE: 0,
    PREGUICOSO_REAL: 0,
  };

  const { pet, vacinas, medicamentos, eventos } = input;
  const now = new Date();

  // Age factor
  if (pet.dataNascimento) {
    const age = differenceInYears(now, new Date(pet.dataNascimento));
    if (age < 2) {
      scores.AVENTUREIRA += 3;
      scores.ATLETA += 2;
    } else if (age >= 7) {
      scores.PREGUICOSO_REAL += 3;
      scores.SENHOR_SAUDE += 1;
    }
  }

  // Event-based scores
  const walkEvents = eventos.filter(
    (e) => e.tipo === 'VISITA_REGISTRADA' || e.descricao?.toLowerCase().includes('passeio'),
  );
  const healthEvents = eventos.filter(
    (e) => e.tipo === 'VACINA_REGISTRADA' || e.tipo === 'CONSULTA_VETERINARIA',
  );
  const socialEvents = eventos.filter(
    (e) => e.tipo === 'TUTOR_ADICIONADO' || e.tipo === 'PERMISSAO_ATUALIZADA',
  );

  // Walks → Aventureira/Atleta
  if (walkEvents.length >= 10) {
    scores.ATLETA += 5;
    scores.AVENTUREIRA += 3;
  } else if (walkEvents.length >= 5) {
    scores.AVENTUREIRA += 4;
    scores.ATLETA += 2;
  } else if (walkEvents.length <= 1) {
    scores.PREGUICOSO_REAL += 3;
  }

  // Health events → Senhor Saúde
  if (healthEvents.length >= 5) {
    scores.SENHOR_SAUDE += 5;
  } else if (healthEvents.length >= 3) {
    scores.SENHOR_SAUDE += 3;
  }

  // Vaccines up to date → Senhor Saúde bonus
  const allVacsUpToDate = vacinas.every((v) => {
    if (!v.proximaDose) return true;
    return new Date(v.proximaDose) > now;
  });
  if (vacinas.length >= 2 && allVacsUpToDate) {
    scores.SENHOR_SAUDE += 4;
  }

  // Active medications → slight Senhor Saúde
  const medsAtivos = medicamentos.filter((m) => m.status === 'ATIVO');
  if (medsAtivos.length > 0) {
    scores.SENHOR_SAUDE += 2;
  }

  // Social events → Social Butterfly
  if (socialEvents.length >= 3) {
    scores.SOCIAL_BUTTERFLY += 5;
  } else if (socialEvents.length >= 1) {
    scores.SOCIAL_BUTTERFLY += 2;
  }

  // Many total events → Atleta/Aventureira
  if (eventos.length >= 15) {
    scores.ATLETA += 2;
    scores.AVENTUREIRA += 2;
  }

  // Few events → Preguiçoso
  if (eventos.length <= 3) {
    scores.PREGUICOSO_REAL += 4;
  }

  // Species modifiers
  if (pet.especie === 'GATO') {
    scores.PREGUICOSO_REAL += 2;
    scores.SOCIAL_BUTTERFLY -= 1;
  } else if (pet.especie === 'CACHORRO') {
    scores.SOCIAL_BUTTERFLY += 2;
    scores.AVENTUREIRA += 1;
  } else if (pet.especie === 'PEIXE') {
    scores.PREGUICOSO_REAL += 3;
    scores.AVENTUREIRA -= 2;
  } else if (pet.especie === 'CAVALO') {
    scores.ATLETA += 3;
    scores.AVENTUREIRA += 2;
  }

  return scores;
}

export function getPersonality(input: PersonalityInput): PersonalityResult {
  const scores = computeScores(input);

  // Find winning archetype
  let best: Archetype = 'PREGUICOSO_REAL';
  let bestScore = -Infinity;
  for (const [arch, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = arch as Archetype;
    }
  }

  const def = ARCHETYPES.find((a) => a.id === best)!;
  const especie = input.pet.especie;

  const titles = def.titles[especie] || def.defaultTitles;
  const phrases = def.phrases[especie] || def.defaultPhrases;

  return {
    archetype: best,
    emoji: def.emoji,
    title: pickRandom(titles),
    phrase: pickRandom(phrases),
  };
}

// ─── F3: Humor Contextual / Stickers ───────────────────────────────────────

export type HumorContext =
  | 'EMPTY_STATE'
  | 'POST_VACINA'
  | 'POST_MEDICAMENTO'
  | 'POST_PASSEIO'
  | 'INATIVIDADE'
  | 'ANIVERSARIO';

interface HumorResult {
  emoji: string;
  message: string;
}

const HUMOR_BY_ESPECIE: Record<string, Record<HumorContext, string[]>> = {
  CACHORRO: {
    EMPTY_STATE: [
      '{nome} está com saudade do app 🐶',
      '{nome} tá esperando novidades! 🐕',
      'Cadê as atualizações? {nome} quer saber!',
    ],
    POST_VACINA: [
      '{nome} está blindado(a)! 🛡️',
      'Vacina tomada! {nome} nem piscou! 💪',
      '{nome} saiu do vet como herói! 🦸',
    ],
    POST_MEDICAMENTO: [
      '{nome} tomou o remédio direitinho! 💊',
      'Medicamento registrado! {nome} aprova! ✅',
    ],
    POST_PASSEIO: [
      '{nome} voltou do passeio radiante! 🌟',
      'Mais um passeio épico! {nome} aprova! 🐕‍🦺',
    ],
    INATIVIDADE: [
      '{nome} está com saudade de você! 🥺',
      'Faz tempo que {nome} não aparece por aqui...',
      '{nome}: "Oi? Lembram de mim?" 🐶',
    ],
    ANIVERSARIO: [
      'Parabéns, {nome}! 🎂🐶',
      '{nome} está de aniversário! Festa! 🎉',
    ],
  },
  GATO: {
    EMPTY_STATE: [
      '{nome} aprovou o silêncio. Com indiferença. 😼',
      '{nome} olhou, julgou, e voltou a dormir.',
      'Sem novidades? {nome} nem se importa. 🐱',
    ],
    POST_VACINA: [
      '{nome} tolerou a vacina. Vocês que agradeçam. 😼',
      'Vacina aplicada. {nome} não está feliz, mas imune.',
      '{nome}: "Isso é tudo?" 💉😼',
    ],
    POST_MEDICAMENTO: [
      '{nome} tomou. Sem drama. Na verdade, com muito drama. 😼',
      'Medicamento administrado. {nome} planeja vingança.',
    ],
    POST_PASSEIO: [
      '{nome} permitiu ser levado(a). Uma vez. 😼',
      '{nome}: "Isso é um passeio? Humph."',
    ],
    INATIVIDADE: [
      '{nome} nem notou sua ausência. Mentira. 😼',
      '{nome} finge que não liga. Mas liga.',
    ],
    ANIVERSARIO: [
      '{nome} aceita parabéns. Apenas. 🎂😼',
      'Aniversário de {nome}! Ele(a) sabe que é especial.',
    ],
  },
  PEIXE: {
    EMPTY_STATE: [
      '{nome} está meditando... 🧘',
      'Bolhas de sabedoria de {nome} 🫧',
      '{nome} flutua em paz.',
    ],
    POST_VACINA: [
      '{nome} mantém a saúde aquática em dia! 🐟',
    ],
    POST_MEDICAMENTO: [
      '{nome} está sendo tratado(a) com carinho! 💧',
    ],
    POST_PASSEIO: [
      '{nome} deu mais uma volta no aquário! 🐟',
    ],
    INATIVIDADE: [
      '{nome} continua nadando... sem novidades. 🐟',
      'Bolha... bolha... {nome} espera atualizações 🫧',
    ],
    ANIVERSARIO: [
      'Parabéns, {nome}! 🎂🐟',
      '{nome} celebra mais um ano de bolhas! 🫧',
    ],
  },
};

const DEFAULT_HUMOR: Record<HumorContext, string[]> = {
  EMPTY_STATE: [
    '{nome} está esperando novidades! 🐾',
    'Que tal registrar algo para {nome}?',
  ],
  POST_VACINA: [
    '{nome} está protegido(a)! 🛡️',
    'Vacina registrada! {nome} agradece!',
  ],
  POST_MEDICAMENTO: [
    'Medicamento de {nome} registrado! 💊',
  ],
  POST_PASSEIO: [
    '{nome} adorou o passeio! 🌟',
  ],
  INATIVIDADE: [
    '{nome} sente sua falta! 🐾',
    'Faz tempo... {nome} quer novidades!',
  ],
  ANIVERSARIO: [
    'Parabéns, {nome}! 🎂🎉',
  ],
};

export function getHumor(
  petNome: string,
  especie: string,
  context: HumorContext,
): HumorResult {
  const especieHumor = HUMOR_BY_ESPECIE[especie];
  const messages = especieHumor?.[context] || DEFAULT_HUMOR[context];
  const message = pickRandom(messages).replace(/\{nome\}/g, petNome);

  const emojiMap: Record<HumorContext, string> = {
    EMPTY_STATE: '💤',
    POST_VACINA: '🛡️',
    POST_MEDICAMENTO: '💊',
    POST_PASSEIO: '🌟',
    INATIVIDADE: '🥺',
    ANIVERSARIO: '🎂',
  };

  return { emoji: emojiMap[context], message };
}

/**
 * Detecta inatividade: retorna true se o último evento foi há mais de N dias.
 */
export function isInactive(eventos: Evento[], thresholdDays = 7): boolean {
  if (eventos.length === 0) return true;
  const latest = eventos.reduce((a, b) =>
    new Date(a.criadoEm) > new Date(b.criadoEm) ? a : b,
  );
  return differenceInDays(new Date(), new Date(latest.criadoEm)) >= thresholdDays;
}
