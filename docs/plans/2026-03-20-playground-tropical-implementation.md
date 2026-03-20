# Playground Tropical — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesenhar todo o frontend do MITRA com estética "Playground Tropical" — cores vibrantes, animações bouncy, consistência total entre landing e app.

**Architecture:** Reescrever tokens (tailwind.config.ts + globals.css) primeiro, depois landing page (componentes novos), depois páginas do app (reestilizar). CSS-only animations. Emojis como ícones. Eliminar Material Symbols e Lucide.

**Tech Stack:** Next.js 14, Tailwind CSS, Plus Jakarta Sans + Be Vietnam Pro, CSS @keyframes, IntersectionObserver.

---

## Referência: Design Doc

Ver `docs/plans/2026-03-20-playground-tropical-design.md` para paleta completa, regras de componentes, especificações de animação e estrutura de cada página.

## Referência: Paleta Rápida

| Token | Hex | Uso |
|-------|-----|-----|
| `coral` | `#FF6B4A` | CTA primário |
| `rosa` | `#FF4E8C` | Saúde |
| `amarelo` | `#FFB930` | Destaques |
| `menta` | `#2ED8A3` | Confirmação |
| `azul` | `#4DA3FF` | Informação |
| `creme` | `#FFF8F0` | Fundo base |
| `creme-dark` | `#FFF0E0` | Containers |
| `texto` | `#2D1B14` | Texto principal |
| `texto-soft` | `#8C7A6B` | Texto secundário |

## Referência: Classes CSS (novo sistema `pt-*` = Playground Tropical)

| Classe | Descrição |
|--------|-----------|
| `pt-card` | Card branco, radius 1.5rem, sombra suave, hover eleva |
| `pt-card-color-{saude,agenda,guarda,historico,governanca}` | Card com fundo contextual |
| `pt-btn` | Botão coral pill, bouncy hover/active |
| `pt-btn-secondary` | Botão com fundo contextual suave |
| `pt-btn-ghost` | Sem fundo, hover aparece |
| `pt-input` | Input branco, radius 1rem, focus ring coral |
| `pt-label` | Label Jakarta semibold, texto-soft |
| `pt-badge` | Pill vibrante |
| `pt-tab` / `pt-tab-active` | Tab pills com transição |
| `pt-section-title` | Título de seção |
| `pt-skeleton` | Skeleton shimmer creme |

---

## Task 1: Foundation — Tailwind Config

**Files:**
- Modify: `frontend/tailwind.config.ts`

**What to do:**

Replace the entire color palette with Playground Tropical tokens. Keep fontFamily, borderRadius, and animation config but update shadow colors. Add new animation keyframes (bounce-in, confetti, pulse-badge, fade-slide-up).

**New color tokens to define:**

```
coral: '#FF6B4A'
coral-light: '#FFF5F2'
rosa: '#FF4E8C'
rosa-light: '#FFF0F5'
amarelo: '#FFB930'
amarelo-light: '#FFF8F0'
menta: '#2ED8A3'
menta-light: '#F0FFF8'
azul: '#4DA3FF'
azul-light: '#F0F6FF'
creme: '#FFF8F0'
creme-dark: '#FFF0E0'
texto: '#2D1B14'
texto-soft: '#8C7A6B'
texto-muted: '#B5A898'
branco: '#FFFFFF'
footer: '#2D1B14'
erro: '#E53935'
erro-light: '#FFEBEE'
```

Remove ALL old tokens (primary, secondary, tertiary, surface-*, on-*, outline-*, etc). The new system is simple and flat.

**New shadow colors:** Use `rgba(45,27,20,0.08)` base.

**New keyframes to ADD:**
- `bounceIn`: `0%{transform:scale(0)} 50%{transform:scale(1.08)} 75%{transform:scale(0.96)} 100%{transform:scale(1)}`
- `fadeSlideUp`: `from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)}`
- `pulseBadge`: `0%,100%{transform:scale(1)} 50%{transform:scale(1.25)}`
- `confettiBurst`: partícula saindo para cima + rotação + fade

