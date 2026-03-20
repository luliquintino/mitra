# Playground Tropical — MITRA Design System

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesenhar todo o frontend do MITRA com estética "Playground Tropical" — sofisticado, muito colorido, bouncy, Duolingo-energy. Consistência total entre landing e app.

**Architecture:** CSS-only animations (zero libs externas). Tailwind tokens + CSS custom properties. Componentes React existentes reestilizados, não recriados.

**Tech Stack:** Next.js 14, Tailwind CSS, Plus Jakarta Sans + Be Vietnam Pro, CSS @keyframes, IntersectionObserver para scroll reveals.

---

## 1. Paleta de Cores

### 5 Cores Heróis

| Token | Hex | Uso |
|-------|-----|-----|
| `coral` | `#FF6B4A` | CTA primário, energia, ação |
| `rosa` | `#FF4E8C` | Saúde, amor, alertas carinhosos |
| `amarelo` | `#FFB930` | Destaques, badges, sucesso |
| `menta` | `#2ED8A3` | Confirmação, status ok, natureza |
| `azul` | `#4DA3FF` | Links, informação, agenda |

### Superfícies

| Token | Hex | Uso |
|-------|-----|-----|
| `creme` | `#FFF8F0` | Fundo base de tudo |
| `creme-dark` | `#FFF0E0` | Cards, containers, insets |
| `branco` | `#FFFFFF` | Inputs, cards elevados |
| `texto` | `#2D1B14` | Headings, body |
| `texto-soft` | `#8C7A6B` | Placeholders, labels |
| `footer-bg` | `#2D1B14` | Footer escuro |

### Cores Contextuais (fundo suave + cor vibrante)

| Contexto | Fundo | Cor |
|----------|-------|-----|
| Saude | `#FFF0F5` | `#FF4E8C` |
| Agenda | `#F0F6FF` | `#4DA3FF` |
| Guarda | `#F0FFF8` | `#2ED8A3` |
| Historico | `#FFF8F0` | `#FFB930` |
| Governanca | `#FFF5F2` | `#FF6B4A` |

### Regras

- **Zero cinza puro.** Todo neutro e um tint quente.
- **Sem bordas 1px.** Limites por mudanca de cor de fundo ou sombra.

---

## 2. Tipografia

- **Headlines:** Plus Jakarta Sans (700, 800). Letter-spacing tight (-0.025em).
- **Body:** Be Vietnam Pro (400, 500). Line-height 1.6.
- **Escala:** Display 3.5rem > H1 2rem > H2 1.5rem > Body 1rem > Caption 0.75rem.
- **Regra:** Headlines em Jakarta, body em Vietnam. Sempre.

---

## 3. Componentes

### Botoes

- **Primario:** `bg-coral`, texto branco, pill (9999px), padding 14px 28px, hover scale(1.05), active scale(0.92) bounce-back.
- **Secundario:** fundo contextual suave, texto cor vibrante, mesmas animacoes.
- **Ghost:** sem fundo, texto colorido, hover fundo aparece fade 200ms.

### Cards

- **Padrao:** bg branco, radius 1.5rem, sombra `0 4px 20px rgba(45,27,20,0.08)`, hover sombra cresce + translateY(-2px).
- **Colorido:** fundo contextual suave, emoji grande no topo, sem sombra.
- **Pet card:** foto rounded, badge role vibrante, hover scale(1.02).

### Inputs

- Fundo branco, radius 1rem, sem borda, focus ring 2px coral.
- Label: Jakarta semibold, cor `#8C7A6B`, uppercase.

### Badges/Pills

- Radius 9999px, fundo vibrante, Jakarta bold 0.75rem uppercase.

### Tab Pills

- Active: fundo cor vibrante + texto branco, scale(1.1).
- Inactive: texto `#8C7A6B`, hover fundo suave.

### Icones

- Emojis como padrao para contextos de pet.
- SVG inline simples para navegacao (setas, +, sino).
- Eliminar Material Symbols e Lucide.

---

## 4. Animacoes & Micro-interacoes

CSS-only. Zero bibliotecas externas.

### Easing

- `--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)` — spring com overshoot.

### Keyframes

```
bounce-in:      scale(0) → scale(1.08) → scale(0.96) → scale(1)        [400ms]
wiggle:         rotate(0) → rotate(-5deg) → rotate(5deg) → rotate(0)    [300ms]
pulse-badge:    scale(1) → scale(1.25) → scale(1)                       [600ms]
float:          translateY(0) → translateY(-10px) → translateY(0)        [6s infinite]
confetti:       translateY(0) → translateY(-200px) + rotate(720deg) + opacity(0) [1s]
shimmer:        backgroundPosition -200% → 200%                          [1.5s infinite]
fade-slide-up:  opacity(0) translateY(20px) → opacity(1) translateY(0)   [500ms]
```

### Por Acao

- **Botoes:** hover scale(1.05) 200ms, active scale(0.92) 100ms → bounce 300ms.
- **Cards:** hover translateY(-3px) + sombra cresce 250ms.
- **Listas:** stagger fadeSlideUp 80ms entre itens (max 6).
- **Tabs:** active pill scale(1.1) + cor muda 200ms.
- **Scroll:** IntersectionObserver trigger fadeSlideUp.
- **Emojis decorativos:** float suave 6s infinite.

### Momentos Especiais

