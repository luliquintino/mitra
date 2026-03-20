# EVOLUÇÃO_PLAYBOOK.md
## Quick Reference para Decisões de Produto na MITRA

**Última atualização:** Março 2026
**Status:** Pronto para Expansão

---

## 1. ARQUITETURA CORE (Não quebrar!)

### Stack Atual
| Componente | Tecnologia | Versão |
|-----------|-----------|--------|
| Backend | NestJS | Modular (9 módulos) |
| Database | PostgreSQL + Prisma ORM | - |
| Frontend | Next.js 14+ App Router | - |
| Auth | JWT (15m access + 7d refresh) | - |
| State | React Context API | - |
| HTTP | Axios + interceptors | - |

### 9 Módulos (Estrutura Sacrossanta)
```
auth, usuarios, pets, health, custody, governance,
events, notifications, prestadores
```

### 13 Tabelas (Sempre com Soft Deletes)
```
usuarios, pets, pet_usuarios, pet_prestadores,
perfis_prestador, vacinas, medicamentos,
custody_requests, governance_votes, eventos,
notificacoes, audit_logs, (+ 1 futura)
```

### Padrões Obrigatórios
- ✓ Service-Controller-DTO em todo backend
- ✓ Soft deletes (statusVinculo, status enums, não DELETE)
- ✓ Auditoria em alterações críticas
- ✓ Permissões granulares (array, não roles fixos)

---

## 2. PERMISSÕES & ACCESS CONTROL

### Matriz: Tipo Prestador × Permissões

| Tipo | VISUALIZAR | REG_SERVICO | REG_VACINA | ANEXAR_DOC | REG_OBS | EDITAR_SAUDE |
|------|:--:|:--:|:--:|:--:|:--:|:--:|
| VETERINARIO | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PET_SITTER | ✓ | ✓ | | ✓ | ✓ | |
| DAY_CARE | ✓ | ✓ | | ✓ | ✓ | |
| ADESTRADOR | ✓ | ✓ | | ✓ | ✓ | |
| BANHO_TOSA | ✓ | ✓ | | ✓ | ✓ | |
| CUIDADOR_EVENTUAL | ✓ | ✓ | | ✓ | ✓ | |

### 4 Critérios de Acesso (Sempre verificar)
```typescript
PetPrestador.aceito === true          // Aceitou convite
PetPrestador.statusVinculo === "ATIVO" // Não revogado
!dataFim || dataFim > now()            // Não expirado
permissoes.includes(permission)        // Tem permissão
```

### Adicionar Nova Permissão?
1. Add enum value em `PermissaoPrestador`
2. Update matriz acima
3. Update `hasPermission()` validation
4. Backend + Frontend ambos devem validar
5. Zero código cliente confia em frontend

---

## 3. DECISION FRAMEWORK

### Checklist: Antes de Qualquer Feature

#### 1️⃣ ALINHA COM VISÃO?
- [ ] Tutor consegue centralizar saúde do pet?
- [ ] Prestador consegue registrar serviços?
- [ ] Comunidade é confiável (ratings, identity)?

#### 2️⃣ ESCALÁVEL ARQUITETURALMENTE?
- [ ] Reutiliza tabela existente ou cria nova?
- [ ] Reutiliza enum de permissões?
- [ ] Usa soft delete (statusVinculo) ou hard delete?
- [ ] Quebra algum padrão existente (Service-Controller)?

#### 3️⃣ RENTÁVEL?
- [ ] Tutor FREE ou PREMIUM?
- [ ] Prestador paga comissão ou subscription?
- [ ] Receita esperada: ROI em 12 meses?
- [ ] Canibalizaria outra receita?

#### 4️⃣ RESOLVE PROBLEMA REAL?
- [ ] Dados de usuário suportam? (Checar analytics)
- [ ] Existe alternativa mais simples?
- [ ] MVP consegue esperar (Phase 1 → 5)?

**Se responder NÃO em qualquer seção: volta pro desenho**

---

## 4. TECHNICAL DEBT ATIVO

### 🔴 HIGH PRIORITY (Bloqueia Crescimento)

#### 1. Notificações (3 TODOs)
- **Location:** `backend/src/pets/prestadores/pet-prestadores.service.ts`
- **Problema:** Criadas em DB mas não entregues
- **Impact:** Prestadores/Tutores não sabem que foram convidados
- **Fix:** Integrar Sendgrid/Resend, implementar event listeners
- **Esforço:** 2-3 sprints

#### 2. Magic Numbers (Hardcoded)
- **Location:** Vários arquivos (pets, prestadores)
- **Problema:** throttleMs=60000, maxReq=30, timeout=4000, maxPets=2
- **Impact:** Impossível ajustar sem recompile
- **Fix:** Mover para `config.yaml` ou `.env`
- **Esforço:** 1 sprint

#### 3. Microchip: 2 Pets por Tutor
- **Location:** `backend/src/pets/pets.service.ts`
- **Problema:** Hardcoded, sem docs, limita escalabilidade
- **Impact:** Tutores com 3+ pets recusados
- **Fix:** Criar tier system (Free=2, Premium=ilimitado)
- **Esforço:** 1 sprint

### 🟡 MEDIUM PRIORITY (Bom ter)

4. **Timeout Imagens:** 4s hardcoded
5. **Code Duplication:** localStorage, formatDate duplciados
6. **Missing:** Chat, Agendamento, Payments, Analytics, Mobile

---

## 5. REVENUE MODEL (Quem Paga?)

### 4 Tiers de Monetização

