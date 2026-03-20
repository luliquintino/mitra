# Joyful Caretaker Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the entire MITRA visual identity from "Warm Sanctuary" (navy/sage/stone) to "Joyful Caretaker" (grass green/sunny yellow/sky blue/bubblegum pink), adding a new Diário page with 4-tab navigation.

**Architecture:** Full token replacement in Tailwind config + globals.css foundation, then page-by-page redesign preserving all existing business logic, API calls, and state management. Each task produces a buildable state.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Plus Jakarta Sans + Be Vietnam Pro (next/font/google), Material Symbols (Google Fonts), existing API layer unchanged.

**Design reference files:** `/tmp/stitch-designs/stitch/stitch/*/code.html` (4 HTML screens) + `DESIGN.md`

---

## Task 1: Foundation — Tailwind Config + CSS Variables

**Files:**
- Modify: `frontend/tailwind.config.ts`
- Modify: `frontend/src/app/globals.css`

**What to do:**

1. **tailwind.config.ts** — Replace the entire `colors` object. Remove `mitra-*`, `sage-*`, `warm-*`, `stone.warm`. Add all Stitch Material Design tokens:

```ts
colors: {
  // Primary (Sunny Yellow)
  'primary': '#6c5a00',
  'primary-container': '#ffd709',
  'primary-dim': '#5e4e00',
  'primary-fixed': '#ffd709',
  'primary-fixed-dim': '#efc900',
  'on-primary': '#fff2cd',
  'on-primary-container': '#5b4b00',
  'on-primary-fixed': '#453900',
  'on-primary-fixed-variant': '#665500',
  'inverse-primary': '#ffd709',

  // Secondary (Sky Blue)
  'secondary': '#04647d',
  'secondary-container': '#9ae1ff',
  'secondary-dim': '#00576e',
  'secondary-fixed': '#9ae1ff',
  'secondary-fixed-dim': '#8cd3f0',
  'on-secondary': '#e3f6ff',
  'on-secondary-container': '#005267',
  'on-secondary-fixed': '#003d4f',
  'on-secondary-fixed-variant': '#005c74',

  // Tertiary (Bubblegum Pink)
  'tertiary': '#a8216e',
  'tertiary-container': '#ff8bc0',
  'tertiary-dim': '#980f61',
  'tertiary-fixed': '#ff8bc0',
  'tertiary-fixed-dim': '#ff72b7',
  'on-tertiary': '#ffeff3',
  'on-tertiary-container': '#63003d',
  'on-tertiary-fixed': '#37001f',
  'on-tertiary-fixed-variant': '#730048',

  // Surfaces (Grass Green spectrum)
  'surface': '#e4ffcc',
  'surface-bright': '#e4ffcc',
  'surface-dim': '#76f000',
  'surface-variant': '#7bf900',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#cfffaa',
  'surface-container': '#a6ff6a',
  'surface-container-high': '#82ff1a',
  'surface-container-highest': '#7bf900',
  'on-surface': '#163600',
  'on-surface-variant': '#306800',
  'on-background': '#163600',
  'background': '#e4ffcc',
  'surface-tint': '#6c5a00',
  'inverse-surface': '#041100',
  'inverse-on-surface': '#56b100',

  // Outline
  'outline': '#408700',
  'outline-variant': '#5fc400',

  // Error
  'error': '#b02500',
  'error-dim': '#b92902',
  'error-container': '#f95630',
  'on-error': '#ffefec',
  'on-error-container': '#520c00',
},
```

2. Replace `fontFamily`:

```ts
fontFamily: {
  headline: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
  body: ['var(--font-vietnam)', 'Be Vietnam Pro', 'system-ui', 'sans-serif'],
  label: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
},
```

3. Replace `borderRadius`:

```ts
borderRadius: {
  DEFAULT: '1rem',
  lg: '2rem',
  xl: '3rem',
  full: '9999px',
},
```

4. Keep existing `animation` and `keyframes`. Add new ones:

```ts
// Add to animation:
'float': 'float 7s ease-in-out infinite',
'float-slow': 'floatSlow 9s ease-in-out infinite',
'squishy': 'squishy 0.15s ease-out',

// Add to keyframes:
float: {
  '0%, 100%': { transform: 'translateY(0px) scale(1)' },
  '50%': { transform: 'translateY(-14px) scale(1.03)' },
},
floatSlow: {
  '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
  '50%': { transform: 'translateY(-10px) rotate(3deg)' },
},
squishy: {
  '0%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(0.92)' },
  '100%': { transform: 'scale(1)' },
},
```

5. Add shadows for the new system:

```ts
boxShadow: {
  'card': '0 2px 12px rgba(22,54,0,0.06)',
  'card-hover': '0 8px 24px rgba(22,54,0,0.08)',
  'modal': '0 20px 60px rgba(22,54,0,0.15)',
  'nav': '0 -8px 30px rgba(22,54,0,0.06)',
  'ambient': '0 4px 48px rgba(22,54,0,0.06)',
},
```

6. **globals.css** — Complete rewrite. Replace ALL `mitra-*` component classes with `jc-*` classes. Keep the `@tailwind` directives and base resets. New `:root` variables:

```css
:root {
  --background: #e4ffcc;
  --foreground: #163600;
  --card: rgba(255,255,255,0.7);
  --border: transparent;
  --muted: #306800;
  --accent: #6c5a00;
}
```

New component classes:
- `.jc-card` — `@apply bg-white/70 backdrop-blur-md rounded-xl p-5;`
- `.jc-btn-primary` — `@apply bg-primary-container text-on-primary-container font-headline font-bold px-6 py-3 rounded-full active:scale-[0.9] transition-all duration-200 hover:scale-[1.02];`
- `.jc-btn-secondary` — `@apply bg-secondary-container text-on-secondary-container font-medium px-5 py-2.5 rounded-full active:scale-[0.9] transition-all duration-200;`
- `.jc-btn-ghost` — `@apply text-secondary font-medium px-4 py-2 rounded-full hover:bg-secondary-container/30 active:scale-[0.9] transition-all duration-200;`
- `.jc-input` — `@apply w-full bg-surface-container-lowest rounded-xl px-4 py-3 text-on-surface placeholder:text-outline font-body focus:outline-none focus:ring-2 focus:ring-primary-container transition-all duration-200;`
- `.jc-label` — `@apply block text-sm font-headline font-bold text-on-surface-variant mb-1.5 uppercase tracking-widest;`
- `.jc-tab-pill` — `@apply px-4 py-2 rounded-full text-sm font-headline font-semibold text-secondary transition-all duration-200 hover:bg-secondary-container/30;`
- `.jc-tab-pill-active` — `@apply bg-primary-container text-on-primary-container hover:bg-primary-container;`
- `.jc-badge` — `@apply inline-flex items-center px-3 py-1 rounded-full text-xs font-headline font-bold;`
- `.jc-section-title` — `@apply text-sm font-headline font-bold text-on-surface-variant uppercase tracking-widest mb-3;`
- `.jc-overlay` — `@apply fixed inset-0 z-50 bg-black/30 backdrop-blur-sm;`
- `.jc-skeleton` — shimmer with green tints
- `.bounce-effect` — `active:scale-[0.9] transition-transform duration-200`
- `.bg-mesh` — radial gradients of yellow/blue/pink on green

Remove ALL old `mitra-*`, `landing-*`, `grain-texture`, `dot-grid` classes. Remove Cal Sans font-face.

Update `body` styles to: `background-color: #e4ffcc; color: #163600; font-family: var(--font-vietnam), 'Be Vietnam Pro', system-ui, sans-serif;`

Update heading styles: `font-family: var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif;`

Keep `scrollbar-hide` and scrollbar styling (update thumb color to green tints).

**Verify:** `cd frontend && npx next build` — no errors.

---

## Task 2: Root Layout — Font Loading

**Files:**
- Modify: `frontend/src/app/layout.tsx`

**What to do:**

Replace Inter import with Plus Jakarta Sans + Be Vietnam Pro via `next/font/google`:

