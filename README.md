# 🐾 MITRA — Gestão completa do pet

Plataforma web de gestão do pet focada em organização, transparência e tranquilidade — especialmente para guarda compartilhada.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js · NestJS · TypeScript |
| ORM | Prisma |
| Banco | PostgreSQL |
| Auth | JWT + Refresh Token · Argon2 |
| Frontend | Next.js 14 · TypeScript · TailwindCSS |
| API | REST · versionada `/api/v1` |

---

## Estrutura do monorepo

```
Mitra/
├── backend/          # NestJS API
│   ├── prisma/       # Schema + Seed
│   └── src/
│       ├── auth/
│       ├── pets/
│       ├── health/
│       ├── custody/
│       ├── events/
│       ├── governance/
│       ├── notifications/
│       ├── users/
│       └── prisma/
└── frontend/         # Next.js App
    └── src/
        ├── app/
        │   ├── login/
        │   ├── register/
        │   ├── home/
        │   └── pets/[id]/
        │       ├── page.tsx     (Home do pet)
        │       ├── saude/
        │       ├── guarda/
        │       ├── historico/
        │       └── perfil/
        ├── components/
        ├── contexts/
        ├── lib/
        └── types/
```

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente (ou Docker)
- npm ou pnpm

---

## 🚀 Como rodar localmente

### 1. Clone o projeto

```bash
cd /Users/luizaquintino/Desktop/Mitra
```

### 2. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar banco de dados
# Certifique-se que o PostgreSQL está rodando e crie o banco:
# psql -U postgres -c "CREATE DATABASE mitra_db;"

# Rodar migrations
npm run db:migrate

# Gerar client do Prisma
npm run db:generate

# Popular com dados de exemplo
npm run db:seed

# Iniciar backend (porta 3000)
npm run start:dev
```

Backend disponível em: http://localhost:3000/api/v1
Swagger UI em: http://localhost:3000/api/docs

### 3. Frontend

```bash
# Em outro terminal, da pasta raiz:
cd frontend

# Instalar dependências
npm install

# Iniciar frontend (porta 3001)
npm run dev
```

Frontend disponível em: http://localhost:3001

---

## 👤 Usuários de teste (seed)

| E-mail | Senha | Pets |
|--------|-------|------|
| ana@mitra.com | Mitra@2024 | Luna (principal), Mochi (principal) |
| carlos@mitra.com | Mitra@2024 | Luna (principal) |
| beatriz@mitra.com | Mitra@2024 | Mochi (emergência) |

---

## 🐘 Banco de dados (Docker rápido)

Se não tiver PostgreSQL instalado:

```bash
docker run -d \
  --name mitra-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mitra_db \
  -p 5432:5432 \
  postgres:16-alpine
```

---

## 📡 Endpoints da API

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/v1/auth/register | Registrar |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/logout | Logout |
| POST | /api/v1/auth/refresh | Renovar token |
| GET  | /api/v1/auth/me | Usuário atual |

### Pets
| Método | Rota | Descrição |
|--------|------|-----------|
| GET  | /api/v1/pets | Listar pets do usuário |
| POST | /api/v1/pets | Criar pet |
| GET  | /api/v1/pets/:id | Detalhe do pet |
| PUT  | /api/v1/pets/:id | Atualizar pet |
| GET  | /api/v1/pets/:id/dashboard | Dashboard do pet |

### Saúde
```
GET/POST  /api/v1/pets/:id/health/vacinas
GET/POST  /api/v1/pets/:id/health/medicamentos
POST      /api/v1/pets/:id/health/medicamentos/:medId/administrar
GET/POST  /api/v1/pets/:id/health/sintomas
GET/PUT   /api/v1/pets/:id/health/plano-saude
```

### Guarda
```
GET       /api/v1/pets/:id/custody/guardas
GET/POST  /api/v1/pets/:id/custody/solicitacoes
POST      /api/v1/pets/:id/custody/solicitacoes/:id/responder
```

### Histórico
```
GET       /api/v1/pets/:id/events/historico
```

### Governança
```
GET/POST  /api/v1/pets/:id/governance/tutores
POST      /api/v1/pets/:id/governance/arquivar
POST      /api/v1/pets/:id/governance/reativar
```

---

## 🗄️ Modelos de banco

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Contas dos tutores |
| `pets` | Cadastro dos pets |
| `pet_usuarios` | Vínculo tutor ↔ pet (com role) |
| `vacinas` | Histórico de vacinação |
| `medicamentos` | Medicamentos ativos e histórico |
| `administracoes_med` | Registro de cada dose administrada |
| `sintomas` | Sintomas observados |
| `planos_saude` | Plano de saúde do pet |
| `guardas` | Períodos de guarda |
| `solicitacoes` | Solicitações de alteração (governança) |
| `eventos` | Linha do tempo imutável |
| `notificacoes` | Notificações por usuário |
| `audit_logs` | Log de auditoria admin |
| `feedbacks` | Feedbacks dos usuários |

---

## ⚖️ Regras de governança

- Cada pet: máx 2 tutores principais + 2 tutores de emergência
- Ações críticas exigem validação de todos os tutores principais
- Solicitações expiram em **48 horas** automaticamente
- Nunca aprovação automática
- Status ao expirar: `EXPIRADA` (nova solicitação deve ser criada)

---

## 📋 Histórico

- Eventos **nunca** são deletados ou editados
- Correções criam nova versão do evento
- Edições admin são registradas em `audit_logs` (não aparecem no histórico)

---

## Variáveis de ambiente

### Backend (`.env`)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mitra_db?schema=public"
JWT_SECRET=mitra_dev_jwt_secret_troque_em_producao
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=mitra_dev_refresh_secret_troque_em_producao
JWT_REFRESH_EXPIRATION=7d
CORS_ORIGINS=http://localhost:3001
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```
