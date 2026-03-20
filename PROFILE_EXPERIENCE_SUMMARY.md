# 🗺️ Mapa Mental: Experiência por Perfil - MITRA

**Última atualização:** 07/03/2026
**Status:** Pronto para desenvolvimento e design

---

## 📊 Visão Geral Comparativa

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  🐾 MITRA - Three User Experiences, One Platform                      │
│                                                                         │
├─────────────────────┬───────────────────────┬──────────────────────────┤
│                     │                       │                          │
│    👨‍👩‍👧 TUTOR          │   🏥 PRESTADOR         │      👥 VISITANTE         │
│    (Owner)          │   (Professional)      │   (Family/Contact)       │
│                     │                       │                          │
│  VISÃO: Centralizar │  VISÃO: Oferecer      │  VISÃO: Estar           │
│  tudo do pet        │  qualidade + crescer  │  informado              │
│                     │                       │                          │
│  CORE VALUE:        │  CORE VALUE:          │  CORE VALUE:            │
│  Controle Total     │  Ganhar + Reputação   │  Tranquilidade          │
│                     │                       │                          │
│  ⚙️ Pode:           │  ⚙️ Pode:             │  ⚙️ Pode (se convidado):│
│  ├─ Criar pets      │  ├─ Agendar consultas│  ├─ Ver dados básicos   │
│  ├─ Registrar saúde │  ├─ Registrar vacina │  ├─ Ver status saúde    │
│  ├─ Convidar todos  │  ├─ Faturar serviços │  ├─ Receber atualizações│
│  ├─ Revogar acesso  │  ├─ Ver reputação    │  ├─ Enviar msg a tutor  │
│  ├─ Gerenciar tutores│  ├─ Sacar ganhos    │  ├─ Aceitar/sair convite│
│  └─ Fazer votações  │  └─ Editar agenda    │  └─ Auto-revogar acesso │
│                     │                       │                          │
│  🔒 ACESSO:         │  🔒 ACESSO:           │  🔒 ACESSO:              │
│  Total              │  Por convite do tutor │  SOMENTE POR CONVITE    │
│                     │                       │  do tutor do pet         │
│                     │                       │                          │
│  🚫 NÃO Pode:       │  🚫 NÃO Pode:        │  🚫 NÃO Pode:           │
│  └─ (Tudo permitido)│  ├─ Editar pet data  │  ├─ Editar qualquer info│
│                     │  ├─ Ver tutores      │  ├─ Convidar visitantes │
│                     │  ├─ Revogar acesso   │  ├─ Convidar prestadores│
│                     │  └─ Votar governança │  ├─ Votar governança    │
│                     │                       │  ├─ Solicitar guarda    │
│                     │                       │  └─ Ver dados sensíveis │
│                     │                       │                          │
└─────────────────────┴───────────────────────┴──────────────────────────┘
```

---

## 🏠 Home/Dashboard

### TUTOR
```
┌──────────────────────────────────────────────┐
│ 🏠 Minha Central de Controle                 │
├──────────────────────────────────────────────┤
│                                              │
│ 📊 SEÇÃO 1: Meus Pets (Tudo que preciso)   │
│   ┌────────────────────────────────────────┐│
│   │ 🐕 Luna              🐈 Miau           ││
│   │ Status: ✅           Status: ⚠️        ││
│   │ Próxima vacina       Precisa atenção  ││
│   └────────────────────────────────────────┘│
│                                              │
│ 🔄 SEÇÃO 2: Atividades Recentes             │
│   • Dr. Silva: Registrou vacina (2h atrás) │
│   • João: Marcou presença (3h atrás)       │
│   • Sistema: Novo tutor aguardando (1d)    │
│                                              │
│ 📅 SEÇÃO 3: Próximos Eventos                │
│   • Consulta com Dr. Silva (15/03 10:00)   │
│   • Banho em Petshop (18/03 14:00)         │
│                                              │
│ 🔔 SEÇÃO 4: Alertas & Ações                 │
│   ⚡ 1 solicitação de guarda pendente      │
│   ⚡ Tutor novo para confirmar             │
│                                              │
│ [+ CRIAR PET] [CONVIDAR PRESTADOR]         │
└──────────────────────────────────────────────┘
```

### PRESTADOR
```
┌──────────────────────────────────────────────┐
│ 🏢 Meu Consultório / Negócio                │
├──────────────────────────────────────────────┤
│                                              │
│ 💰 SEÇÃO 1: Financeiro (Coração do negócio)│
│   ┌────────────────────────────────────────┐│
│   │ Faturamento: R$ 1.245,50 ⬆️ +15%      ││
│   │ Comissão: -R$ 186,83                  ││
│   │ Seu Ganho: R$ 1.058,67 💰             ││
│   │ Próximo saque: 05/04 ✓                ││
│   └────────────────────────────────────────┘│
│                                              │
│ ⭐ SEÇÃO 2: Reputação (Sua Moeda de Ouro)  │
│   4.8 ⭐ (47 avaliações) ⬆️ Crescendo     │
│   "Ótima profissional, super recomendo" ✓ │
│                                              │
│ 📅 SEÇÃO 3: Próximas Consultas              │
│   🕐 15/03 10:00 - Luna (Golden)           │
│   🕐 15/03 14:00 - Miau (Persa)            │
│   🕐 18/03 09:00 - Rex (Labrador)          │
│                                              │
│ 🔔 SEÇÃO 4: Ações                           │
│   • 2 convites novos ⚠️ (Aceitar/Recusar) │
│   • 1 saque aguardando (Acompanhar)        │
│   • 3 clientes para avaliar (Deixar review)│
│                                              │
│ [EDITAR AGENDA] [NOVO AGENDAMENTO]         │
└──────────────────────────────────────────────┘
```

### VISITANTE
> **🔒 Acesso SOMENTE por convite do tutor do pet. Ver `VISITOR_ACCESS_RULES.md`.**

**Estado Inicial (Sem Convites):**
```
┌──────────────────────────────────────────────┐
│ 👋 Bem-vindo à MITRA!                       │
├──────────────────────────────────────────────┤
│                                              │
│ 🔒 Nenhum pet disponível                    │
│   Você ainda não recebeu convites.          │
│   Peça ao tutor responsável para enviar     │
│   um convite usando seu email.              │
│                                              │
│ 🔔 Convites Pendentes (0)                   │
│                                              │
└──────────────────────────────────────────────┘
```

**Estado Após Aceitar Convite:**
```
┌──────────────────────────────────────────────┐
│ 👋 Acompanhamento dos Pets da Família       │
├──────────────────────────────────────────────┤
│                                              │
│ 🐕 SEÇÃO 1: Pets que Acompanho (Read-Only) │
│   Luna - Golden Retriever                   │
│   Status: ✅ Saúde em dia                   │
│   Convidado por: Ana Silva (Tutor)          │
│   Desde: 07/03/2026                         │
│                                              │
│ 📰 SEÇÃO 2: Últimas Novidades               │
│   • Dr. Silva registrou que Luna está ótima│
│   • Recebeu banho no Petshop (ontem)       │
│   • Ana marcou: "Brincalhona e feliz!" (3d)│
│                                              │
│ ⚠️ SEÇÃO 3: Alertas (conforme permissões)  │
│   Vacina de Luna vence em 9 dias            │
│   Medicação de Miau em falta                │
│                                              │
│ 💬 SEÇÃO 4: Comunicação (só com tutores)    │
│   Mensagens recentes de Ana Silva           │
│   [Ver Mensagens]                           │
│                                              │
│ [CHAMAR TUTOR] [VER MAIS DETALHES]         │
└──────────────────────────────────────────────┘
```

---

## 🧭 Navegação Principal

### TUTOR
```
┌─────────────────────┐
│ 📌 Menu Principal   │
├─────────────────────┤
│                     │
│ 🏠 Home (Dashboard) │
│    └─ Visão geral   │
│                     │
│ 🐾 Meus Pets        │
│    ├─ Pet 1: Luna   │
│    │  ├─ Perfil     │
│    │  ├─ Saúde      │
│    │  ├─ Prestadores│
│    │  ├─ Tutores    │
│    │  ├─ Agenda     │
│    │  └─ Histórico  │
│    └─ Pet 2: Miau   │
│                     │
│ 👥 Gerenciar Tutores│
│    ├─ Principal     │
│    ├─ Emergência    │
│    ├─ Visitantes    │
│    └─ Solicitações  │
│                     │
│ 🏥 Marketplace      │
│    └─ Encontrar VETs│
│       Sitters, etc  │
│                     │
│ 📋 Notificações     │
│    ├─ Todas         │
│    ├─ Não-lidas     │
│    └─ Arquivadas    │
│                     │
│ 💬 Mensagens        │
│    └─ Conversas     │
│                     │
│ ⚙️ Configurações    │
│    ├─ Conta         │
│    ├─ Segurança     │
│    ├─ Privacidade   │
│    └─ Assinatura    │
│                     │
│ 👤 Minha Conta      │
│    └─ Editar Perfil │
│                     │
└─────────────────────┘
```

### PRESTADOR
```
┌─────────────────────┐
│ 📌 Menu Principal   │
├─────────────────────┤
│                     │
│ 🏠 Home (Dashboard) │
│    └─ Visão geral   │
│                     │
│ 🐾 Meus Clientes    │
│    ├─ Pets ativos   │
│    ├─ Convites pend.│
│    └─ [ver detalhes]│
│                     │
│ 📅 Minha Agenda     │
│    ├─ Próximas     │
│    ├─ Configurar   │
│    ├─ Disponibilid.│
│    └─ Histórico    │
│                     │
│ 💰 Financeiro       │
│    ├─ Faturamento  │
│    ├─ Transações   │
│    ├─ Saques       │
│    └─ Extratos     │
│                     │
│ ⭐ Reputação        │
│    ├─ Rating       │
│    ├─ Reviews      │
│    ├─ Responder    │
│    └─ Histórico    │
│                     │
│ 📋 Notificações     │
│    └─ Gerenciar    │
│                     │
│ 💬 Mensagens        │
│    └─ Com Tutores   │
│                     │
│ 📊 Relatórios       │
│    ├─ Clientes     │
│    ├─ Ganhos       │
│    └─ Avaliações   │
│                     │
│ ⚙️ Configurações    │
│    ├─ Perfil Prof. │
│    ├─ Horários     │
│    ├─ Banco        │
│    └─ Serviços     │
│                     │
│ 👤 Minha Conta      │
│    └─ Editar Perfil │
│                     │
└─────────────────────┘
```

### VISITANTE
> 🔒 Menu disponível SOMENTE após aceitar convite de tutor
```
┌─────────────────────┐
│ 📌 Menu Principal   │
├─────────────────────┤
│ (Simplificado)      │
│ 🔒 Acesso por convite│
│                     │
│ 🏠 Home (Resumo)    │
│    ├─ Visão geral   │
│    └─ Convites pend.│
│                     │
│ 🐾 Pets que Acompanho│
│    └─ Read-only     │
│       (por convite) │
│                     │
│ 📰 Atualizações     │
│    └─ Timeline      │
│       (se autorizado)│
│                     │
│ 📋 Notificações     │
│    ├─ Convites      │
│    └─ Alertas       │
│                     │
│ 💬 Mensagens        │
│    └─ Só com Tutores│
│                     │
│ ⚙️ Configurações    │
│    └─ Básico        │
│                     │
│ 👤 Minha Conta      │
│    └─ Editar Perfil │
│                     │
└─────────────────────┘
```

---

## 💡 Interações Chave

### Fluxo 1: TUTOR Convida PRESTADOR
```
1. Tutor entra em Pet → Aba "Prestadores"
2. Clica [+ Convidar Prestador]
3. Modal abre com:
   - Email: luiza.prestadora@teste.com
   - Tipo: Veterinário (ou outro)
   - Permissões: [✓] Visualizar, [✓] Registrar Vacina, etc
   - Data Válidade: (opcional)