```tsx
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

const vietnam = Be_Vietnam_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-vietnam',
  weight: ['400', '500', '600', '700'],
});
```

Update `<html>` tag: `className={`${jakarta.variable} ${vietnam.variable}`}`

Update `<body>`: `className="min-h-screen bg-surface antialiased font-body text-on-surface"`

Add Material Symbols link in `<head>` via metadata or direct `<link>` in layout:
```tsx
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
```

**Verify:** `cd frontend && npx next build` — no errors.

---

## Task 3: BottomSheet + RegisterEventModal — New Palette

**Files:**
- Modify: `frontend/src/components/BottomSheet.tsx`
- Modify: `frontend/src/components/RegisterEventModal.tsx`

**What to do:**

**BottomSheet.tsx:**
- Overlay: change to `bg-black/30 backdrop-blur-sm`
- Sheet container: `bg-surface rounded-t-[3rem] lg:rounded-xl` (no borders)
- Title: `font-headline font-bold text-xl text-on-surface`
- Close button: `text-on-surface-variant hover:bg-surface-container-low rounded-full`
- Handle bar: `bg-outline-variant/40 w-12 h-1.5 rounded-full`
- Remove any `border-*`, `bg-white`, `border-stone-*` references

**RegisterEventModal.tsx:**
- All `bg-mitra-*`, `text-mitra-*`, `border-mitra-*` → new Stitch tokens
- Buttons: `jc-btn-primary` class
- Inputs: `jc-input` class
- Event type cards: use `secondary-container`, `tertiary-container`, `primary-container` backgrounds for different types
- Icons: keep existing SVG icons or add Material Symbols

**Verify:** `cd frontend && npx next build` — no errors.

---

## Task 4: Pet Layout — 4-Tab Bottom Nav + FAB

**Files:**
- Modify: `frontend/src/app/pets/[id]/layout.tsx`

**What to do:**

Complete rewrite of the layout. Replace top-tab navigation with bottom-tab navigation matching Stitch design.

**TABS array** — now 4 tabs:
```tsx
const TABS = [
  { id: 'inicio', label: 'Início', path: '', icon: 'pets' },
  { id: 'agenda', label: 'Agenda', path: '/agenda', icon: 'calendar_today' },
  { id: 'diario', label: 'Diário', path: '/diario', icon: 'auto_stories' },
  { id: 'perfil', label: 'Perfil', path: '/perfil', icon: 'person' },
];
```

**TABS_BY_ROLE** — add `diario` tab for roles that had `dashboard`:
```tsx
const TABS_BY_ROLE: Record<string, string[]> = {
  TUTOR_PRINCIPAL:  ['inicio', 'agenda', 'diario', 'perfil'],
  TUTOR_EMERGENCIA: ['inicio', 'agenda', 'diario', 'perfil'],
  VETERINARIO:      ['inicio', 'agenda', 'diario'],
  ADESTRADOR:       ['inicio', 'agenda'],
  PASSEADOR:        ['inicio'],
  FAMILIAR:         ['inicio', 'diario'],
  AMIGO:            ['inicio'],
  OUTRO:            ['inicio'],
};
```

**Header** — minimal sticky top:
```tsx
<header className="w-full pt-4 pb-2 px-6 bg-surface-container-low sticky top-0 z-40">
  <div className="flex justify-between items-center max-w-screen-xl mx-auto">
    <div className="flex items-center gap-3">
      <PetImage ... className="w-12 h-12 rounded-xl border-2 border-primary-container" />
      <h1 className="font-headline font-bold tracking-tight text-2xl text-primary">MITRA</h1>
    </div>
    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:scale-105 transition-transform">
      <span className="material-symbols-outlined text-primary">notifications</span>
    </button>
  </div>
</header>
```

**Content area:**
```tsx
<main className="max-w-screen-xl mx-auto px-6 pt-8 pb-32">{children}</main>
```

