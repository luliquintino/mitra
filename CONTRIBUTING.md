# Contribuindo com o MITRA

Obrigado pelo interesse em contribuir com o MITRA! Este guia explica como configurar o ambiente, os padroes de desenvolvimento e o fluxo de contribuicao.

## Requisitos

- Node.js 18+
- PostgreSQL 16+
- npm 9+

## Configurando o Ambiente

### 1. Clone o repositorio

```bash
git clone https://github.com/seu-usuario/mitra.git
cd mitra
```

### 2. Instale as dependencias

```bash
npm run install:all
```

### 3. Configure o banco de dados

```bash
# Copie os arquivos de ambiente
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edite backend/.env com sua DATABASE_URL

# Aplique as migrations e seed
cd backend
npx prisma migrate dev
npm run db:seed
cd ..
```

### 4. Inicie os servidores

```bash
# Terminal 1 — Backend
npm run dev:backend

# Terminal 2 — Frontend
npm run dev:frontend
```

O frontend roda em `http://localhost:3001` e o backend em `http://localhost:3000`.

### Alternativa: Docker Compose

```bash
docker compose up
```

## Rodando os Testes

```bash
# Testes unitarios do backend
cd backend && npm test

# Testes unitarios do frontend
cd frontend && npm test

# Testes de integracao do backend (requer banco de teste)
cd backend && npm run test:e2e

# Testes E2E (requer backend + frontend rodando)
npm run test:e2e
```

## Padrao de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/) em portugues:

```
tipo(escopo): descricao curta

Corpo opcional com mais detalhes.
```

### Tipos

| Tipo | Descricao |
|------|-----------|
| `feat` | Nova funcionalidade |
| `fix` | Correcao de bug |
| `docs` | Apenas documentacao |
| `style` | Formatacao (sem mudanca de logica) |
| `refactor` | Refatoracao (sem nova feature nem fix) |
| `test` | Adicao ou correcao de testes |
| `chore` | Tarefas de build, CI, configs |

### Exemplos

```
feat(auth): adicionar login com Google
fix(health): corrigir calculo de dose vencida
docs: atualizar README com instrucoes de Docker
test(pets): adicionar testes unitarios do PetsService
```

## Fluxo de Pull Request

1. Crie uma branch a partir de `main`:
   ```bash
   git checkout -b feat/minha-feature
   ```

2. Faca seus commits seguindo o padrao acima.

3. Garanta que todos os testes passam:
   ```bash
   npm run lint
   cd backend && npm test
   cd ../frontend && npm test
   ```

4. Abra um Pull Request no GitHub com:
   - Titulo claro descrevendo a mudanca
   - Descricao do que foi feito e por que
   - Screenshots se houver mudancas visuais
   - Referencia a issues relacionadas (`Closes #123`)

5. Aguarde a revisao. Responda aos comentarios e faca ajustes se necessario.

## Estrutura do Projeto

```
mitra/
├── backend/          # API NestJS
│   ├── src/
│   │   ├── auth/         # Autenticacao (JWT)
│   │   ├── pets/         # Gestao de pets
│   │   ├── health/       # Saude (vacinas, medicamentos, sintomas)
│   │   ├── custody/      # Guarda e custodia
│   │   ├── governance/   # Governanca (tutores, arquivamento)
│   │   ├── events/       # Timeline de eventos
│   │   ├── notifications/ # Notificacoes
│   │   ├── compromissos/ # Agenda
│   │   ├── prestadores/  # Prestadores de servico
│   │   └── prisma/       # Camada de banco de dados
│   └── prisma/
│       └── schema.prisma # Schema do banco
├── frontend/         # App Next.js 14
│   └── src/
│       ├── app/          # Paginas (App Router)
│       ├── components/   # Componentes reutilizaveis
│       ├── contexts/     # Providers (Auth, Notificacoes)
│       ├── lib/          # API client, utils, mock data
│       └── types/        # Interfaces TypeScript
├── e2e/              # Testes E2E (Playwright)
└── docs/             # Documentacao
```

## Padroes de Codigo

- **TypeScript** em todo o projeto
- **Prettier** para formatacao (single quotes, trailing commas)
- **ESLint** para linting
- Nomes de variaveis e funcoes em **ingles** no codigo
- Strings visíveis ao usuario em **portugues (PT-BR)**
- Componentes React como **functional components** com hooks

## Codigo de Conduta

Este projeto segue o [Codigo de Conduta](CODE_OF_CONDUCT.md). Ao participar, voce concorda em manter um ambiente respeitoso e inclusivo.

## Licenca

Ao contribuir com o MITRA, voce concorda que suas contribuicoes serao licenciadas sob a mesma [licenca dual](LICENSE) do projeto.

## Duvidas?

Abra uma issue no GitHub ou entre em contato pelo email contato@mitra.pet.