**Verify:** `cd frontend && npx next build 2>&1 | tail -5` — expect compilation errors (tokens removed, pages still reference old ones). That's OK, we fix pages in later tasks.

---

## Task 2: Foundation — globals.css

**Files:**
- Modify: `frontend/src/app/globals.css`

**What to do:**

Complete rewrite. Replace ALL `:root` variables, body styles, and component classes.

**:root variables:**
```css
--color-coral: #FF6B4A;
--color-rosa: #FF4E8C;
--color-amarelo: #FFB930;
--color-menta: #2ED8A3;
--color-azul: #4DA3FF;
--color-creme: #FFF8F0;
--color-creme-dark: #FFF0E0;
--color-texto: #2D1B14;
--color-texto-soft: #8C7A6B;
--color-branco: #FFFFFF;
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

**body:** `background-color: #FFF8F0; color: #2D1B14;`

**New component classes (pt-*):** See design doc section 3 for full specs. Each class must use CSS custom properties, NOT @apply with custom Tailwind classes (dev server breaks with @apply on custom tokens).

**Remove:** All `jc-*` classes, `bg-mesh`, old scrollbar colors. Replace scrollbar with warm tones.

**Keep:** `.scroll-reveal`, `.scrollbar-hide`, `@keyframes shimmer` (update colors), Material Symbols base style (will remove in Task 8 when we remove the font).

**Verify:** Build won't pass yet (pages still reference jc-* classes). That's expected.

---

## Task 3: Layout — Remove Material Symbols font, update root layout

**Files:**
- Modify: `frontend/src/app/layout.tsx`

**What to do:**

- Remove the `<link>` tag that loads Material Symbols Outlined from Google Fonts CDN
- Update metadata (title, description) if needed
- Keep font imports (Jakarta + Vietnam) and providers exactly as-is

**Verify:** `npx next build` — still expect errors from pages referencing old classes. But layout.tsx should compile.

---

## Task 4: Landing Page — Complete Rewrite

**Files:**
- Rewrite: `frontend/src/app/page.tsx`
- Rewrite: `frontend/src/components/landing/Navbar.tsx`
- Rewrite: `frontend/src/components/landing/HeroSection.tsx`
- Rewrite: `frontend/src/components/landing/FeaturesSection.tsx`
- Rewrite: `frontend/src/components/landing/HowItWorksSection.tsx`
- Rewrite: `frontend/src/components/landing/TrustSection.tsx`
- Rewrite: `frontend/src/components/landing/PricingTeaser.tsx` → rename concept to `CTASection.tsx`
- Rewrite: `frontend/src/components/landing/Footer.tsx`
- Keep as-is: `frontend/src/components/landing/ScrollReveal.tsx` (IntersectionObserver logic stays)
- Delete: `frontend/src/components/landing/SectionDivider.tsx` (not needed — sections separated by bg color)
- Delete: `frontend/src/components/landing/SvgDecorations.tsx` (replaced by emoji floats)
- Delete: `frontend/src/components/landing/MitraLogo.tsx` (logo is now inline text "MITRA 🐾")

**Key rules:**
- Zero Lucide imports. Use emoji or inline SVG for arrows/chevrons.
- All text in PT-BR.
- Use new `pt-*` classes and Tailwind tokens (coral, rosa, etc).
- See design doc section 5 for exact structure of each section.
- Navbar: transparent → creme on scroll. Mobile hamburger fullscreen.
- Hero: blobs as CSS radial-gradients (not SVG). Emoji floats with `animate-float`.
- Features: 4 colored cards, stagger fadeSlideUp.
- How it works: 3 steps + dotted line.
- Trust: 3 badge pills, bounce-in.
- CTA: coral→rosa gradient, white button.
- Footer: dark warm bg.

**Verify:** `npx next build` — landing page route should compile. Other pages may still error.

---

## Task 5: Login Page

**Files:**
- Rewrite: `frontend/src/app/login/page.tsx`

**What to do:**