4. Clica [Enviar Convite]
   ↓
5. Prestador recebe notificação:
   - In-app (bell + toast)
   - Email
   - SMS (opcional)
6. Prestador clica "Aceitar"
   ↓
7. Tutor recebe confirmação:
   - "Dr. Silva aceitou convite para Luna"
   - Pet agora aparece em "Meus Clientes" do prestador
8. Ambos podem colaborar no pet
```

### Fluxo 2: PRESTADOR Registra Serviço
```
1. Prestador clica em Pet (Luna)
2. Tela mostra dados básicos + permissões
3. Clica [+ Registrar Serviço]
4. Modal abre:
   - Tipo: Consulta / Vacinação / etc
   - Data/Hora: Quando foi?
   - Observações: Notas sobre o atendimento
   - Anexos: Documentos (opcional)
5. Clica [Salvar]
   ↓
6. Tutor recebe notificação:
   - "Dr. Silva registrou vacinação para Luna"
   - Pode ir ver detalhes
   - Timeline do pet atualizada
```

### Fluxo 3: TUTOR Convida VISITANTE
```
1. Tutor entra em Pet → Aba "Tutores" → Seção "Visitantes"
2. Clica [+ Convidar Familiar/Visitante]
3. Modal abre com:
   - Email do visitante
   - Relação (Avó, Tio, Amigo, etc)
   - Permissões de visualização (checkboxes)
   - Data de validade (opcional)
