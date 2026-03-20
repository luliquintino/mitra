# Joyful Caretaker — Full Design Redesign

## Overview

Replace the existing MITRA design system (navy/sage/stone "Warm Sanctuary") with the Stitch "Joyful Caretaker" design system ("Tactile Playfulness"). Every screen receives the new aesthetic. A new Diário page is added, expanding navigation from 3 to 4 tabs.

**Creative North Star:** Tactile Playfulness — soft, rounded "physical" objects that feel as friendly as a plush toy. Intentional asymmetry, organic layering, extreme typography scales.

---

## 1. Foundation — Tokens, Typography, Components

### Color Palette (Material Design Tokens)

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#6c5a00` | Primary text on yellow |
| `primary-container` | `#ffd709` | Hero color, CTAs, active tabs |
| `secondary` | `#04647d` | Trust, health, calm |
| `secondary-container` | `#9ae1ff` | Health cards, blue accents |
| `tertiary` | `#a8216e` | Love, play, alerts |
| `tertiary-container` | `#ff8bc0` | Pink cards, badges |
| `surface` | `#e4ffcc` | Main background (grass green) |
| `surface-low` | `#cfffaa` | Inset sections |
| `surface-high` | `#82ff1a` | Elevated elements |
| `surface-container` | `#a6ff6a` | Medium green |
| `on-surface` | `#163600` | Primary text |
| `on-primary` | `#fff2cd` | Text on primary |
| Full token set from Stitch DESIGN.md (~30 tokens total) | | |

### Typography

- **Headlines:** Plus Jakarta Sans (wght 400–800) — chunky, tight letter-spacing
- **Body:** Be Vietnam Pro (wght 400–700) — high legibility
- **Scale:** Display-LG 3.5rem, Headline-MD 1.75rem, Body-LG 1rem, Label-MD 0.75rem
- Loaded via `next/font/google` in root layout

### Design Rules

1. **No-Line Rule:** Zero 1px borders. Boundaries via background color shifts only.
2. **No Dividers:** Separate with spacing or alternating tones.
3. **Roundedness:** Cards = `xl` (3rem), Buttons/Pills = `full` (9999px).
4. **Squishy Motion:** `active:scale-[0.9]` on all interactives.
5. **No Neutral Greys:** Every neutral is a tint of green or yellow.
6. **Glassmorphism:** Semi-transparent surfaces with backdrop-blur for modals/nav.
7. **Ambient Shadows:** `#163600` at 6% opacity, 48px blur. No dark drop-shadows.

### CSS Component Classes (globals.css)

Replace all `mitra-*` classes with `jc-*`:
- `.jc-card` — `bg-white/70 backdrop-blur-md rounded-xl` (no borders)
- `.jc-btn-primary` — `bg-primary-container text-primary rounded-full` + squishy
- `.jc-input` — `bg-white rounded-xl` (no borders, xl corners)
- `.jc-tab-pill` — `bg-surface-low rounded-full` / `bg-primary-container` active
- `.jc-overlay` — `bg-black/40 backdrop-blur-sm`

---

## 2. Landing Page / Login

- **Background:** `surface` with mesh gradient (radial-gradients of yellow, blue, pink)
- **Hero:** Headline 4xl+ "Cuide do seu pet com alegria", Plus Jakarta Sans extrabold
- **Floating decorations:** Organic circles in system colors with float animation
- **Form card:** `bg-white/70 backdrop-blur-md rounded-xl p-8`, centered
- **Inputs:** No border, white bg, xl corners, Material Symbol icons
- **Submit:** `bg-primary-container text-primary rounded-full font-bold` + squishy
- **Feature pills:** 4 badges in `secondary-container rounded-full`
- **Dev credentials:** Maintained, styled with `surface-low`

---

## 3. Pet Layout + Bottom Nav (4 Tabs)

### Bottom Navigation
```
Início (pets) | Agenda (calendar_today) | Diário (auto_stories) | Perfil (person)
```
- Container: `fixed bottom-0 bg-white/70 backdrop-blur-xl rounded-t-[3rem] h-24`
- Active tab: `bg-primary-container text-primary rounded-full px-6 py-2 scale-110 shadow-lg`
- Inactive: `text-secondary hover:bg-secondary-container/30 rounded-full`
- Labels: Be Vietnam Pro 11px uppercase tracking-widest