**FAB (floating action button)** — only for write-access roles:
```tsx
{canRegister && (
  <button
    onClick={() => window.dispatchEvent(new CustomEvent('mitra:register-event'))}
    className="fixed bottom-28 right-6 z-50 w-14 h-14 bg-primary text-primary-container rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-transform"
  >
    <span className="material-symbols-outlined text-2xl">add</span>
  </button>
)}
```

**Bottom Nav:**
```tsx
<nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-24 px-6 pb-4 bg-white/70 backdrop-blur-xl rounded-t-[3rem] shadow-nav">
  {visibleTabs.map((tab) => {
    const isActive = activeTab.id === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => navigateTo(tab)}
        className={cn(
          'flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-200 bounce-effect',
          isActive
            ? 'bg-primary-container text-primary scale-110 shadow-lg px-6'
            : 'text-secondary hover:bg-secondary-container/30'
        )}
      >
        <span
          className="material-symbols-outlined"
          style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {tab.icon}
        </span>
        <span className="font-body text-[11px] font-semibold uppercase tracking-widest mt-1">
          {tab.label}
        </span>
      </button>
    );
  })}
</nav>
```

**Loading state** — update to green spinner: `border-primary border-t-transparent`

**Verify:** `cd frontend && npx next build` — no errors.

---

## Task 5: Dashboard (Início) — Full Redesign

**Files:**
- Modify: `frontend/src/app/pets/[id]/page.tsx`

**What to do:**

Preserve ALL imports, state, API calls, useMemo computations, bottom sheet logic, and RegisterEventModal integration. Only change the JSX/rendering to match Stitch dashboard design.

Key visual sections to implement:

1. **Pet Spotlight Hero** — `bg-primary-container rounded-xl p-8` with:
   - Pet photo in `w-56 h-56 rounded-[4rem] rotate-3 border-8 border-white shadow-xl overflow-hidden` with image `-rotate-3 scale-110`
   - Paw badge overlay: `bg-tertiary-container p-4 rounded-full shadow-lg border-4 border-white animate-bounce`
   - Greeting: `font-headline font-extrabold text-4xl text-on-primary-container`
   - Mood selector: 3 buttons in `bg-white/40 backdrop-blur-md rounded-full` bar

2. **Smart Cards** — restyle with new priority colors:
   - urgent: `bg-error-container/20 text-error`
   - warning: `bg-primary-container/30 text-primary`
   - reminder: `bg-secondary-container/30 text-secondary`
   - info: `bg-surface-container-low text-on-surface`
   - suggestion: `bg-tertiary-container/30 text-tertiary`

3. **Summary Cards** (Saúde, Pessoas, Atividade) — Bento grid `grid-cols-2 gap-4`:
   - Saúde: `bg-secondary-container rounded-xl aspect-square` with medical icon
   - Pessoas: `bg-tertiary-container rounded-xl aspect-square`
   - Atividade: `bg-surface-container-highest rounded-xl`
   - Each with `hover:scale-[1.02]`, icon in `bg-white/50 rounded-full`, `font-headline font-bold`

4. **Recent Events** — `bg-surface-container-lowest p-4 rounded-lg` items with colored icon circles

5. **Bottom Sheets** — just pass through (already restyled in Task 3)

**Verify:** `cd frontend && npx next build` — no errors.

---

## Task 6: Agenda Page — Stitch Calendar

**Files:**
- Modify: `frontend/src/components/CalendarMonth.tsx`
- Modify: `frontend/src/app/pets/[id]/agenda/page.tsx`

**What to do:**

**CalendarMonth.tsx:**
- Container: `bg-surface-container-low rounded-xl p-8`
- Month title: `font-headline font-bold text-2xl text-primary`
- Nav arrows: `w-10 h-10 rounded-full bg-white text-primary shadow-sm hover:scale-110`
- Day headers: `font-headline font-bold text-secondary opacity-60 text-sm uppercase tracking-widest`
- Day cells: `bg-white/50 rounded-lg hover:bg-white` transition
- Today/Selected: `bg-primary-container rounded-lg ring-4 ring-primary-container ring-offset-2`
- Event dots: use Material Symbols tiny icons or colored dots

