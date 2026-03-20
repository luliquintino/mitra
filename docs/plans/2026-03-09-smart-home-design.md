# Smart Home — Pet Home Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transformar a home do pet (`/pets/[id]`) em uma tela inteligente que gera sugestoes proativas para tutores, briefing contextual para prestadores, e visao minima baseada em permissoes para visitantes.

**Architecture:** Um motor de regras (`smart-cards.ts`) analisa dados do pet (vacinas, medicamentos, sintomas, compromissos, guarda, eventos) e gera cards priorizados. A home da tutora renderiza esses cards ordenados por urgencia. A home do prestador gera briefing cards baseado no `tipoPrestador`. A home do visitante mantem logica de permissoes existente com visual limpo.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, mock-first com `tryReal()`

---

## Task 1: Criar Smart Cards Engine

**Files:**
- Create: `frontend/src/lib/smart-cards.ts`

### Step 1: Criar tipos e engine

```typescript
// frontend/src/lib/smart-cards.ts

import { differenceInDays } from 'date-fns';
import { Pet, Vacina, Medicamento, Evento, Compromisso, Solicitacao, PetUsuario } from '@/types';

export type SmartCardPriority = 'urgent' | 'warning' | 'reminder' | 'info' | 'suggestion';

export interface SmartCard {
  id: string;
  priority: SmartCardPriority;
  icon: string;
  title: string;
  description?: string;
  action?: { label: string; href?: string };
}

interface SmartCardInput {
  pet: Pet;
  vacinas: Vacina[];
  medicamentos: Medicamento[];
  sintomas: { id: string; descricao: string; dataFim?: string; intensidade?: number }[];
  eventos: Evento[];
  compromissos: Compromisso[];
  solicitacoes: Solicitacao[];
  tutores: PetUsuario[];
  guardas: { tutorId: string; dataInicio: string; dataFim?: string; ativa: boolean; observacoes?: string }[];
  planoSaude?: { operadora: string; dataExpiracao?: string } | null;
}

const PRIORITY_ORDER: Record<SmartCardPriority, number> = {
  urgent: 0, warning: 1, reminder: 2, info: 3, suggestion: 4,
};

export function generateTutorSmartCards(input: SmartCardInput): SmartCard[] {
  const cards: SmartCard[] = [];
  const now = new Date();

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
        action: { label: 'Ver vacinas', href: `/pets/${input.pet.id}/saude` },
      });
    }
  }

  // ── URGENT: Solicitacao pendente ──
  for (const s of input.solicitacoes) {
    if (s.status !== 'PENDENTE') continue;
    const expDiff = differenceInDays(new Date(s.expiradoEm), now);
    cards.push({
      id: `sol-${s.id}`,
      priority: 'urgent',
      icon: '🔴',
      title: `${s.solicitante.nome} solicitou ${s.tipo === 'ALTERACAO_GUARDA' ? 'alteração de guarda' : s.tipo.toLowerCase().replace(/_/g, ' ')}`,
      description: expDiff > 0 ? `Expira em ${expDiff} dia${expDiff > 1 ? 's' : ''}` : 'Expirando hoje!',
      action: { label: 'Responder', href: `/pets/${input.pet.id}/guarda` },
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
        action: { label: 'Ver vacinas', href: `/pets/${input.pet.id}/saude` },
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
        action: { label: 'Ver medicamentos', href: `/pets/${input.pet.id}/saude` },
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
      description: s.intensidade ? `Intensidade ${s.intensidade}/5` : undefined,
      action: { label: 'Ver saúde', href: `/pets/${input.pet.id}/saude` },
    });
  }

  // ── REMINDER: Medicamento ativo ──
  for (const m of input.medicamentos) {
    if (m.status !== 'ATIVO') continue;
    // Skip if already in "ending" cards
    if (m.dataFim) {
      const diff = differenceInDays(new Date(m.dataFim), now);
      if (diff >= 0 && diff <= 7) continue;
    }
    cards.push({
      id: `med-active-${m.id}`,
      priority: 'reminder',
      icon: '🟡',
      title: `${m.nome}: ${m.dosagem}`,
      description: m.frequencia,
      action: { label: 'Ver medicamentos', href: `/pets/${input.pet.id}/saude` },
    });
  }

  // ── REMINDER: Pet sem passeio recente ──
  const lastWalk = input.eventos.find(e =>
    e.tipo === 'VISITA_REGISTRADA' || e.tipo === 'PASSEIO'
  );
  if (lastWalk) {
    const walkDiff = differenceInDays(now, new Date(lastWalk.criadoEm));
    if (walkDiff >= 3) {
      cards.push({
        id: 'no-walk',
        priority: 'reminder',
        icon: '🟡',
        title: `${input.pet.nome} não passeia há ${walkDiff} dias`,
        action: { label: 'Agendar passeio', href: `/pets/${input.pet.id}/historico` },
      });
    }
  }

  // ── REMINDER: Plano de saude vencendo ──
  if (input.planoSaude?.dataExpiracao) {
    const diff = differenceInDays(new Date(input.planoSaude.dataExpiracao), now);
    if (diff >= 0 && diff <= 30) {
      cards.push({
        id: 'plano-expiring',
        priority: 'reminder',
        icon: '🟡',
        title: `Plano ${input.planoSaude.operadora} vence em ${diff} dias`,
        action: { label: 'Ver plano', href: `/pets/${input.pet.id}/saude` },
      });
    }
  }

  // ── INFO: Guarda atual ──
  const guardaAtiva = input.guardas.find(g => g.ativa);
  if (guardaAtiva) {
    const tutor = input.tutores.find(t => t.usuarioId === guardaAtiva.tutorId);
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

  // ── INFO: Atividade recente (top 3 eventos) ──
  for (const ev of input.eventos.slice(0, 3)) {
    cards.push({
      id: `ev-${ev.id}`,
      priority: 'info',
      icon: '🔵',
      title: ev.titulo,
      description: ev.descricao,
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
  const activeCompromissos = input.compromissos.filter(c => c.ativo);
  if (activeCompromissos.length === 0) {
    cards.push({
      id: 'suggest-prestador',
      priority: 'suggestion',
      icon: '💡',
      title: `Adicione um passeador ou creche para ${input.pet.nome}`,
    });
  }

  // Sort by priority
  cards.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return cards;
}

// ── Prestador Briefing ──

export interface BriefingCard {
  id: string;
  icon: string;
  label: string;
  value: string;
  status: 'ok' | 'warning' | 'info';
}

export function generatePrestadorBriefing(
  tipoPrestador: string | undefined,
  pet: Pet,
  vacinas: Vacina[],
  medicamentos: Medicamento[],
  sintomas: { id: string; descricao: string; dataFim?: string; intensidade?: number }[],
  tutores: PetUsuario[],
): BriefingCard[] {
  const cards: BriefingCard[] = [];
  const now = new Date();

  // Vacinas status — relevant for creche/hotel/vet/all
  const allUpToDate = vacinas.every(v => {
    if (!v.proximaDose) return true;
    return new Date(v.proximaDose) > now;
  });
  cards.push({
    id: 'briefing-vacinas',
    icon: allUpToDate ? '✅' : '❌',
    label: 'Vacinas',
    value: vacinas.length === 0
      ? 'Nenhuma registrada'
      : allUpToDate
        ? `Todas em dia (${vacinas.length})`
        : 'Atenção: vacina vencida',
    status: vacinas.length === 0 ? 'warning' : allUpToDate ? 'ok' : 'warning',
  });

  // Medicamentos ativos — relevant for creche/hotel/vet/passeador
  const medsAtivos = medicamentos.filter(m => m.status === 'ATIVO');
  if (medsAtivos.length > 0) {
    for (const m of medsAtivos) {
      cards.push({
        id: `briefing-med-${m.id}`,
        icon: '⚠️',
        label: `Medicamento ativo`,
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

  // Sintomas ativos — relevant for all
  const sintomasAtivos = sintomas.filter(s => !s.dataFim);
  for (const s of sintomasAtivos) {
    cards.push({
      id: `briefing-sint-${s.id}`,
      icon: '⚠️',
      label: 'Sintoma ativo',
      value: `${s.descricao}${s.intensidade ? ` (intensidade ${s.intensidade}/5)` : ''}`,
      status: 'warning',
    });
  }

  // Contato do tutor principal — relevant for all
  const tutorPrincipal = tutores.find(t => t.role === 'TUTOR_PRINCIPAL');
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
```

