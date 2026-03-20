# Pet Dashboard Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the pet page from a 5-tab layout into a 3-tab dashboard (Dashboard | Agenda | Perfil) with bottom sheet detail panels.

**Architecture:** Replace the current tab-per-domain navigation with a single Dashboard tab that shows summary cards. Each card opens a BottomSheet with full detail + forms. New Agenda tab adds a custom calendar. Perfil absorbs Guarda content. All existing API integrations are reused — no backend changes.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, mock-first APIs

---

## Task 1: Create BottomSheet Component

**Files:**
- Create: `frontend/src/components/BottomSheet.tsx`

**What it does:** Reusable bottom sheet that slides up from bottom on mobile (~85vh) and shows as centered modal on desktop (max-w-xl). Used by Dashboard cards and Agenda forms.

**Step 1: Create the component**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Sheet — mobile: bottom aligned, desktop: centered modal */}
      <div className="absolute inset-0 flex items-end sm:items-center sm:justify-center">
        <div
          ref={sheetRef}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'relative w-full bg-white animate-slide-up',
            // Mobile: bottom sheet
            'rounded-t-3xl max-h-[85vh]',
            // Desktop: centered modal
            'sm:rounded-2xl sm:max-w-xl sm:max-h-[80vh] sm:shadow-modal sm:mx-4',
            className,
          )}
        >
          {/* Handle bar (mobile only) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-stone-300" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-stone-100">
            <h3 className="text-lg font-bold text-stone-900">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 120px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd frontend && npx next build 2>&1 | tail -5`
Expected: Build succeeds with no errors.

---

## Task 2: Update Layout — New 3 Tabs + Register Button

**Files:**
- Modify: `frontend/src/app/pets/[id]/layout.tsx`

**What changes:**
1. Replace 5 tabs (home, saude, guarda, historico, perfil) with 3 tabs (dashboard, agenda, perfil)
2. Add `+ Registrar` button in the header
3. Add gear icon that navigates to Perfil tab
4. Update `TABS_BY_ROLE` for new tabs
5. Keep role-based visibility (some roles see fewer tabs)

**Step 1: Rewrite the tab definitions**

Replace the existing `TABS` array and `TABS_BY_ROLE` with:

```tsx
const TABS = [
  { id: 'dashboard', label: 'Dashboard', path: '' },
  { id: 'agenda', label: 'Agenda', path: '/agenda' },
  { id: 'perfil', label: 'Perfil', path: '/perfil' },
];

const TABS_BY_ROLE: Record<string, string[]> = {
  TUTOR_PRINCIPAL:  ['dashboard', 'agenda', 'perfil'],
  TUTOR_EMERGENCIA: ['dashboard', 'agenda', 'perfil'],
  VETERINARIO:      ['dashboard', 'agenda'],
  ADESTRADOR:       ['dashboard', 'agenda'],
  PASSEADOR:        ['dashboard'],
  FAMILIAR:         ['dashboard'],
  AMIGO:            ['dashboard'],
  OUTRO:            ['dashboard'],
};
```

Replace the existing `TAB_ICONS` with new icons for dashboard (grid), agenda (calendar), perfil (user).

**Step 2: Add Register button to header**

In the header, between the back button and the pet name, add a `+ Registrar` button that emits a custom event or uses a context/callback:

```tsx
<button
  onClick={() => {
    // Dispatch custom event that the page can listen to
    window.dispatchEvent(new CustomEvent('mitra:register-event'));
  }}
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mitra-700 text-white text-xs font-semibold hover:bg-mitra-800 transition-colors"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
  Registrar
</button>
```

**Step 3: Verify build + visual**

Run: `cd frontend && npx next build 2>&1 | tail -5`
Navigate to `/pets/pet-luna` — should see 3 tabs instead of 5.

---

## Task 3: Create RegisterEventModal Component

**Files:**
- Create: `frontend/src/components/RegisterEventModal.tsx`

**What it does:** Modal triggered by `+ Registrar` button. Step 1: pick event type. Step 2: fill type-specific form. Uses existing API endpoints.

**Step 1: Create the component**

Event types grid:
```
💉 Vacina    🏥 Consulta   🛁 Banho
💊 Medicação  🩺 Sintoma   📝 Observação
```

Each type shows a simple form:
- **Vacina**: nome (select), dataAplicacao, proximaDose, veterinario, clinica
- **Consulta**: data, horario, veterinario, clinica, diagnostico, observacoes
- **Banho**: data, local, observacoes
- **Medicacao**: nome, dosagem, frequencia, dataInicio, motivo
- **Sintoma**: descricao, dataInicio, intensidade
- **Observacao**: titulo, descricao

Uses `BottomSheet` component. On submit, calls the appropriate API:
- Vacina → `healthApi.criarVacina()`
- Consulta → `registrosApi.create()`
- Banho → `registrosApi.create()` with tipo='OBSERVACAO'
- Medicacao → `healthApi.criarMedicamento()`
- Sintoma → `healthApi.criarSintoma()`
- Observacao → `registrosApi.create()` with tipo='OBSERVACAO'

After success: shows confirmation, closes after 2s, reloads data via callback.

**Step 2: Verify build**

---

## Task 4: Rewrite Dashboard Page (page.tsx)

**Files:**
- Modify: `frontend/src/app/pets/[id]/page.tsx`

**What changes:** Complete rewrite. Remove old sections. Add:
1. Info basica compacta (raca + idade + genero + peso + cor inline)
2. Smart Cards (reuse existing `generateTutorSmartCards`)
3. Card-resumo: Saude (compacto, clicavel → bottom sheet)
4. Card-resumo: Pessoas (compacto, clicavel → bottom sheet)
5. Card-resumo: Atividade (3 eventos recentes, clicavel → bottom sheet)
6. RegisterEventModal listener

**Step 1: Rewrite the page**

Keep all existing data loading (Promise.all with 10 APIs). Keep `SmartCardItem` and `useMemo` for smart cards.

Remove: old Health Glance Strip, old "Sobre o pet", old "Quem cuida", old Timeline, old Invite Modal.

Add new layout:

```tsx
<div className="space-y-3">
  {/* Info basica */}
  <div className="text-center py-4 animate-fade-in">
    <p className="font-display text-xs uppercase tracking-[0.25em] text-mitra-500 font-semibold">
      {pet.raca || especieLabel(pet.especie)} · {petAge(pet.dataNascimento)}
    </p>
    <p className="text-sm text-stone-400 mt-0.5">
      {pet.genero ? generoLabel(pet.genero) : ''}
      {pet.peso ? ` · ${pet.peso}kg` : ''}
      {pet.cor ? ` · ${pet.cor}` : ''}
    </p>
  </div>

  {/* Smart Cards */}
  {actionableCards.length > 0 && (
    <div className="space-y-2 animate-slide-up" style={{animationDelay:'100ms'}}>
      {actionableCards.map((card) => (
        <SmartCardItem key={card.id} card={card} onSuggestionClick={handleSuggestionClick} />
      ))}
    </div>
  )}

  {/* Card-Resumo: Saude */}
  <SummaryCard
    title="Saude"
    icon="❤️"
    delay={200}
    onClick={() => setSheet('saude')}
    lines={[
      `💉 ${vacinasVencendo} vacina${vacinasVencendo !== 1 ? 's' : ''} pendente${vacinasVencendo !== 1 ? 's' : ''}`,
      `💊 ${medsAtivos} medicamento${medsAtivos !== 1 ? 's' : ''} ativo${medsAtivos !== 1 ? 's' : ''}`,
      `🩺 ${sintomas.length === 0 ? 'Nenhum sintoma recente' : `${sintomas.length} sintoma${sintomas.length !== 1 ? 's' : ''} ativo${sintomas.length !== 1 ? 's' : ''}`}`,
    ]}
  />

  {/* Card-Resumo: Pessoas */}
  <SummaryCard
    title="Pessoas"
    icon="👥"
    delay={300}
    onClick={() => setSheet('pessoas')}
    lines={[
      `${tutores.length} pessoa${tutores.length !== 1 ? 's' : ''} vinculada${tutores.length !== 1 ? 's' : ''}`,
      tutores.slice(0, 2).map((t) => `${t.usuario?.nome?.split(' ')[0]} · ${roleLabel(t.role)}`).join(' | '),
    ]}
  />

  {/* Card-Resumo: Atividade */}
  <SummaryCard
    title="Atividade"
    icon="📋"
    delay={400}
    onClick={() => setSheet('atividade')}
    lines={recentEvents.slice(0, 3).map((ev) => (
      `${eventoIcon(ev.tipo)} ${ev.titulo?.substring(0, 35)}${(ev.titulo?.length || 0) > 35 ? '...' : ''}`
    ))}
    emptyText="Nenhum evento recente"
  />
