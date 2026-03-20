# 📚 Índice Completo: Arquitetura UX/Jornadas por Perfil

**Data de Criação:** 07/03/2026
**Status:** ✅ Completo e Pronto para Desenvolvimento
**Objetivo:** Definir a experiência única para cada um dos 3 perfis do MITRA

---

## 🎯 Visão Geral

A MITRA agora possui **3 jornadas de usuário completamente distintas**, cada uma otimizada para seu perfil específico:

1. **👨‍👩‍👧 TUTOR** - Centralizar saúde e bem-estar dos pets
2. **🏥 PRESTADOR** - Oferecer serviços e crescer profissionalmente
3. **👥 VISITANTE** - Estar informado sobre os pets da família

---

## 📖 Documentos Criados

### 1. **USER_JOURNEYS_BY_PROFILE.md** 📍 [LEIA PRIMEIRO]
**O que contém:** Jornada completa de cada perfil com layouts visuais

#### Para TUTOR:
- ✅ Onboarding passo-a-passo
- ✅ Home/Dashboard completo
- ✅ Seção Meus Pets (com 6 abas: Perfil, Saúde, Prestadores, Tutores, Agendamentos, Timeline)
- ✅ Seção Tutores/Guardiões (gerenciamento)
- ✅ Marketplace de Prestadores
- ✅ Configurações personalizadas

#### Para PRESTADOR:
- ✅ Onboarding profissional
- ✅ Home/Dashboard com métricas (faturamento, reputação, agenda)
- ✅ Seção Meus Clientes (pets que atende)
- ✅ Agenda (month/week/day view)
- ✅ Financeiro (faturamento, transações, saques)
- ✅ Reputação (ratings, reviews)
- ✅ Configurações profissionais

#### Para VISITANTE:
- ✅ Onboarding simplificado
- ✅ Home/Dashboard com resumos
- ✅ Meus Pets (visualização restrita)
- ✅ Atualizações (timeline)
- ✅ Mensagens (com tutores)
- ✅ Configurações básicas

#### Fluxos Compartilhados:
- ✅ Sistema de Notificações (centralizado)
- ✅ Sistema de Mensagens (permissionado)
- ✅ Matriz de Acesso (quem pode fazer o quê)

**Tamanho:** ~1500 linhas
**Público-alvo:** Product Managers, Designers, Stakeholders
**Leitura:** 30-45 minutos

---

### 2. **UI_COMPONENTS_BY_PROFILE.md** 🛠️ [PARA DESENVOLVEDORES]
**O que contém:** Especificação técnica dos componentes React

#### Componentes Compartilhados:
- ✅ NavBar Global
- ✅ Notification Center
- ✅ Message System
- ✅ Authentication Forms
- ✅ Profile Cards (reutilizáveis)

#### Componentes do Tutor:
- ✅ Dashboard + Widgets
- ✅ Pet Management (CRUD)
- ✅ Health Management (Vacinas, Medicamentos, Planos)
- ✅ Prestadores Management (Convites, Permissões, Remoção)
- ✅ Tutores Management (Adição, Governança, Pedidos de Guarda)
- ✅ Marketplace (Discovery, Filtros, Perfil)
- ✅ Settings (Conta, Segurança, Privacidade, Assinatura)

#### Componentes do Prestador:
- ✅ Dashboard com Métricas
- ✅ Clients List + Detail
- ✅ Calendar View (Month/Week/Day)
- ✅ Financial Dashboard (Faturamento, Transações, Saques)
- ✅ Reputation Manager (Ratings, Reviews, Responses)
- ✅ Settings Profissionais (Perfil, Agenda, Serviços, Banco)

#### Componentes do Visitante:
- ✅ Dashboard simplificado (com estados vazio/com convites)
- ✅ Pets Visualization (read-only, conforme permissões do convite)
- ✅ Pending Invites (aceitar/recusar convites)
- ✅ Invite Visitor Modal (no lado do Tutor)
- ✅ Locked Section Placeholder (seções não autorizadas)
- ✅ Updates Timeline
- ✅ Messages Interface (apenas com tutores)
- ✅ Basic Settings