4. Clica [Enviar Convite]
   ↓
5. Backend: cria PetVisitante com aceito=false
6. Visitante recebe notificação (email + in-app)
   ↓
7. Visitante clica [Aceitar Convite]
8. Backend: aceito=true, dataAceite=now()
   ↓
9. Tutor recebe confirmação: "Avó Maria aceitou convite"
10. Pet aparece na home do Visitante (read-only)
```

> **Regras críticas:**
> - Convite é POR PET (não por usuário)
> - SOMENTE tutor do pet pode convidar
> - Prestador NÃO convida visitantes (mesmo se AMBOS)
> - Visitante NUNCA convida outros visitantes
> - Ver `VISITOR_ACCESS_RULES.md` para regras completas

### Fluxo 4: VISITANTE Acompanha Pet
```
1. Visitante faz login
2. Home mostra SOMENTE pets para os quais foi convidado e aceitou
   (Se nenhum convite: tela vazia com instrução)
3. Clica em "Luna"
4. Vê (conforme permissões do convite):
   - SEMPRE: Foto + Dados básicos + Status saúde
   - SE AUTORIZADO: Vacinações, Medicamentos, Agenda, Prestadores
   - SE BLOQUEADO: Seção aparece como 🔒 (pedir ao tutor)
5. Clica [Chamar Tutor] para questões
   ↓