</div>

{/* Bottom Sheets */}
<SaudeSheet open={sheet === 'saude'} onClose={() => setSheet(null)} petId={petId} pet={pet} ... />
<PessoasSheet open={sheet === 'pessoas'} onClose={() => setSheet(null)} petId={petId} pet={pet} ... />
<AtividadeSheet open={sheet === 'atividade'} onClose={() => setSheet(null)} petId={petId} eventos={eventos} />
<RegisterEventModal open={showRegister} onClose={() => setShowRegister(false)} petId={petId} pet={pet} onSuccess={reload} />
```

**SummaryCard** is a small inline component:
```tsx
function SummaryCard({ title, icon, delay, onClick, lines, emptyText }: {
  title: string; icon: string; delay: number;
  onClick: () => void; lines: string[]; emptyText?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-stone-100 p-4 hover:shadow-card active:scale-[0.99] transition-all animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">{title}</span>
        </div>
        <svg className="text-stone-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </div>
      {lines.length === 0 && emptyText ? (
        <p className="text-sm text-stone-400">{emptyText}</p>
      ) : (
        <div className="space-y-0.5">
          {lines.map((line, i) => (
            <p key={i} className="text-sm text-stone-600">{line}</p>
          ))}
        </div>
      )}
    </button>
  );
}
```

**Step 2: Verify build + visual**

---

## Task 5: Create Saude Bottom Sheet

**Files:**
- Create: `frontend/src/components/pet/SaudeSheet.tsx`

**What it does:** Bottom sheet with 3 sub-tabs (Vacinas | Medicamentos | Sintomas). Reuses the form logic from the existing `saude/page.tsx` but rendered inside a BottomSheet.

**Step 1: Create the component**

Structure:
- Uses `BottomSheet` component
- 3 pill-style sub-tabs at top (same styling as saude page)
- Content per tab:
  - **Vacinas**: list + `+ Registrar vacina` button that shows inline form
  - **Medicamentos**: active list + administrar + `+ Novo medicamento` form
  - **Sintomas**: list + `+ Registrar sintoma` form
- Receives: `vacinas, medicamentos, sintomas, pet, petId` as props
- Receives: `onUpdate` callback to refresh parent data after create/delete

Extract the form logic from `saude/page.tsx` into this component. The forms use the exact same fields and API calls:
- `healthApi.criarVacina(petId, data)`
- `healthApi.criarMedicamento(petId, data)`
- `healthApi.criarSintoma(petId, data)`
- `healthApi.administrar(petId, medId)`

**Step 2: Verify build**

---

## Task 6: Create Pessoas Bottom Sheet

**Files:**
- Create: `frontend/src/components/pet/PessoasSheet.tsx`

**What it does:** Bottom sheet with 3 groups (Tutores | Prestadores | Visitantes). Lists people with role badges. Actions: convidar, remover.

**Step 1: Create the component**

Structure:
- Uses `BottomSheet` component
- 3 pill-style sub-tabs: Tutores | Prestadores | Visitantes
- **Tutores tab**: list with avatar + name + role badge. `+ Convidar` button opens inline form (email + role select). Uses `governanceApi.adicionarTutor()`.
- **Prestadores tab**: filtered from tutores where role is VETERINARIO/ADESTRADOR/PASSEADOR. Same list format.
- **Visitantes tab**: list from `petsApi.listVisitantes()`. Each shows name + permissions badges + `Revogar` button. `+ Convidar visitante` form.

Receives: `tutores, petId` as props. Loads visitantes internally.

**Step 2: Verify build**

---

## Task 7: Create Atividade Bottom Sheet

**Files:**
- Create: `frontend/src/components/pet/AtividadeSheet.tsx`

**What it does:** Bottom sheet showing full timeline, grouped by month (reuses logic from `historico/page.tsx`).

**Step 1: Create the component**

Structure:
- Uses `BottomSheet` component
- Groups eventos by month (same logic as historico page)
- Each event: icon + titulo + descricao + criadoEm
- Vertical timeline line on left side
- Scrollable content

Receives: `eventos` as prop.

**Step 2: Verify build**

---

## Task 8: Create CalendarMonth Component

**Files:**
- Create: `frontend/src/components/CalendarMonth.tsx`

**What it does:** Custom monthly calendar with dots for events. No external library.

**Step 1: Create the component**

Props:
```tsx
interface CalendarMonthProps {
  month: number; // 0-11
  year: number;
  events: { date: string; color?: string; label?: string }[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onChangeMonth: (month: number, year: number) => void;
}
```

Implementation:
- Header: `◀ Março 2026 ▶` with prev/next month buttons
- Grid: 7 columns (Seg Ter Qua Qui Sex Sab Dom)
- Days: numbered, with dots below for events
- Today: highlighted with `bg-mitra-100 text-mitra-700 font-bold rounded-full`
- Selected day: `bg-mitra-700 text-white rounded-full`
- Days with events: small colored dot below the number
- Month names in Portuguese

Helper function to generate calendar grid:
```tsx
function getCalendarDays(month: number, year: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start
  const grid: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}
```

**Step 2: Verify build**

---

## Task 9: Create Agenda Page

**Files:**
- Create: `frontend/src/app/pets/[id]/agenda/page.tsx`

**What it does:** New tab with calendar + events of selected day + recurring compromissos.

**Step 1: Create the page**

Structure:
```
[CalendarMonth]

── Eventos de [data selecionada] ──
List of events for selected date

── Compromissos recorrentes ──
List of recurring compromissos
[+ Novo compromisso]
```

Data sources for calendar events:
- `compromissos` (calculate dates from recorrencia + diasSemana)
- `vacinas` with `proximaDose` (show as event on that date)
- `medicamentos` ATIVO (show daily events based on horarios)
- `guardasTemporarias` (show date range)

Compromisso form (in bottom sheet):
- titulo (text)
- tipo (select: PASSEIO, CONSULTA, BANHO, ADESTRAMENTO, CRECHE, HOSPEDAGEM, OUTRO)
- responsavelId (select from tutores/prestadores)
- recorrencia (select: UNICO, DIARIO, SEMANAL, QUINZENAL, MENSAL)
- diasSemana (checkboxes, if recorrencia != UNICO)
- horarioInicio, horarioFim (time inputs)
- dataInicio, dataFim (date inputs)
- geraGuarda (toggle)

Uses `compromissosApi.create()`, `.update()`, `.remove()`.

**Step 2: Verify build + visual**

---

## Task 10: Rewrite Perfil Page — Absorb Guarda

**Files:**
- Modify: `frontend/src/app/pets/[id]/perfil/page.tsx`

**What changes:**
1. Keep existing sections: Dados do pet, Localizacao, Plano de Saude, Acoes
2. Add new section: **Guarda** (between Localizacao and Plano de Saude)
   - Tipo de guarda (Conjunta/Separada)
   - Guarda atual (quem esta com o pet agora)
   - Proximas guardas agendadas
   - Botao "Solicitar alteracao" → bottom sheet with form
   - Guardas temporarias
3. Move "Pessoas vinculadas" section below Guarda (already partially exists)
4. Load additional data: guardas, solicitacoes, guardasTemporarias via `custodyApi`

Reuse the guarda logic from `guarda/page.tsx`:
- Status atual display
- Solicitar alteracao form
- Guardas temporarias list
- Solicitacoes pendentes

**Step 3: Verify build + visual**

---

## Task 11: Cleanup — Remove Old Pages + Add Redirects

**Files:**
- Delete: `frontend/src/app/pets/[id]/saude/page.tsx`
- Delete: `frontend/src/app/pets/[id]/guarda/page.tsx`
- Delete: `frontend/src/app/pets/[id]/historico/page.tsx`
- Delete: `frontend/src/app/pets/[id]/registrar-consulta/page.tsx`

**Step 1: Replace each deleted page with a redirect**

For each old route, create a minimal redirect page:

```tsx
// Example: frontend/src/app/pets/[id]/saude/page.tsx
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function SaudeRedirect() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => { router.replace(`/pets/${params?.id}`); }, [router, params]);
  return null;
}
```

Do the same for guarda, historico, registrar-consulta.

**Step 2: Verify build**

Run: `cd frontend && npx next build 2>&1 | tail -10`
Expected: Build succeeds. All old routes redirect to dashboard.

**Step 3: Full verification**

Navigate through:
1. `/pets/pet-luna` → Dashboard with info + smart cards + summary cards
2. Click Saude card → bottom sheet with Vacinas/Medicamentos/Sintomas tabs
3. Click Pessoas card → bottom sheet with Tutores/Prestadores/Visitantes
4. Click Atividade card → bottom sheet with full timeline
5. Click `+ Registrar` → modal with event type picker + form
6. Tab "Agenda" → calendar + events + compromissos
7. Tab "Perfil" → dados + localizacao + guarda + plano + acoes
8. Old URLs redirect: `/pets/pet-luna/saude` → `/pets/pet-luna`
9. Zero console errors

---

## Files Summary

| Action | File | Description |
|--------|------|-------------|
| CREATE | `frontend/src/components/BottomSheet.tsx` | Reusable bottom sheet/modal |
| CREATE | `frontend/src/components/RegisterEventModal.tsx` | Quick event registration modal |
| CREATE | `frontend/src/components/CalendarMonth.tsx` | Custom monthly calendar |
| CREATE | `frontend/src/components/pet/SaudeSheet.tsx` | Health bottom sheet with sub-tabs |
| CREATE | `frontend/src/components/pet/PessoasSheet.tsx` | People management bottom sheet |
| CREATE | `frontend/src/components/pet/AtividadeSheet.tsx` | Activity timeline bottom sheet |
| CREATE | `frontend/src/app/pets/[id]/agenda/page.tsx` | New Agenda tab page |
| MODIFY | `frontend/src/app/pets/[id]/layout.tsx` | New 3-tab navigation + register button |
| MODIFY | `frontend/src/app/pets/[id]/page.tsx` | Dashboard rewrite with summary cards |
| MODIFY | `frontend/src/app/pets/[id]/perfil/page.tsx` | Absorb guarda content |
| REDIRECT | `frontend/src/app/pets/[id]/saude/page.tsx` | Redirect to dashboard |
| REDIRECT | `frontend/src/app/pets/[id]/guarda/page.tsx` | Redirect to dashboard |
| REDIRECT | `frontend/src/app/pets/[id]/historico/page.tsx` | Redirect to dashboard |
| REDIRECT | `frontend/src/app/pets/[id]/registrar-consulta/page.tsx` | Redirect to dashboard |

## Existing Utils/Functions to Reuse

| Function | File | Use |
|----------|------|-----|
| `petAge()` | `lib/utils.ts` | Info basica — idade |
| `especieLabel()` | `lib/utils.ts` | Info basica — especie |
| `generoLabel()` | `lib/utils.ts` | Info basica — genero |
| `roleLabel()` | `lib/utils.ts` | Pessoas — role labels |
| `getInitials()` | `lib/utils.ts` | Pessoas — avatars |
| `eventoIcon()` | `lib/utils.ts` | Timeline — icons |
| `formatRelative()` | `lib/utils.ts` | Timeline — "ha 3 dias" |
| `formatDate()` | `lib/utils.ts` | Dates — "12/03/2026" |
| `cn()` | `lib/utils.ts` | Classname merge |
| `generateTutorSmartCards()` | `lib/smart-cards.ts` | Dashboard — smart cards |
| `VACINAS_POR_ESPECIE` | `saude/page.tsx` | SaudeSheet — vacina options |
| `MEDICAMENTOS_POR_ESPECIE` | `saude/page.tsx` | SaudeSheet — med options |

## Execution Order

Tasks MUST be executed in order (1→11). Each builds on the previous.
Tasks 5, 6, 7 can potentially run in parallel (independent bottom sheets).
Task 8 can run in parallel with 5-7 (independent component).