**Agenda page.tsx:**
- Layout: `grid grid-cols-1 lg:grid-cols-12 gap-6`
- Calendar takes `lg:col-span-8`
- Sidebar `lg:col-span-4` with:
  - Upcoming events card: `bg-secondary-container rounded-xl p-6 shadow-lg` with glassmorphism items
  - "Novo Lembrete" CTA: `bg-primary py-6 rounded-xl text-primary-container font-headline font-bold`
- Tasks section: cards `bg-surface-container-lowest p-6 rounded-xl` with paw icons
- Replace all `mitra-*`, `stone-*`, `border-*` references

**Verify:** `cd frontend && npx next build` — no errors.

---

## Task 7: Diário de Aventuras — New Page

**Files:**
- Create: `frontend/src/app/pets/[id]/diario/page.tsx`

**What to do:**

New page that shows pet events as a visual mural/scrapbook gallery.

```tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { petsApi, eventsApi } from '@/lib/api';
import { Pet, Evento } from '@/types';
```

**Sections:**
1. **Hero title:** `font-headline font-extrabold text-5xl text-primary tracking-tighter` + subtitle in `text-secondary`
2. **"Adicionar Nova Foto" CTA:** `bg-primary-container rounded-full px-10 py-6 shadow-lg` with camera icon + "NOVO" badge in `bg-tertiary text-on-tertiary rounded-full rotate-12`
3. **Bento Mural Gallery:** Grid `grid-cols-1 md:grid-cols-4 gap-6`. Map events into cards with:
   - Organic rotations: alternate between `rotate-1`, `-rotate-2`, `rotate-3`, `-rotate-1` etc.
   - Hover: `group-hover:rotate-0 transition-transform duration-500`
   - Color cycling: `secondary-container`, `tertiary-container`, `primary-container`, `surface-container-highest`, white
   - First card: `md:col-span-2 md:row-span-2` (featured)
   - Wide card every 5th: `md:col-span-2`
   - Event description as title in `font-headline font-bold`
   - Date in `font-body text-sm`
   - Sticker overlays: Material Symbols (pets, favorite, star) based on event type
4. **Empty state:** Friendly message with large paw icon if no events
5. **Stats section:** `bg-surface-container-low rounded-xl p-8` with count boxes for total events, this month, event types

**Data:** Load from `eventsApi.list(petId)`, derive stats from the array.

**Verify:** `cd frontend && npx next build` — no errors.

---

## Task 8: Perfil Page — Stitch Bento Grid

**Files:**
- Modify: `frontend/src/app/pets/[id]/perfil/page.tsx`

**What to do:**

Preserve ALL state, API calls, form logic, guarda integration. Only change the JSX/rendering.

1. **Avatar Section:**
   - Large photo: `w-64 h-64 rounded-full border-[12px] border-white shadow-xl rotate-2`
   - Decorative blobs: `bg-tertiary-container rounded-full -z-10 animate-pulse` + `bg-secondary-container rounded-full -z-10`
   - Paw badge: `bg-primary-container p-4 rounded-full shadow-lg border-4 border-white`
   - Name: `font-headline text-5xl font-extrabold tracking-tighter`
   - Breed/age pill: `bg-secondary-container text-on-secondary-container rounded-full font-bold`

2. **Bento Grid:** `grid grid-cols-1 md:grid-cols-12 gap-6`
   - Age card (`md:col-span-7`): `bg-white/70 backdrop-blur-md rounded-xl border-b-8 border-secondary-container` with pet years (7xl) and human years (7xl tertiary)
   - Weight card (`md:col-span-5`): `border-b-8 border-primary-container`, weight in `text-6xl text-primary`, paw graph (5 filled/empty paws)

3. **Allergies / Alerts:** Cards with `bg-tertiary-container/30 border-2 border-tertiary-container rounded-lg` and organic rotations

4. **Guarda Section:** Restyle existing guarda cards with new palette

5. **Tutores/Prestadores lists:** Cards in `bg-surface-container-lowest rounded-xl`