Preserve ALL functionality (useState, handleSubmit, useAuth, error display, dev credentials, Link to register). Only change visual.

- Fundo creme + CSS blob gradients (smaller than landing)
- Card branco central, radius 1.5rem, sombra
- "Bem-vindo de volta 🐾" Jakarta bold
- Inputs: pt-input, pt-label
- Button: pt-btn full-width
- Feature pills below: 🏥 Saúde · 📅 Agenda · 🤝 Guarda · 📖 Histórico
- fadeSlideUp on mount
- Remove ALL material-symbols-outlined usage (replace with emoji)
- Remove ALL Lucide imports

**Verify:** `npx next build` + test login flow works.

---

## Task 6: Register Page (3 steps)

**Files:**
- Rewrite: `frontend/src/app/register/page.tsx`
- Rewrite: `frontend/src/app/register/passo-2-tipo.tsx`
- Rewrite: `frontend/src/app/register/passo-3-profissional.tsx`

**Preserve:** ALL step logic, state management, validation, API calls, component props.

**Visual changes:**
- Fundo creme + blobs
- Stepper: 3 circles connected by line (coral=active, menta=done, creme=pending)
- Slide horizontal transition between steps
- Passo 2: 3 large cards with emoji + title + description. Selected = coral border + coral-light bg + ✓ menta
- All inputs: pt-input, pt-label, pt-btn
- Remove material-symbols-outlined references
- Remove old mitra-* and jc-* class references

**Verify:** `npx next build` + test 3-step flow.

---

## Task 7: Protected Layout + Home Dashboard

**Files:**
- Rewrite styles: `frontend/src/components/layout/ProtectedLayout.tsx`
- Rewrite styles: `frontend/src/app/home/page.tsx`

**ProtectedLayout:**
- Header: creme bg (not glassmorphism). Logo "MITRA 🐾" text. Bell icon = emoji 🔔 with badge pulsante.
- Sidebar/nav: same structure, warm colors.
- Remove material-symbols-outlined.

**Home Dashboard:**
- "Olá, [Nome]! 👋" header
- 2 action buttons: "🐾 Novo pet" (coral pt-btn) + "🔗 Vincular pet" (azul ghost)
- Pet cards: pt-card with foto, name, role badge (colored pill), indicators
- Role badge colors: coral=tutor, azul=vet, rosa=emergência, menta=passeador, amarelo=familiar
- Section backgrounds: Meus pets creme, Compartilhado azul-light, Prestador menta-light, Convites rosa-light
- Stagger fadeSlideUp 80ms
- Empty state: 🐾 big + CTA
- Remove ALL material-symbols-outlined and Lucide
- Replace ROLE_STYLE colors with new palette

**Verify:** `npx next build` + visual check.

---

## Task 8: Pet Detail Layout + Home Tab

**Files:**
- Rewrite styles: `frontend/src/app/pets/[id]/layout.tsx`
- Rewrite styles: `frontend/src/app/pets/[id]/page.tsx`

**Layout:**
- Keep original structure (header + top tabs + content)
- Header: ← "Meus pets" (inline SVG arrow, not material symbol), pet name, badge
- Pet hero: emoji + nome.toUpperCase() — use new texto color
- Tab pills: pt-tab / pt-tab-active. Active = coral bg + white text
- Bg: creme
- Remove material-symbols-outlined

**Page (Home tab):**
- Alertas: pt-card with left border 4px colored (amarelo=warning, rosa=urgent)
- "Sobre o pet": pt-card, stats in colored mini-cards
- "Hoje": pt-card, items with emoji + colored pill
- Calendar: pt-card, dots colored (rosa=vacina, menta=medicamento, amarelo=guarda, azul=compromisso)
- Compromissos: pt-card, emoji icons
- Atividade recente: pt-card, timeline
- Replace ALL jc-* with pt-*, stone-* with creme/texto-soft, mitra-* with coral
- Replace material-symbols-outlined expand_more with emoji ▼ or inline SVG
- Replace ChevronDown lucide with inline SVG or emoji