- **Sucesso (cadastro pet):** confetti burst de emojis + bounce-in do card.
- **Notificacao:** slide-in do topo com bounce + badge pulsa 2x.
- **Loading:** skeleton shimmer creme (#FFF0E0 → #FFE8CC → #FFF0E0).

### Regra

- Textos nunca animam sozinhos (so o container).
- Inputs: so focus ring.
- Listas >10 itens: stagger so nos primeiros 6.

---

## 5. Landing Page

### Estrutura

```
page.tsx
  ├── <Navbar />              — sticky, transparente → creme no scroll
  ├── <HeroSection />         — 100vh, blobs, headline stagger, 2 CTAs
  ├── <ProblemaSection />     — fundo creme-dark, 3 pain points
  ├── <FeaturesSection />     — 4 cards coloridos 2x2, scroll reveal
  ├── <HowItWorksSection />   — 3 passos, linha pontilhada coral
  ├── <TrustSection />        — 3 badges bounce-in
  ├── <CTASection />          — gradiente coral→rosa, CTA branco
  └── <Footer />              — fundo marrom escuro
```

### Navbar

- Fundo transparente no hero → `#FFF8F0` ao scrollar (300ms).
- Logo: "MITRA 🐾" Jakarta bold.
- Botoes: "Entrar" ghost + "Comecar gratis" coral pill.
- Mobile: hamburger → fullscreen menu creme, itens centralizados.

### Hero (100vh)

- Fundo creme + blobs coloridos desfocados (coral, rosa, amarelo, menta).
- Headline 3.5rem→5rem: "Todo o cuidado que seu pet merece. Em um so lugar."
- Subtitulo 1.25rem: "Saude, agenda, guarda compartilhada e historico — organizado com carinho."
- 2 CTAs: "Comecar gratis 🐾" coral + "Como funciona ↓" ghost.
- Emojis flutuantes: 🐶 🐱 🐾 💛 nos cantos, animacao float.
- Stagger: headline → subtitulo → CTAs com 150ms delay.

### Problema → Solucao

- Fundo `#FFF0E0`.
- Headline: "Cuidar de um pet e lindo. Organizar tudo... nem tanto."
- 3 pain points: 📋 + 🤝 + 📱 com texto curto.
- Transicao: "O MITRA resolve tudo isso →"

### Features (4 pilares)

- Grid 2x2 (mobile: stack).
- Cards coloridos: Saude rosa, Agenda azul, Guarda verde, Historico amarelo.
- Cada card: emoji 3rem + titulo bold + 2-3 bullets.
- fadeSlideUp stagger.

### Como Funciona (3 passos)

- Fundo `#FFF0E0`.
- 3 passos horizontais (mobile: vertical) + linha pontilhada coral.
- Circulos numerados coral + titulo + descricao.
- Stagger 200ms.

### Confianca

- 3 pills grandes: 🔒 Dados seguros · 💚 Gratuito · 📱 Multi-dispositivo.
- bounce-in stagger.

### CTA Final

- Gradiente coral → rosa diagonal.
- Headline branca: "Seu pet merece o melhor cuidado."
- Botao grande branco: "Criar conta gratis 🐾"

### Footer

- Fundo `#2D1B14`, logo branco, links, "Feito com 💛 para pets".

---

## 6. Paginas do App

### Login

- Fundo creme + blobs menores.
- Card branco central, radius 1.5rem, sombra suave.
- "Bem-vindo de volta 🐾" Jakarta bold.
- Inputs clean, botao coral full-width bouncy.
- Feature pills coloridas embaixo: 🏥 · 📅 · 🤝 · 📖
- fadeSlideUp ao montar.

### Register (3 passos)

- Fundo creme + blobs.
- Stepper: 3 circulos (coral=ativo, menta=feito, creme=pendente) + linha.
- Transicao slide horizontal entre passos.
- Passo 2 (tipo): 3 cards grandes com emoji, selected = borda coral + fundo rosa suave + checkmark.

### Home (Dashboard)

- Header: "Ola, [Nome]! 👋" + sino com badge pulsante.
- 2 botoes: "🐾 Novo pet" coral + "🔗 Vincular pet" azul ghost.
- Grid de pet cards brancos: foto + nome + badge role + indicadores.
- Secoes separadas por fundo:
  - Meus pets: `#FFF8F0`
  - Acesso compartilhado: `#F0F6FF`
  - Como prestador: `#F0FFF8`
  - Convites: banner `#FFF0F5` + 💌
- Estado vazio: 🐾 grande + CTA.
- Stagger fadeSlideUp 80ms nos cards.

### Pet Detail (/pets/[id])

- **Mantem estrutura original** (header sticky + tabs horizontais no topo).
- Header: ← "Meus pets" + nome pet uppercase + badge status.
- Tab pills: Active coral + texto branco. Mantém: Home, Saude, Guarda, Historico, Perfil.
- Tab Home: alertas coloridos, "Sobre o pet" card, "Hoje", Calendario, Compromissos, Atividade recente.
- Cores contextuais por tab: rosa=saude, verde=guarda, amarelo=historico.
- Cards brancos, emojis, pills vibrantes.

### Paginas menores

- Mesmo padrao: fundo creme, card branco, inputs clean.
- Titulos com emoji.
- Submit: loading spinner → checkmark verde bounce.

---

## 7. Consistencia Global

- **Mesmo fundo creme** em TODA pagina.
- **Mesmos botoes bouncy** em todo lugar.
- **Mesmas cores contextuais** (rosa=saude, azul=agenda, verde=guarda, amarelo=historico, coral=acao).
- **Emojis como icones** em todo o app.
- **Sem bordas 1px** — cor de fundo e sombras.
- **Eliminar** Material Symbols e Lucide React.

---

## 8. Constraints

- Zero bibliotecas externas de animacao (CSS-only).
- Zero imagens externas (SVG inline + emojis only).
- Preservar toda funcionalidade existente (auth, forms, API calls).
- PT-BR em todo conteudo.
- Performance: Lighthouse >90.
- Manter fonts existentes (Jakarta + Vietnam), apenas reconfigurar tokens.