6. Conversa com tutor via chat (SOMENTE tutores)
7. Fica informado via notificações (conforme permissões)
```

---

## 🔒 Modelo de Permissões

### Hierarquia de Acesso

```
NIVEL 1: TUTOR PRINCIPAL (Proprietário)
├─ Acesso total ao pet
├─ Pode adicionar/remover qualquer pessoa
├─ Recebe notificações de tudo
└─ Última palavra em decisões

NIVEL 2: TUTOR SECUNDÁRIO (Cônjuge, Familiar responsável)
├─ Acesso quase total
├─ Pode convidar prestadores
├─ Pode adicionar visitantes
└─ Participa de votações

NIVEL 3: TUTOR EMERGÊNCIA (Avó, tio, amigo responsável)
├─ Acesso restrito a saúde
├─ Não pode convidar/remover pessoas
├─ Recebe notificações críticas apenas
└─ Pode agir em emergências

NIVEL 4: VISITANTE (Familiar, amigo)
├─ 🔒 SOMENTE por convite do tutor do pet
├─ Acesso read-only (conforme permissões do convite)
├─ SEMPRE vê: dados básicos + status saúde
├─ CONFIGURÁVEL: vacinação, medicamentos, agenda, prestadores
├─ NÃO pode editar, convidar, ou votar
├─ NÃO pode convidar outros visitantes ou prestadores
├─ Pode enviar mensagens SOMENTE para tutores
└─ Tutor pode revogar acesso a qualquer momento

NIVEL 5: PRESTADOR (Vet, Sitter, Groomer)
├─ Acesso contextual (só seu escopo)
├─ Pode registrar seus serviços
├─ Vê o que foi autorizado
└─ Não vê dados sensíveis (tutores, outros prestadores)
```

---

## 🎯 Funcionalidades Principais por Perfil

### TUTOR: 5 Core Functionalities
```
1️⃣ GERENCIAR PETS
   Criar, editar, visualizar, excluir
   → Centraliza tudo em um lugar

2️⃣ REGISTRAR SAÚDE
   Vacinas, medicamentos, planos
   → Histórico completo