#### Estrutura de Pastas Frontend:
```
/frontend/src/
├─ /app
│  ├─ /auth
│  ├─ /(authenticated)
│  │  ├─ /tutor
│  │  ├─ /prestador
│  │  └─ /visitante
│  └─ /layout.tsx
├─ /components (organizado por perfil)
├─ /contexts (AuthContext, NotificacaoContext, etc)
├─ /hooks (useAuth, useNotificacoes, etc)
├─ /lib (api, config, permissions)
└─ /styles (design system)
```

#### Rotas Recomendadas:
- ✅ Auth routes (/login, /register, /forgot-password)
- ✅ Tutor routes (/tutor/home, /tutor/pets/:id, etc)
- ✅ Prestador routes (/prestador/home, /prestador/agenda, etc)
- ✅ Visitante routes (/visitante/home, /visitante/pets, etc)
- ✅ Backend API endpoints (GET/POST/PUT/DELETE)

**Tamanho:** ~800 linhas
**Público-alvo:** Frontend Developers, Tech Leads
**Leitura:** 20-30 minutos

---

### 3. **PROFILE_EXPERIENCE_SUMMARY.md** 🗺️ [VISÃO GERAL]
**O que contém:** Mapa mental visual das 3 experiências

#### Incluí:
- ✅ Comparativo dos 3 perfis (tabela visual)
- ✅ Home/Dashboard de cada um (em ASCII art)
- ✅ Navegação principal de cada um
- ✅ Fluxos chave (Tutor convida Prestador, Tutor convida Visitante, etc)
- ✅ Modelo de permissões (hierarquia de acesso + regras do visitante)
- ✅ Core functionalities de cada perfil (5 tutor, 5 prestador, 4 visitante)
- ✅ Ordem de implementação (5 fases)
- ✅ Checklists de validação

**Tamanho:** ~500 linhas
**Público-alvo:** Todos (overview rápido)
**Leitura:** 15-20 minutos

---

### 4. **VISITOR_ACCESS_RULES.md** 🔒 [REGRAS DE SEGURANÇA]
**O que contém:** Regras completas de acesso do perfil Visitante

#### Incluí:
- ✅ Princípio fundamental: sem acesso padrão
- ✅ Quem pode convidar (tutor only, edge case AMBOS)
- ✅ Fluxo de convite passo-a-passo (com wireframe)
- ✅ Escopo por pet (isolamento de convites)
- ✅ Permissões de visualização configuráveis (PermissaoVisitante enum)
- ✅ Backend verification logic (canVisitorAccess, canInviteVisitor)
- ✅ Modelo Prisma: PetVisitante + PermissaoVisitante
- ✅ Regras de revogação de acesso
- ✅ 6 cenários de edge cases detalhados
- ✅ Matriz de notificações do visitante

**Tamanho:** ~440 linhas
**Público-alvo:** Backend Developers, QA, Security
**Leitura:** 15-20 minutos
**Prioridade:** CRÍTICA - Segurança de dados

---

### 5. **CREDENTIALS_TEST_USERS.md** 🔑 [JÁ CRIADO]
**O que contém:** Credenciais dos 3 usuários de teste

```
TUTOR:       luiza.tutora@teste.com         | Senha: JCHh14025520
PRESTADOR:   luiza.prestadora@teste.com     | Senha: JCHh14025520
VISITANTE:   luiza.visitante@teste.com      | Senha: JCHh14025520
```

**Status:** ✅ Usuários já criados no banco de dados
**Banco de dados:** PostgreSQL (mitra_db) ✅ Criado
**Schema:** Prisma ✅ Aplicado

---

## 🔄 Relação Entre Documentos

```
                    ┌─────────────────────────────┐
                    │ CREDENTIALS_TEST_USERS.md   │
                    │ (3 usuários já criados)     │
                    └────────────┬────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │ PROFILE_EXPERIENCE   │  │ USER_JOURNEYS        │
        │ _SUMMARY.md          │  │ _BY_PROFILE.md       │
        │ (Mapa mental visual) │  │ (Jornadas completas) │
        └──────────┬───────────┘  └──────────┬───────────┘
                   │                         │
                   └────────────┬────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │ UI_COMPONENTS        │  │ VISITOR_ACCESS       │
        │ _BY_PROFILE.md       │  │ _RULES.md            │
        │ (Spec técnica p/ dev)│  │ (Segurança visitante)│
        └──────────┬───────────┘  └────────────────────┘
                   │
                   │
       ┌───────────┴───────────┐
       │                       │
                   ▼                       ▼
            Frontend Code         Backend Endpoints
         (/app/tutor, etc)       (/api/v1/pets, etc)
```

