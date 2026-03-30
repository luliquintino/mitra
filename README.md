# MITRA — Gestao Colaborativa de Pets

<p align="center">
  <strong>Plataforma open source de gestao de pets com foco em guarda compartilhada, transparencia e rede de cuidado.</strong>
</p>

<p align="center">
  <a href="#funcionalidades">Funcionalidades</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#setup-manual">Setup Manual</a> •
  <a href="#testes">Testes</a> •
  <a href="#documentacao">Documentacao</a> •
  <a href="#licenca">Licenca</a>
</p>

---

## Sobre

MITRA e uma plataforma web completa para gestao colaborativa de pets. Permite que tutores, prestadores de servico (veterinarios, passeadores, pet sitters) e visitantes (familiares, amigos) compartilhem informacoes e cuidados de forma organizada e transparente.

Ideal para:
- **Guarda compartilhada** — dois tutores gerenciando o mesmo pet
- **Rede de cuidado** — prestadores de servico com acesso controlado
- **Transparencia** — historico imutavel de todas as acoes
- **ONGs e abrigos** — gestao de multiplos animais (licenca gratuita)

## Funcionalidades

### Para Tutores
- Cadastro e perfil completo do pet (10 especies)
- Painel de saude: vacinas, medicamentos, sintomas, plano de saude
- Agenda de compromissos com recorrencia
- Guarda compartilhada com governanca (votacao, solicitacoes com expiracao em 48h)
- Mural de fotos e atualizacoes
- Smart cards com alertas priorizados (vacina vencendo, medicamento acabando)
- Sistema de conquistas (12 badges em 4 categorias)
- Personalidade dinamica do pet baseada em atividade

### Para Prestadores
- Dashboard com pets atendidos
- Permissoes configuradas por tutor (visualizar, registrar servico, anexar documento)
- Registro de visitas, sessoes, check-in/out
- Briefing automatico com status de saude do pet

### Para Visitantes
- Acesso somente leitura, convite por tutor
- Permissoes granulares (dados basicos, historico vacinacao, medicamentos, etc)
- Auto-revogacao (visitante pode sair a qualquer momento)

### Governanca
- Maximo 2 tutores principais + 2 tutores de emergencia por pet
- Acoes criticas exigem consenso de todos os tutores principais
- Solicitacoes expiram em 48h automaticamente
- Historico de eventos imutavel
- Arquivamento/reativacao de pet com aprovacao

## Stack Tecnica

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js 18+ · NestJS · TypeScript |
| ORM | Prisma |
| Banco de dados | PostgreSQL 16 |
| Autenticacao | JWT (access + refresh) · Argon2 |
| Frontend | Next.js 14 · TypeScript · TailwindCSS |
| API | REST · prefixo `/api/v1` |
| Testes | Jest · Testing Library · Playwright |
| CI/CD | GitHub Actions |

## Quick Start

### Com Docker Compose

```bash
git clone https://github.com/seu-usuario/mitra.git
cd mitra

# Iniciar PostgreSQL + backend + frontend
docker-compose up -d

# Rodar migrations e seed
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

Acesse: http://localhost:3001

### Usuarios de teste

| E-mail | Senha | Tipo | Pets |
|--------|-------|------|------|
| ana@mitra.com | Mitra@2024 | Tutor | Luna, Mochi |
| carlos@mitra.com | Mitra@2024 | Tutor | Luna |
| beatriz@mitra.com | Mitra@2024 | Tutor | Mochi (emergencia) |
| pedro@mitra.com | 123456 | Prestador | — |
| joao@mitra.com | 123456 | Prestador | — |

## Setup Manual

### Pre-requisitos

- Node.js 18+
- PostgreSQL 16+
- npm

### 1. Backend

```bash
cd backend
npm install

# Configurar .env (copiar de .env.example)
cp .env.example .env
# Editar DATABASE_URL com suas credenciais PostgreSQL

# Aplicar migrations
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate

# Popular dados de teste
npx prisma db seed