3️⃣ CONVIDAR PROFISSIONAIS
   Veterinários, sitters, groomers
   → Controlar quem acessa o quê

4️⃣ GERENCIAR TUTORES
   Adicionar família, visitantes
   → Compartilhar responsabilidade

5️⃣ GOVERNANÇA & VOTAÇÕES
   Decisões compartilhadas
   → Democracia em casa
```

### PRESTADOR: 5 Core Functionalities
```
1️⃣ GERENCIAR AGENDA
   Agendar, confirmar, cancelar
   → Organizar tempo

2️⃣ REGISTRAR SERVIÇOS
   Consultas, vacinações, banhos
   → Documentar trabalho realizado

3️⃣ FATURAR & GANHAR
   Receber pagamentos
   → Ganhar dinheiro

4️⃣ GERENCIAR REPUTAÇÃO
   Ver reviews, responder
   → Crescer profissionalmente

5️⃣ VER CLIENTES
   Acompanhar seus pets
   → Conhecer melhor cada um
```

### VISITANTE: 4 Core Functionalities
> 🔒 Todas dependem de convite aceito do tutor

```
1️⃣ ACEITAR CONVITE
   Receber e aceitar convite do tutor
   → Único caminho para acessar pets

2️⃣ VISUALIZAR PETS (conforme permissões)
   Dados básicos sempre + extras se autorizado
   → Ficar informado dentro do permitido

3️⃣ RECEBER NOTIFICAÇÕES (condicionais)
   Alertas conforme permissões do convite
   → Saber o que acontece (se autorizado)

4️⃣ COMUNICAR COM TUTOR (apenas)
   Enviar mensagens só para tutores
   → Pedir informações quando precisa
```

---

## 🚀 Implementação: Ordem Recomendada

```
FASE 1: MVP TUTOR (6 semanas)
├─ 1. Auth + Profile
├─ 2. Pet Management
├─ 3. Health Registration
└─ 4. Tutor Invitations

FASE 2: MVP PRESTADOR (6 semanas)
├─ 1. Prestador Profile
├─ 2. Client List
├─ 3. Agenda
└─ 4. Accept Invites

FASE 3: MVP VISITANTE (3 semanas)
├─ 1. Visitante Profile
├─ 2. Pet Visualization
└─ 3. Updates Feed

FASE 4: INTERAÇÃO (4 semanas)
├─ 1. Notifications (End-to-End)
├─ 2. Messages System
├─ 3. Financial (Prestador)
└─ 4. Reviews (Prestador)

FASE 5: POLISH (2 semanas)
├─ 1. Mobile Responsive
├─ 2. Error Handling
├─ 3. Performance
└─ 4. Testing
```

---

## 📚 Documentos Relacionados

- **USER_JOURNEYS_BY_PROFILE.md** - Jornadas completas e detalhadas
- **UI_COMPONENTS_BY_PROFILE.md** - Especificação técnica dos componentes
- **VISITOR_ACCESS_RULES.md** - Regras de acesso do Visitante (CRÍTICO)
- **CREDENTIALS_TEST_USERS.md** - Usuários de teste para começar

---

## ✅ Checklist de Validação

### Design
- [ ] Mockups para cada perfil (Home, Pet Detail, Settings)
- [ ] Protótipos Figma com interações
- [ ] Design System documentado
- [ ] Color palette por perfil definida
- [ ] Responsividade planejada (mobile, tablet, desktop)

### Desenvolvimento
- [ ] Estrutura de pastas criada
- [ ] Rotas definidas (auth, tutor, prestador, visitante)
- [ ] Componentes compartilhados criados
- [ ] Context providers implementados
- [ ] Hooks customizados desenvolvidos
- [ ] Middleware de autenticação configurado

### Funcionalidades
- [ ] Login/Registro funcionando
- [ ] Dashboard de cada perfil renderizando
- [ ] Navegação entre seções OK
- [ ] CRUD básico de pets
- [ ] Sistema de permissões validado
- [ ] Notificações entregues (já implementado)

### Testing
- [ ] Unit tests de componentes
- [ ] Testes de permissões
- [ ] E2E tests de fluxos principais
- [ ] Testes em mobile
- [ ] Performance validated

---

**Versão:** 1.0
**Pronto para:** Handoff para design e desenvolvimento
**Status:** ✅ Arquitetura definida e validada