**Verify:** `npx next build` + visual check pet detail.

---

## Task 9: Pet Sub-pages (Saúde, Guarda, Histórico, Perfil, Agenda, Diário)

**Files:**
- Rewrite styles: `frontend/src/app/pets/[id]/saude/page.tsx`
- Rewrite styles: `frontend/src/app/pets/[id]/guarda/page.tsx`
- Rewrite styles: `frontend/src/app/pets/[id]/historico/page.tsx`
- Rewrite styles: `frontend/src/app/pets/[id]/perfil/page.tsx`
- Rewrite styles: `frontend/src/app/pets/[id]/agenda/page.tsx`
- Rewrite styles: `frontend/src/app/pets/[id]/diario/page.tsx`
- Rewrite styles: `frontend/src/app/pets/[id]/registrar-consulta/page.tsx`

**For each:** Replace jc-* → pt-*, old color tokens → new tokens, material-symbols → emoji/SVG, stone-* → creme/texto-soft.

**Contextual colors per page:**
- Saúde: rosa theme
- Guarda: menta theme
- Histórico: amarelo theme
- Perfil: coral theme
- Agenda: azul theme
- Diário: amarelo theme

**Verify:** `npx next build` — all routes should compile.

---

## Task 10: Shared Components

**Files:**
- Rewrite styles: `frontend/src/components/BottomSheet.tsx`
- Rewrite styles: `frontend/src/components/RegisterEventModal.tsx`
- Rewrite styles: `frontend/src/components/PetImage.tsx`
- Rewrite styles: `frontend/src/components/Toast.tsx` (replace Lucide icons with emoji: ✅ ⚠️ ❌ ℹ️)
- Rewrite styles: `frontend/src/components/CalendarMonth.tsx`
- Rewrite styles: `frontend/src/components/pet/SaudeSheet.tsx`
- Rewrite styles: `frontend/src/components/pet/PessoasSheet.tsx`
- Rewrite styles: `frontend/src/components/pet/AtividadeSheet.tsx`

**For each:** jc-* → pt-*, remove Lucide/Material Symbols, apply warm colors.

**Verify:** `npx next build` — zero errors expected.

---

## Task 11: Minor Pages

**Files:**
- Rewrite styles: `frontend/src/app/home/novo-pet/page.tsx`
- Rewrite styles: `frontend/src/app/home/vincular-pet/page.tsx`
- Rewrite styles: `frontend/src/app/minha-conta/page.tsx`

**Pattern:** Fundo creme, pt-card central, pt-input/pt-label, pt-btn coral. Títulos com emoji.

**Verify:** `npx next build` — all clean.

---

## Task 12: Role-specific Pages (Prestador + Visitante)

**Files:**
- Rewrite styles: `frontend/src/app/prestador/layout.tsx`
- Rewrite styles: `frontend/src/app/prestador/pets/page.tsx`
- Rewrite styles: `frontend/src/app/prestador/pets/[id]/page.tsx`
- Rewrite styles: `frontend/src/app/visitante/layout.tsx`
- Rewrite styles: `frontend/src/app/visitante/pets/page.tsx`
- Rewrite styles: `frontend/src/app/visitante/pets/[id]/page.tsx`
- Rewrite styles: `frontend/src/app/visitante/convites/page.tsx`

**Pattern:** Same as app pages — pt-* classes, warm colors, emojis.

**Verify:** `npx next build` — zero errors. ALL 21 routes compile.

---

## Task 13: Final Cleanup + Verification

**Files:**
- Check: `frontend/package.json` — lucide-react can be removed from dependencies
- Check: ALL files with `grep -r "material-symbols\|lucide\|jc-\|mitra-\|stone-" src/`
- Check: `npx next build` — zero errors, all routes

**Steps:**
1. `npm uninstall lucide-react` (if no remaining imports)
2. Grep for any remaining old tokens/classes
3. Fix any stragglers
4. Full build verification
5. Visual spot-check of key pages (landing, login, home, pet detail)

**Verify:** Clean build, zero old tokens, consistent visual.