```
┌─ TUTORES ──────────────────────────────────┐
│                                             │
│  FREE                  PREMIUM (R$ 29/mês) │
│  • 1 prestador         • Prestadores ilimitados
│  • Convites           • Agendamentos
│  • Histórico saúde    • Relatórios
│                       • Suporte prioritário
└─────────────────────────────────────────────┘

┌─ PRESTADORES ──────────────────────────────┐
│                                             │
│  FREE                  PREMIUM (15% comissão)
│  • Perfil limitado     • Perfil completo
│  • 10 pets max        • Pets ilimitados
│  • Sem receber $      • Receber pagamentos
│                       • Analytics
│                       • Marketing tools
└─────────────────────────────────────────────┘
```

### Como Precificar Nova Feature?

**Pergunta:** "Quem sente dor sem isso?"
- Se Tutor sem prestadores → Premium
- Se Prestador quer mais clientes → Marketplace (comissão 15%)
- Se ambos → Freemium (básico free, full premium)

**Regra:** 70% do MRR vem de prestadores (comissão), 30% de tutores (sub)

---

## 6. ROADMAP: 5 FASES (12+ MESES)

| Fase | Duração | Foco | Receita |
|------|---------|------|---------|
| **1: Consolidação** | 1-2 meses | Notificações, testes, debt | MVP |
| **2: Marketplace** | 3-4 meses | Discovery, Booking, Stripe | R$ 50K MRR |
| **3: Communication** | 2-3 meses | Chat, Forms, Docs | +30% retention |
| **4: Mobile** | 2-3 meses | PWA ou React Native | +30% DAU |
| **5: Analytics** | Contínuo | Growth, Gamification | LTV/CAC > 3 |

### Próximos Passos Imediatos (Antes de Qualquer Feature Nova)

1. **Completar notificações** (bloqueia tudo)
2. **Remover magic numbers** (libera reutilização)
3. **Criar tier system** (libera monetização)

---

## 7. MÉTRICAS & HEALTH CHECKS

### ✅ Phase 1: Consolidação

- [ ] 100% notificações entregues (Sendgrid logs)
- [ ] 0 bugs críticos (GitHub issues)
- [ ] 70%+ test coverage (Jest reports)
- [ ] 0 magic numbers expostos (grep hardcoded)

### ✅ Phase 2: Marketplace

- [ ] 50%+ prestadores com rating > 4.5 ⭐
- [ ] 2+ serviços/mês por tutor ativo
- [ ] R$ 50K MRR (Stripe dashboard)
- [ ] <2% monthly churn (analytics)

### ✅ Phase 3: Communication

- [ ] 80%+ mensagens respondidas <2h (chat logs)
- [ ] 60%+ tutores com chat ativo (analytics)
- [ ] +30% retention month-to-month (cohort analysis)

### ✅ Phase 4: Mobile

- [ ] 30%+ usuários via mobile (Vercel analytics)
- [ ] 4.5+ ⭐ app store rating
- [ ] +20% DAU vs web-only (Google Analytics)

---

## 8. CHECKLIST: ADICIONAR NOVA PERMISSÃO

Cenário: Prestador quer novo tipo de acesso

```
1. UPDATE enum PermissaoPrestador
   ↓
2. UPDATE hasPermission() validation logic
   ↓
3. UPDATE matriz acima (seção 2)
   ↓
4. BACKEND: Create/update endpoints com new permission
   ↓
5. FRONTEND: Conditionally show UI based on permission
   ↓
6. TEST: Tutor invita com new permission → Prestador vê feature
   ↓
7. DOCS: Update RAIO_X_PRODUTO seção II (fluxos)
```

---

## 9. CHECKLIST: ADICIONAR NOVA TABELA

Cenário: Precisa de novo modelo de dados

```
1. DESIGN: Por que não reusar tabela existente?
   ↓
2. SCHEMA: Add model em prisma/schema.prisma
   ↓
3. MIGRATION: npx prisma migrate dev --name add_xxx
   ↓
4. SERVICE: Create Service em novo módulo (ou existente)
   ↓
5. CONTROLLER: Create endpoints (GET, POST, PATCH, DELETE soft)
   ↓
6. DTO: Create request/response DTOs com validation
   ↓
7. PERMISSION: Add checks em novo Controller
   ↓
8. TEST: Unit test Service, E2E test endpoint
   ↓
9. FRONTEND: Create API client method em lib/api.ts
```

---

## 10. GUARDRAILS (O Que Nunca Fazer)

❌ Hard DELETE (sem backup)
❌ Tabela sem soft delete
❌ Controller sem permission check
❌ Frontend assumir que backend permitiu (sempre validar)
❌ Novo rol/tipo sem atualizar enum
❌ Feature sem revenue model
❌ Não testar fluxo permissões
❌ Deixar magic number hardcoded
❌ Update Prisma schema sem migration

---

## 11. QUANDO FICO NA DÚVIDA...

**Consulte nesta ordem:**

1. **RAIO_X_PRODUTO.md** (detalhes técnicos, decisões)
2. **Este arquivo** (quick reference)
3. **Código existente** (padrões já implementados)
4. **Discussão com time** (clarificar requerimentos)

**Nunca:** Faça feature breaking change sem reread arquitetura

---

## 12. CONTATOS RÁPIDOS

- **Architect:** RAIO_X_PRODUTO.md, Seção VII (Decisões Críticas)
- **Permissões:** Seção 2, Seção 8 (Matriz + Checklist)
- **Revenue:** Seção 5 (4 Tiers + Pricing)
- **Roadmap:** Seção 6 (5 Phases)
- **Debt:** Seção 4 (Priority List)
- **Metrics:** Seção 7 (Health Checks)

---

**Última Revisão:** Março 2026
**Próxima Review:** Quando Phase 1 concluir
**Dúvidas:** Reread RAIO_X_PRODUTO.md seção relevante