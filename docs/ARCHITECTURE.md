# Arquitetura do MITRA

## Visao Geral

MITRA e um monorepo com duas aplicacoes: um backend REST API (NestJS) e um frontend SPA (Next.js 14). Comunicam via HTTP com autenticacao JWT.

```
┌──────────────┐     HTTP/JSON     ┌──────────────────┐     SQL      ┌──────────────┐
│   Next.js    │ ◄──────────────► │    NestJS API     │ ◄──────────► │  PostgreSQL  │
│  (porta 3001)│                  │   (porta 3000)    │              │              │
└──────────────┘                  └──────────────────┘              └──────────────┘
```

## Backend (NestJS)

### Modulos

| Modulo | Responsabilidade | Dependencias |
|--------|-----------------|-------------|
| **Auth** | Registro, login, logout, refresh token, getMe | PrismaService, JwtService |
| **Pets** | CRUD pets, dashboard, codigo unico, vinculacao | PrismaService |
| **Health** | Vacinas, medicamentos, sintomas, plano de saude | PrismaService, PetsService |
| **Custody** | Guardas, solicitacoes, guardas temporarias | PrismaService, PetsService |
| **Governance** | Tutores, arquivamento/reativacao de pet | PrismaService, PetsService |
| **Events** | Historico imutavel de eventos agrupado por mes | PrismaService, PetsService |
| **Notifications** | CRUD notificacoes, contagem nao lidas | PrismaService |
| **Compromissos** | Agenda recorrente, geracao automatica de guardas | PrismaService, PetsService |
| **Prestadores** | Perfil profissional, listagem | PrismaService |
| **Pet-Prestadores** | Convite/aceite/revogacao de prestador por pet | PrismaService, NotificationsService |
| **Pet-Visitantes** | Convite/aceite/revogacao de visitante por pet | PrismaService, NotificationsService |
| **Registros** | Registros de servico e observacoes | PrismaService |
| **Users** | Perfil usuario, feedback | PrismaService |

### Fluxo de Autenticacao

```
1. POST /auth/register → cria usuario + hash senha (argon2) → gera JWT pair
2. POST /auth/login → verifica senha → gera JWT pair
3. Requests autenticados → Authorization: Bearer {accessToken}
4. POST /auth/refresh → verifica refresh token → gera novo JWT pair
5. POST /auth/logout → remove refresh token do banco
```

**Tokens:**
- Access Token: 15min, contem `{ sub: userId, email, tipoUsuario }`
- Refresh Token: 7 dias, hash armazenado no banco (argon2)

### Guards e Decorators

- `JwtAuthGuard` — valida access token
- `JwtRefreshGuard` — valida refresh token
- `@CurrentUser('sub')` — extrai userId do token
- `PetsService.checkAccess()` — verifica se usuario tem vinculo ativo com o pet

### Controle de Acesso

```
Tutor Principal    → acesso total ao pet
Tutor Emergencia   → acesso total ao pet
Prestador          → permissoes configuradas por pet (VISUALIZAR, REGISTRAR_SERVICO, etc)
Visitante          → somente leitura, permissoes configuradas por pet
```

## Banco de Dados

### Diagrama ER (Simplificado)

```
Usuario ──┬── PetUsuario ──── Pet ──┬── Vacina
          │                         ├── Medicamento ── AdministracaoMed
          │                         ├── Sintoma
          │                         ├── PlanoSaude
          │                         ├── Guarda
          │                         ├── GuardaTemporaria
          │                         ├── Compromisso
          │                         ├── Solicitacao
          │                         ├── Evento
          │                         ├── PetPrestador ── PerfilPrestador
          │                         └── PetVisitante
          ├── PerfilPrestador
          ├── Notificacao
          ├── Feedback
          └── AuditLog
```

### Tabelas Principais