### FAB "+ Registrar"
- `fixed bottom-28 right-6 bg-primary text-primary-container rounded-full w-14 h-14 shadow-xl`
- Dispatches `CustomEvent('mitra:register-event')`

---

## 4. Dashboard (Início)

- **Pet Spotlight:** `bg-primary-container rounded-xl` with pet photo (rounded-[4rem] rotate-3), paw badge (tertiary-container animate-bounce), greeting text 4xl
- **Mood Selector:** 3 buttons in glassmorphism bar (Feliz, Sono, Fome)
- **Energy bar:** "Treat" progress bar in `surface-low` card
- **Shortcut cards:** Bento grid (Saúde=secondary-container, Passeio=tertiary-container, Check-up=surface-high)
- **Recent diary:** 2-3 event items in white cards with colored icon circles
- **Bottom sheets:** SaudeSheet, PessoasSheet, AtividadeSheet with new palette

---

## 5. Agenda

- **Calendar:** `surface-low rounded-xl`, day cells `bg-white/50 rounded-lg`, selected=`bg-primary-container ring-4`
- **Upcoming events sidebar:** `bg-secondary-container rounded-xl` with glassmorphism items
- **"Novo Lembrete" CTA:** `bg-primary rounded-xl text-primary-container font-bold`
- **Today's tasks:** Paw checkbox cards in white with done_all / PENDENTE status

---

## 6. Diário de Aventuras (NEW PAGE)

- **Hero:** Title 5xl text-primary tracking-tighter + subtitle text-secondary
- **"Adicionar Nova Foto" CTA:** primary-container rounded-full with camera icon + "NOVO" badge
- **Bento mural gallery:** Asymmetric grid, cards with organic rotations (-3° to +3°), hover straightens. Color-coded backgrounds (secondary-container, tertiary-container, primary-container, white). Photo stickers overlay.
- **Fun stats:** surface-low card with 3 stat boxes (Fotos, Parques, Amiguinhos)
- **Data source:** eventsApi events with photos/notes

---

## 7. Perfil do Pet

- **Avatar:** `w-64 h-64 rounded-full border-[12px] border-white shadow-xl rotate-2` with decorative blobs
- **Name:** font-headline 5xl extrabold tracking-tighter + breed badge secondary-container
- **Age conversion:** bg-white/70 card, pet years vs human years in 7xl typography
- **Weight:** 6xl bold primary + paw graph (5 paws filled/empty)
- **Allergies:** Grid with organic rotations, tertiary-container/30 cards
- **Guarda section:** Maintained with new styling
- **"Editar Perfil" button:** primary-container rounded-full font-black 2xl with rotating edit icon

---

## Files Affected

### Modified
- `tailwind.config.ts` — Complete color/font/radius/animation replacement
- `globals.css` — Replace mitra-* classes with jc-*, new animations
- `app/layout.tsx` — Swap Inter for Plus Jakarta Sans + Be Vietnam Pro
- `app/login/page.tsx` — Full redesign to Joyful Caretaker aesthetic
- `app/pets/[id]/layout.tsx` — 4 tabs, new bottom nav, FAB
- `app/pets/[id]/page.tsx` — Dashboard with Stitch components
- `app/pets/[id]/agenda/page.tsx` — Calendar + tasks with new palette
- `app/pets/[id]/perfil/page.tsx` — Profile with Stitch bento grid
- `components/BottomSheet.tsx` — New glass style
- `components/RegisterEventModal.tsx` — New palette
- `components/pet/SaudeSheet.tsx` — New palette
- `components/pet/PessoasSheet.tsx` — New palette
- `components/pet/AtividadeSheet.tsx` — New palette
- `components/CalendarMonth.tsx` — New palette + cell style
- `app/home/page.tsx` — Pet list with new styling
- `app/register/page.tsx` — Registration with new palette

### Created
- `app/pets/[id]/diario/page.tsx` — New Diário de Aventuras page

### Preserved (logic unchanged)
- All API calls, state management, auth context, notification context
- Backend integration, mock-first pattern
- Visitor access rules, role-based permissions