---

## 🚀 Como Usar Estes Documentos

### Para Product Manager / Stakeholder
1. **Leia primeiro:** PROFILE_EXPERIENCE_SUMMARY.md (15 min)
   - Entenda as 3 experiências
   - Veja a ordem de implementação
   - Aprove a estratégia

2. **Leia depois:** USER_JOURNEYS_BY_PROFILE.md (1-2 horas)
   - Detalhe cada jornada
   - Revise layouts
   - Identifique gaps

### Para Designer
1. **Leia primeiro:** PROFILE_EXPERIENCE_SUMMARY.md (15 min)
   - Veja overview visual

2. **Leia depois:** USER_JOURNEYS_BY_PROFILE.md (2-3 horas)
   - Analise layouts ASCII
   - Crie wireframes em Figma
   - Defina interações

3. **Referência:** UI_COMPONENTS_BY_PROFILE.md
   - Use como checklist de components
   - Valide que cobrirá todos os casos

### Para Frontend Developer
1. **Leia primeiro:** PROFILE_EXPERIENCE_SUMMARY.md (15 min)
   - Entenda a visão geral

2. **Trabalhe com:** UI_COMPONENTS_BY_PROFILE.md (main reference)
   - Use estrutura de pastas recomendada
   - Implemente rotas sugeridas
   - Crie componentes listados

3. **Consulte:** USER_JOURNEYS_BY_PROFILE.md
   - Para detalhes de fluxo
   - Para validar permissões
   - Para casos de edge

### Para Backend Developer
1. **Leia primeiro:** PROFILE_EXPERIENCE_SUMMARY.md (15 min)
   - Entenda cada perfil

2. **Use como referência:** UI_COMPONENTS_BY_PROFILE.md
   - Seção "Rotas da API Backend"
   - Implemente endpoints necessários
   - Valide permissões

3. **Valide:** USER_JOURNEYS_BY_PROFILE.md
   - Fluxos de negócio
   - Permissões granulares
   - Casos de uso específicos

### Para QA / Tester
1. **Leia:** USER_JOURNEYS_BY_PROFILE.md
   - Entenda cada jornada
   - Identifique test cases

2. **Use:** PROFILE_EXPERIENCE_SUMMARY.md
   - Matriz de permissões (validar acesso)
   - Fluxos chave (regressão)
   - Checklists (validação final)

3. **Teste com:** CREDENTIALS_TEST_USERS.md
   - Use os 3 usuários para teste
   - Validar permissões por perfil

---

## ✨ Destaques Arquiteturais

### 1. Permissões Granulares
- Cada prestador tem array de permissões customizável
- Visitantes têm acesso read-only a informações específicas
- Tutores controlam tudo com granularidade completa

### 2. Interfaces Customizadas
- Dashboard único para cada perfil (não templates genéricos)
- Menu principal diferente para cada tipo
- Funcionalidades core exclusivas de cada um

### 3. Fluxos Interconectados
- Tutor convida Prestador → Prestador vê convite → Aceita
- Prestador registra serviço → Tutor recebe notificação
- Visitante vê atualizações → Pode chamar tutor

### 4. Sistema de Notificações (Já Implementado)
- ✅ Integrado com Resend (email)
- ✅ Toast notifications em tempo real
- ✅ Notification Center com filtros
- ✅ Deep links para contexto

### 5. Autenticação Unificada
- Login único para todos
- Tipo de usuário define experiência
- Refresh token de 7 dias

---

## 📊 Estatísticas dos Documentos

| Documento | Linhas | Duração | Público |
|-----------|--------|---------|---------|
| USER_JOURNEYS_BY_PROFILE.md | ~1500 | 30-45 min | PM, Design, Dev |
| UI_COMPONENTS_BY_PROFILE.md | ~800 | 20-30 min | Frontend, Tech Lead |
| PROFILE_EXPERIENCE_SUMMARY.md | ~500 | 15-20 min | Todos |
| **TOTAL** | **~2800** | **1-2 horas** | - |

---

## 🎯 Próximos Passos

### Fase 1: Design (1-2 semanas)
- [ ] Criar wireframes em Figma (baseado em layouts do documento)
- [ ] Definir design system (cores, tipografia, spacing)
- [ ] Prototipar fluxos principais
- [ ] Validar com stakeholders