6. **"Editar Perfil" button:** `bg-primary-container text-primary font-headline font-black text-2xl px-16 py-6 rounded-full shadow-xl` with rotating edit icon

**Verify:** `cd frontend && npx next build` — no errors.

---

## Task 9: Pet Sheets — New Palette

**Files:**
- Modify: `frontend/src/components/pet/SaudeSheet.tsx`
- Modify: `frontend/src/components/pet/PessoasSheet.tsx`
- Modify: `frontend/src/components/pet/AtividadeSheet.tsx`

**What to do:**

For each sheet, preserve ALL logic, forms, API calls. Only restyle:

- Tab pills: `jc-tab-pill` / `jc-tab-pill-active` classes
- Cards: `bg-surface-container-lowest rounded-xl` (no borders)
- Buttons: `jc-btn-primary`, `jc-btn-secondary`
- Inputs: `jc-input`
- Labels: `jc-label`
- Badges: `jc-badge` with semantic colors (secondary for health, tertiary for social, primary for general)
- Intensity badges in SaudeSheet: LEVE=`bg-surface-container`, MODERADO=`bg-primary-container`, GRAVE=`bg-error-container`
- Remove ALL `mitra-*`, `stone-*`, `border-stone-*`, `bg-white border` patterns
- Replace with color-shift approach (no borders, only bg changes)

**Verify:** `cd frontend && npx next build` — no errors.

---

## Task 10: Login/Landing Page — Joyful Caretaker

**Files:**
- Modify: `frontend/src/app/login/page.tsx`
- May modify/remove: `frontend/src/components/landing/MitraLogo.tsx`, `frontend/src/components/landing/SvgDecorations.tsx`

**What to do:**

Complete rewrite of the visual layer. Preserve: `useState` form state, `handleSubmit`, `useAuth().login`, error handling, loading state, dev credentials logic, Link to /register.

**New layout:**
- Background: `bg-surface` (grass green) with `bg-mesh` class (radial gradients)
- Floating organic circles: 3-4 absolute-positioned divs with blur, opacity, animate-float
- Centered container with max-w-md

**Content (stacked):**
1. **Logo area:** Paw icon in `bg-primary-container rounded-2xl p-3` + "MITRA" text in `font-headline font-extrabold text-3xl text-primary`
2. **Hero text:** "Cuide do seu pet com alegria" in `font-headline font-extrabold text-4xl text-on-surface tracking-tight` + subtitle in `text-secondary`
3. **Feature pills:** 4 inline badges: "Saúde", "Agenda", "Diário", "Governança" in `bg-secondary-container/50 text-secondary rounded-full` with Material Symbol icons
4. **Form card:** `bg-white/70 backdrop-blur-md rounded-xl p-8 shadow-card`
   - Inputs: `jc-input` with Material Symbol icons (mail, lock) positioned absolute
   - Submit: `w-full bg-primary-container text-on-primary-container font-headline font-bold py-4 rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.9]`
   - "Criar conta" link below
5. **Trust signal:** Mini colored circles + text "Usado por tutores em todo o Brasil"
6. **Dev credentials:** `bg-surface-container-low rounded-xl p-4` if NODE_ENV===development

**Verify:** `cd frontend && npx next build` — no errors.

---

## Task 11: Home Page (Pet List) + Register — Restyle

**Files:**
- Modify: `frontend/src/app/home/page.tsx`
- Modify: `frontend/src/app/register/page.tsx`

**What to do:**

**home/page.tsx:**
- Background: `bg-surface`
- Header: `font-headline` styling, notification bell with Material Symbols
- Pet cards: `bg-surface-container-lowest rounded-xl p-6` (no borders) with `hover:scale-[1.02]` and colored role badges
- "Novo pet" CTA: `bg-primary-container rounded-full`
- Notification panel: glassmorphism card `bg-white/70 backdrop-blur-md`
- Replace ALL `mitra-*`, `stone-*`, `border-*` class references