# Iniciar (porta 3000)
npm run start:dev
```

API: http://localhost:3000/api/v1
Swagger: http://localhost:3000/api/docs

### 2. Frontend

```bash
cd frontend
npm install

# Iniciar (porta 3001)
npm run dev
```

App: http://localhost:3001

### Variaveis de Ambiente

**Backend (`.env`)**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/mitra_db?schema=public"
JWT_SECRET=troque_em_producao
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=troque_em_producao
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGINS=http://localhost:3001
```

**Frontend (`.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## Testes

```bash
# Backend — unit tests
cd backend && npm test

# Backend — unit tests com cobertura
npm test -- --coverage

# Frontend — unit tests
cd frontend && npm test

# Frontend — com cobertura
npm run test:coverage

# Linting
npm run lint          # raiz (ambos)
npx prettier --check .
```

## Estrutura do Projeto

```
Mitra/
├── backend/                 # NestJS API
│   ├── prisma/              # Schema, migrations, seed
│   ├── src/
│   │   ├── auth/            # Autenticacao (JWT, refresh, registro)
│   │   ├── pets/            # CRUD pets, dashboard, codigo
│   │   │   ├── prestadores/ # Convite/gestao de prestadores por pet
│   │   │   ├── visitantes/  # Convite/gestao de visitantes por pet
│   │   │   └── registros/   # Registros de servico/observacao
│   │   ├── health/          # Vacinas, medicamentos, sintomas, plano
│   │   ├── custody/         # Guardas, solicitacoes, temporarias
│   │   ├── governance/      # Tutores, arquivamento, reativacao
│   │   ├── events/          # Historico imutavel
│   │   ├── notifications/   # Notificacoes in-app
│   │   ├── compromissos/    # Agenda recorrente + guardas auto
│   │   ├── prestadores/     # Perfil profissional
│   │   ├── users/           # Perfil usuario, feedback
│   │   ├── prisma/          # PrismaService
│   │   └── common/          # Decorators, guards, utils
│   └── test/                # Test utils, E2E config
├── frontend/                # Next.js 14 App
│   └── src/
│       ├── app/             # App Router pages
│       │   ├── login/
│       │   ├── register/
│       │   ├── home/
│       │   ├── pets/[id]/   # 9 tabs (saude, guarda, historico, etc)
│       │   ├── prestador/   # Area do prestador
│       │   ├── visitante/   # Area do visitante
│       │   └── pet-publico/ # Pagina publica por codigo
│       ├── components/      # UI components
│       ├── contexts/        # AuthContext, NotificacaoContext
│       ├── lib/             # API client, utils, engines
│       └── types/           # TypeScript interfaces
├── docs/                    # Documentacao tecnica
├── .github/                 # CI/CD, templates
├── LICENSE                  # Licenca dual
├── CONTRIBUTING.md          # Guia de contribuicao
├── CODE_OF_CONDUCT.md       # Codigo de conduta
└── SECURITY.md              # Politica de seguranca
```

## Documentacao

- [Arquitetura](docs/ARCHITECTURE.md) — Visao geral, modulos, fluxo de auth, banco de dados
- [API Reference](docs/API.md) — Endpoints completos com exemplos
- [Deploy](docs/DEPLOY.md) — Guia de deploy (Vercel, Docker, VPS)
- [Contributing](CONTRIBUTING.md) — Como contribuir
- [Security](SECURITY.md) — Politica de seguranca

## Licenca

MITRA usa uma **licenca dual**:

- **Gratuito** para ONGs, abrigos, projetos sem fins lucrativos e uso educacional
- **Acordo comercial** necessario para uso com fins lucrativos

Veja [LICENSE](LICENSE) para detalhes completos.

## Contribuindo

Contribuicoes sao bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para:
- Setup do ambiente de desenvolvimento
- Convencoes de commit
- Fluxo de pull requests
- Como rodar testes

## Contato

- Issues: [GitHub Issues](https://github.com/seu-usuario/mitra/issues)
- Seguranca: seguranca@mitra.pet (veja [SECURITY.md](SECURITY.md))