### Step 2: Verificar que o arquivo compila

Run: `cd /Users/luizaquintino/Desktop/Mitra/frontend && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to smart-cards.ts

---

## Task 2: Reescrever Home da Tutora

**Files:**
- Modify: `frontend/src/app/pets/[id]/page.tsx` (full rewrite)

### Step 1: Reescrever a pagina

A pagina deve:
1. Buscar TODOS os dados necessarios: pet, tutores, vacinas, medicamentos, sintomas, eventos, compromissos, solicitacoes, guardas, plano de saude
2. Passar para `generateTutorSmartCards()`
3. Renderizar cards priorizados com visual distinto por prioridade
4. Timeline resumida (3-5 eventos) no final
5. Manter invite modal existente

**Dados a buscar (adicionar ao Promise.all existente):**
- `healthApi.sintomas(petId)` — ja existe no mock
- `compromissosApi.list(petId)` — ja existe no mock
- `custodyApi.solicitacoes(petId)` — ja existe no mock
- `custodyApi.guardas(petId)` — ja existe no mock
- `healthApi.planoSaude(petId)` — ja existe no mock

**Layout da pagina:**
```
[Tagline editorial] — manter (raca + idade)
[Smart Cards]       — novo: cards priorizados do engine
[Divider editorial] — "Atividade recente"
[Timeline]          — 5 eventos mais recentes (cards editoriais)
[Invite Modal]      — manter existente
```

**Visual dos Smart Cards por prioridade:**
- `urgent`: bg vermelho claro, borda vermelha, texto vermelho escuro
- `warning`: bg amber claro, borda amber, texto amber escuro
- `reminder`: bg azul claro, borda azul, texto azul escuro
- `info`: bg stone-50, borda stone-100, texto stone
- `suggestion`: bg mitra-50, borda mitra-100, texto mitra com botao

Cada card mostra: icone + titulo + descricao + acao (se existir, como link/botao)

**Imports necessarios:**
```typescript
import { generateTutorSmartCards, SmartCard } from '@/lib/smart-cards';
import { healthApi, custodyApi, compromissosApi, ... } from '@/lib/api';
```

### Step 2: Verificar build

Run: `cd /Users/luizaquintino/Desktop/Mitra/frontend && npx next build 2>&1 | tail -5`
Expected: Build passes, zero errors

### Step 3: Verificar no browser

1. Login como Ana → `/pets/pet-luna`
2. Verificar smart cards aparecem ordenados por prioridade
3. Cards urgentes (solicitacao pendente) no topo com visual vermelho
4. Cards warning (vacina vencendo) com visual amber
5. Cards reminder (medicamento ativo) com visual azul
6. Cards info (guarda, atividade) com visual neutro
7. Cards suggestion (convidar) com visual mitra
8. Timeline resumida abaixo
9. Zero erros no console

---

## Task 3: Reescrever Home do Prestador

**Files:**
- Modify: `frontend/src/app/prestador/pets/[id]/page.tsx`

### Step 1: Adicionar briefing ao topo

A pagina deve:
1. Buscar dados extras: vacinas, medicamentos, sintomas, tutores
2. Gerar briefing via `generatePrestadorBriefing()`
3. Renderizar briefing cards no topo (antes das acoes)
4. Manter acoes especificas por `tipoPrestador`
5. Manter modal de registro e registros recentes

**Layout:**
```
[Briefing Header]    — "Briefing de {pet.nome}"
[Briefing Cards]     — checklist visual (OK/warning)
[Divider]            — "Minhas ações"
[Acoes por tipo]     — manter existente (grid 3 colunas)
[Registros recentes] — manter existente
[Registro Modal]     — manter existente
```

**Visual dos Briefing Cards:**
- `ok`: bg sage-50, icone verde ✅
- `warning`: bg amber-50, icone amber ⚠️
- `info`: bg stone-50, icone azul 📱

**Dados extras a buscar:**
- `healthApi.medicamentos(petId)` — para saber meds ativos
- `healthApi.sintomas(petId)` — para saber sintomas
- `governanceApi.tutores(petId)` — para contato do tutor

### Step 2: Verificar build e browser

1. Build: `npx next build` passa sem erros
2. Login como Joao (adestrador) → `/prestador/pets/pet-luna`
3. Briefing cards no topo: vacinas OK ✅, Bravecto ativo ⚠️, sintoma coceira ⚠️, tutor Ana 📱
4. Acoes de adestrador abaixo (sessao, progresso, exercicio)
5. Registros recentes mantidos
6. Zero erros no console

---

## Task 4: Ajustar Home do Visitante

**Files:**
- Modify: `frontend/src/app/visitante/pets/[id]/page.tsx`

### Step 1: Limpar visual

Mudancas minimas — a home do visitante ja funciona bem com logica de permissoes. Ajustes:
1. Remover visual redundante
2. Garantir que secoes bloqueadas mostram icone de cadeado limpo
3. Manter logica de `permissoesVisualizacao` intacta
4. Visual consistente com as outras homes (rounded-2xl, border-stone-100)

### Step 2: Verificar browser

1. Login como Beatriz → `/visitante/pets/pet-mochi`
2. "Quem cuida" visivel com Ana
3. Secoes permitidas aparecem (DADOS_BASICOS, STATUS_SAUDE, HISTORICO_VACINACAO, TIMELINE)
4. Secoes bloqueadas mostram cadeado (MEDICAMENTOS, AGENDA_CONSULTAS, PRESTADORES_PET)
5. Formulario de observacao funciona
6. Zero erros

---

## Task 5: Verificacao Final

### Step 1: Build completo
Run: `cd /Users/luizaquintino/Desktop/Mitra/frontend && npx next build`
Expected: Zero errors, all routes compile

### Step 2: Verificacao por perfil

**Tutora (Ana):**
- [ ] Smart cards priorizados no topo
- [ ] Cards urgentes com visual vermelho
- [ ] Cards warning com visual amber
- [ ] Acoes clicaveis (links para saude, guarda)
- [ ] Timeline resumida (5 eventos)
- [ ] Invite modal funciona

**Prestador (Joao - Adestrador):**
- [ ] Briefing cards no topo
- [ ] Vacinas OK, medicamento ativo, sintoma, tutor
- [ ] Acoes de adestrador (sessao, progresso)
- [ ] Modal de registro funciona
- [ ] Registros recentes aparecem

**Visitante (Beatriz):**
- [ ] Secoes baseadas em permissao
- [ ] Visual limpo e consistente
- [ ] Observacao funciona

---

## Arquivos Modificados/Criados

| Arquivo | Acao | Task |
|---------|------|------|
| `frontend/src/lib/smart-cards.ts` | **CRIAR** — Motor de regras | 1 |
| `frontend/src/app/pets/[id]/page.tsx` | **REESCREVER** — Tutor smart home | 2 |
| `frontend/src/app/prestador/pets/[id]/page.tsx` | **MODIFICAR** — Adicionar briefing | 3 |
| `frontend/src/app/visitante/pets/[id]/page.tsx` | **AJUSTAR** — Visual limpo | 4 |

## APIs Existentes a Reusar

| API | Metodo | Dados |
|-----|--------|-------|
| `healthApi` | `vacinas(petId)` | Lista de vacinas com proximaDose |
| `healthApi` | `medicamentos(petId)` | Lista com status ATIVO/CONCLUIDO |
| `healthApi` | `sintomas(petId)` | Sintomas com dataFim (null = ativo) |
| `healthApi` | `planoSaude(petId)` | Plano com dataExpiracao |
| `custodyApi` | `guardas(petId)` | Guardas com ativa: boolean |
| `custodyApi` | `solicitacoes(petId)` | Solicitacoes PENDENTE/APROVADA |
| `compromissosApi` | `list(petId)` | Compromissos com ativo: boolean |
| `eventsApi` | `historico(petId)` | Timeline de eventos |
| `governanceApi` | `tutores(petId)` | Lista de tutores/prestadores |

## Utils Existentes a Reusar

| Funcao | Arquivo | Uso |
|--------|---------|-----|
| `petAge()` | `utils.ts` | Tagline — idade |
| `especieLabel()` | `utils.ts` | Tagline — especie |
| `eventoIcon()` | `utils.ts` | Timeline — icone |
| `formatRelative()` | `utils.ts` | Timeline — "ha 3 dias" |
| `cn()` | `utils.ts` | Merge classnames |