### Fase 2: Frontend Setup (1 semana)
- [ ] Criar estrutura de pastas recomendada
- [ ] Implementar componentes compartilhados
- [ ] Setup de rotas e contexts
- [ ] Criar páginas de shell (sem lógica ainda)

### Fase 3: Implementação MVP (4-6 semanas)
- [ ] **Semana 1-2:** TUTOR MVP (Home + Pets)
- [ ] **Semana 3:** PRESTADOR MVP (Home + Clients)
- [ ] **Semana 4:** VISITANTE MVP (Home + View)
- [ ] **Semana 5-6:** Interações (Notifications, Messages)

### Fase 4: Testing & Polish (2-3 semanas)
- [ ] Testes de permissões
- [ ] E2E tests de fluxos
- [ ] Mobile responsiveness
- [ ] Performance optimization

---

## 🔗 Arquivos Relacionados Já Criados

- ✅ **FASE_1A_E2E_TESTING.md** - Testes end-to-end do sistema de notificações
- ✅ **FASE_1B_CONFIG_SYSTEM.md** - Sistema centralizado de configuração
- ✅ **EVOLUÇÃO_PLAYBOOK.md** - Roadmap de 5 fases do produto
- ✅ **CREDENTIALS_TEST_USERS.md** - Credenciais dos 3 usuários de teste
- ✅ **VISITOR_ACCESS_RULES.md** - Regras de acesso do Visitante (segurança de dados)

---

## ❓ Dúvidas Frequentes

**P: Posso começar a implementar antes de ter design aprovado?**
A: Sim! Comece com estrutura de pastas, componentes compartilhados e setup de rotas. Design pode ser feito em paralelo.

**P: Como validar que implementei todos os componentes?**
A: Use o checklist em UI_COMPONENTS_BY_PROFILE.md. Cada seção tem uma lista de componentes esperados.

**P: E se precisar adicionar nova funcionalidade?**
A: Use o Decision Framework em EVOLUÇÃO_PLAYBOOK.md (4 perguntas antes de adicionar qualquer coisa).

**P: Como garantir permissões corretas?**
A: Veja matriz em PROFILE_EXPERIENCE_SUMMARY.md e especificação em USER_JOURNEYS_BY_PROFILE.md (Fluxos Compartilhados). Para visitantes especificamente, consulte VISITOR_ACCESS_RULES.md (regras de convite, permissões por pet, verificação de acesso).

**P: Preciso fazer tudo de uma vez?**
A: Não! Implemente por fases conforme "Próximos Passos" acima. MVP Tutor → MVP Prestador → MVP Visitante.

---

## 👥 Contribuintes

**Criado por:** Claude Code
**Data:** 07/03/2026
**Validado com:**
- Arquitetura existente (NestJS + Next.js)
- Schema Prisma (13 tabelas, soft deletes)
- Sistema de notificações (já implementado)

---

## 📝 Notas Importantes

1. **Banco de dados já existe** ✅
   - PostgreSQL (mitra_db) criado
   - Schema Prisma aplicado
   - 3 usuários de teste criados

2. **Notificações já funcionam** ✅
   - Integradas com Resend
   - Toast notifications implementadas
   - Notification Center criada

3. **Config system já existe** ✅
   - Frontend config.ts criado
   - Backend app.config.ts criado
   - Magic numbers removidos

4. **Próximos sprints**
   - Implementar jornadas conforme documentos
   - Criar design no Figma
   - Développer componentes React
   - Validar permissões

---

## 📞 Suporte

Para dúvidas sobre:
- **Jornadas:** Veja USER_JOURNEYS_BY_PROFILE.md
- **Componentes:** Veja UI_COMPONENTS_BY_PROFILE.md
- **Visão geral:** Veja PROFILE_EXPERIENCE_SUMMARY.md
- **Testes:** Veja FASE_1A_E2E_TESTING.md
- **Permissões:** Veja EVOLUÇÃO_PLAYBOOK.md

---

**Status:** ✅ **ARQUITETURA DE UX COMPLETA E VALIDADA**

**Pronto para:**
- Design refinement
- Frontend development
- QA planning
- Product launch

**Versão:** 1.0
**Última atualização:** 07/03/2026