**register/page.tsx:**
- Same `bg-surface bg-mesh` background
- Form cards: `bg-white/70 backdrop-blur-md rounded-xl`
- Step indicators: `bg-primary-container` for completed, `bg-surface-container-low` for pending
- Inputs: `jc-input`, buttons: `jc-btn-primary`
- Remove references to old SvgDecorations if no longer needed

**Verify:** `cd frontend && npx next build` — no errors.

---

## Task 12: Redirect Pages + Remaining Views — Cleanup

**Files:**
- Modify: `frontend/src/app/pets/[id]/saude/page.tsx` (redirect — just update loading bg)
- Modify: `frontend/src/app/pets/[id]/guarda/page.tsx` (redirect — just update loading bg)
- Modify: `frontend/src/app/pets/[id]/historico/page.tsx` (redirect — just update loading bg)
- Modify: `frontend/src/app/pets/[id]/registrar-consulta/page.tsx` (redirect — just update loading bg)
- Modify: `frontend/src/app/prestador/layout.tsx`
- Modify: `frontend/src/app/prestador/pets/page.tsx`
- Modify: `frontend/src/app/prestador/pets/[id]/page.tsx`
- Modify: `frontend/src/app/visitante/layout.tsx`
- Modify: `frontend/src/app/visitante/pets/page.tsx`
- Modify: `frontend/src/app/visitante/pets/[id]/page.tsx`
- Modify: `frontend/src/app/visitante/convites/page.tsx`
- Modify: `frontend/src/app/minha-conta/page.tsx`
- Modify: `frontend/src/app/home/novo-pet/page.tsx`
- Modify: `frontend/src/app/home/vincular-pet/page.tsx`
- Modify: `frontend/src/components/layout/ProtectedLayout.tsx`
- Modify: `frontend/src/components/PetImage.tsx` (if needed)
- May remove: `frontend/src/components/landing/MitraLogo.tsx`, `frontend/src/components/landing/SvgDecorations.tsx`

**What to do:**

Sweep every remaining file for `mitra-*`, `stone-*`, `sage-*`, `warm-*`, `bg-[#fafaf9]`, `text-stone-*`, `border-stone-*`, `font-display` references. Replace with Stitch equivalents:

- `bg-[#fafaf9]` → `bg-surface`
- `bg-white` → `bg-surface-container-lowest` or `bg-white/70 backdrop-blur-md`
- `text-stone-900` → `text-on-surface`
- `text-stone-500` → `text-on-surface-variant`
- `border-stone-*` → remove (No-Line Rule) or use `outline-variant` at low opacity
- `bg-mitra-700` → `bg-primary`
- `bg-mitra-800` → `bg-primary-dim`
- `text-mitra-*` → `text-primary`
- `bg-stone-100` → `bg-surface-container-low`
- `rounded-2xl` → `rounded-xl` (3rem)
- `font-display` → `font-headline`

**ProtectedLayout.tsx:** Update sidebar/nav colors to new palette.

**Verify:** `cd frontend && npx next build` — no errors. Grep for remaining old tokens: `grep -rn "mitra-\|stone-\|sage-\|warm-\|#fafaf9\|font-display" frontend/src/ --include="*.tsx" --include="*.ts" --include="*.css"` should return zero results.

---

## Task 13: Final Build + Visual Verification

**Files:** None (verification only)

**What to do:**

1. `cd frontend && npx next build` — must pass with zero errors
2. Start dev server: `npm run dev`
3. Visual check each route:
   - `/login` — Joyful Caretaker landing with mesh gradient, form card, feature pills
   - `/register` — Matching aesthetic
   - `/home` — Pet list with new cards
   - `/pets/[id]` — Dashboard with hero, mood selector, bento grid
   - `/pets/[id]/agenda` — Calendar with Stitch styling
   - `/pets/[id]/diario` — New mural gallery page
   - `/pets/[id]/perfil` — Bento profile with paw graph
4. Confirm no `mitra-*` class remnants in rendered output
5. Confirm bottom nav works on all 4 tabs
6. Confirm FAB dispatches register event
7. Confirm bottom sheets open/close correctly