| Tabela | Descricao |
|--------|-----------|
| `usuarios` | Contas (tutor, prestador, ambos) |
| `pets` | Cadastro dos pets (10 especies) |
| `pet_usuarios` | Vinculo usuario-pet com role |
| `perfis_prestador` | Perfil profissional do prestador |
| `pet_prestadores` | Vinculo pet-prestador com permissoes |
| `pet_visitantes` | Vinculo pet-visitante com permissoes de visualizacao |
| `vacinas` | Historico de vacinacao |
| `medicamentos` | Medicamentos com status (ATIVO/CONCLUIDO/CANCELADO) |
| `administracoes_med` | Cada dose administrada |
| `sintomas` | Sintomas observados com intensidade |
| `planos_saude` | Plano de saude do pet |
| `guardas` | Periodos de guarda |
| `guardas_temporarias` | Guardas automaticas geradas por compromissos |
| `compromissos` | Agenda recorrente (UNICO/DIARIO/SEMANAL/QUINZENAL/MENSAL) |
| `solicitacoes` | Votacao entre tutores (48h expiracao) |
| `eventos` | Timeline imutavel |
| `notificacoes` | Notificacoes in-app |
| `audit_logs` | Log de auditoria |
| `feedbacks` | Feedback dos usuarios |

### Enums Importantes

- `TipoUsuario`: TUTOR, PRESTADOR, AMBOS
- `UserRole`: TUTOR_PRINCIPAL, TUTOR_EMERGENCIA
- `PetSpecies`: CACHORRO, GATO, CAVALO, PEIXE, PASSARO, ROEDOR, COELHO, REPTIL, FURAO, OUTRO
- `SolicitacaoStatus`: PENDENTE → APROVADA/RECUSADA/EXPIRADA
- `GuardaTemporariaStatus`: AGENDADA → CONFIRMADA → EM_ANDAMENTO → CONCLUIDA/CANCELADA

## Frontend (Next.js 14)

### App Router

```
/                    → Landing page
/login               → Login
/register            → Registro multi-step
/home                → Dashboard com lista de pets
/novo-pet            → Criar pet
/vincular-pet        → Vincular por codigo
/minha-conta         → Perfil do usuario
/pets/[id]           → Home do pet (tabs)
/pets/[id]/saude     → Vacinas, medicamentos, sintomas
/pets/[id]/guarda    → Guarda compartilhada
/pets/[id]/historico → Timeline de eventos
/pets/[id]/perfil    → Editar perfil do pet
/pets/[id]/agenda    → Compromissos
/pets/[id]/diario    → Mural de fotos
/pets/[id]/emergencia → Contatos de emergencia
/prestador           → Dashboard do prestador
/prestador/[id]      → Detalhe do pet (prestador)
/visitante           → Dashboard do visitante
/visitante/[id]      → Detalhe do pet (visitante)
/visitante/convites  → Convites pendentes
/pet-publico         → Pagina publica por codigo
```

### Contexts

- **AuthContext** — login/register/logout/updateUser, gerencia tokens no localStorage
- **NotificacaoContext** — polling de notificacoes, marcar como lida

### Engines (lib/)

- **smart-cards.ts** — Gera cards priorizados (urgent/warning/reminder/info/suggestion) baseados no estado do pet
- **achievements.ts** — 12 conquistas em 4 categorias, computadas a partir de dados do pet
- **pet-personality.ts** — Arquetipo de personalidade baseado em especie, idade, atividade
- **config.ts** — Configuracoes centralizadas (sem magic numbers)

### Mock Fallback

O frontend tem um sistema de fallback para desenvolvimento offline:

```typescript
// api.ts
async function tryReal<T>(call: () => Promise<T>, fallback: T): Promise<T> {
  try { return await call(); }
  catch { return fallback; }
}
```

Quando o backend esta indisponivel, retorna dados mock de `mock-data.ts`.

## Regras de Negocio Criticas

1. **Governanca**: Max 2 tutores principais + 2 de emergencia. Acoes criticas (arquivar, remover tutor) requerem consenso.
2. **Solicitacoes**: Expiram em 48h. Status: PENDENTE → APROVADA/RECUSADA/EXPIRADA.
3. **Eventos**: Imutaveis. Nunca deletados ou editados.
4. **Visitantes**: Sem acesso por padrao. Convite por tutor, por pet. Somente leitura.
5. **Prestadores**: Permissoes configuradas por tutor. Aceite necessario.
6. **Codigo do pet**: 6 caracteres sem ambiguos (sem I, O, 0, 1).
