# 🎨 Componentes de UI por Perfil - MITRA

**Status:** Especificação técnica para desenvolvimento
**Data:** 07/03/2026

---

## 📋 Índice

1. [Componentes Compartilhados](#componentes-compartilhados)
2. [Componentes do Tutor](#componentes-do-tutor)
3. [Componentes do Prestador](#componentes-do-prestador)
4. [Componentes do Visitante](#componentes-do-visitante)
5. [Rotas Recomendadas](#rotas-recomendadas)

---

## Componentes Compartilhados

### NavBar Global
```typescript
// /frontend/src/components/layout/TopBar.tsx
export interface TopBarProps {
  userType: 'TUTOR' | 'PRESTADOR' | 'VISITANTE';
  unreadNotifications: number;
}

Exibe:
├─ Logo MITRA
├─ Search (contextual por profile)
├─ Notification Bell (com badge)
├─ User Menu
│  ├─ Meu Perfil
│  ├─ Configurações
│  └─ Logout
└─ Profile Avatar (cor por tipo)
```

### Notification Center
```typescript
// /frontend/src/components/NotificationCenter.tsx
export interface NotificationCenterProps {
  userId: string;
  userType: 'TUTOR' | 'PRESTADOR' | 'VISITANTE';
}

Features:
├─ Tabs: Todas | Não-lidas | Arquivadas
├─ Filter: Por tipo de notificação
├─ List: Notificações renderizadas
├─ Actions: Marcar lida, deletar, ver detalhes
└─ Deep Links: Navega para contexto
```

### Message System
```typescript
// /frontend/src/components/MessageCenter.tsx
export interface MessageCenterProps {
  userId: string;
  userType: 'TUTOR' | 'PRESTADOR' | 'VISITANTE';
  allowedParticipants: string[]; // Dinâmico por perfil
}

Features:
├─ Conversation List
├─ Chat Interface
├─ Typing Indicators
├─ Message History
├─ Block User (se aplicável)
└─ Attach Files
```

### Authentication
```typescript
// /frontend/src/components/Auth/
├─ LoginForm.tsx
├─ RegisterFlow.tsx
│  ├─ Step1_BasicInfo.tsx
│  ├─ Step2_UserType.tsx (TUTOR/PRESTADOR/VISITANTE)
│  ├─ Step3_Professional.tsx (se PRESTADOR)
│  └─ Step4_Confirmation.tsx
├─ PasswordRecovery.tsx
└─ TwoFactorAuth.tsx (opcional)
```

### Profile Card (Reutilizável)
```typescript
// /frontend/src/components/ProfileCard.tsx
export interface ProfileCardProps {
  profile: User | PerfilPrestador;
  variant: 'tutor' | 'prestador' | 'pet' | 'visitante';
  onClick?: () => void;
}

Renderiza:
├─ Avatar + Nome
├─ Subtítulo (tipo/especialidade)
├─ Rating (se aplicável)
├─ Status
└─ Ações contextuais
```

---

## Componentes do Tutor

### 1. Dashboard Principal (Home)
```typescript
// /frontend/src/app/(authenticated)/tutor/home/page.tsx

Componentes:
├─ PetCardList.tsx
│  └─ PetCard.tsx (cada pet como card)
├─ QuickActions.tsx
│  ├─ [+ Adicionar Pet]
│  ├─ [Convidar Prestador]
│  └─ [Gerenciar Tutores]
├─ RecentActivityFeed.tsx
│  └─ ActivityItem.tsx (eventos recentes)
├─ UpcomingAppointments.tsx
└─ NotificationsSummary.tsx
```

### 2. Pet Management
```typescript
// /frontend/src/app/(authenticated)/tutor/pets/

Sub-rotas:
├─ /[petId]/profile
│  └─ Components:
│     ├─ PetProfileHeader.tsx (foto + nome)
│     ├─ PetTabs.tsx (navegação entre abas)
│     │  ├─ ProfileTab.tsx (dados básicos)
│     │  ├─ HealthTab.tsx (saúde completa)
│     │  ├─ PrestadoresTab.tsx (prestadores)
│     │  ├─ TutoresTab.tsx (tutores)
│     │  ├─ AppointmentsTab.tsx (agendamentos)
│     │  └─ TimelineTab.tsx (histórico)
│     └─ PetEditModal.tsx
│
├─ /[petId]/health
│  └─ Components:
│     ├─ VaccineList.tsx
│     ├─ MedicationList.tsx
│     ├─ HealthPlanCard.tsx
│     ├─ VaccineForm.tsx (modal)
│     ├─ MedicationForm.tsx (modal)
│     └─ HealthChart.tsx (timeline visual)
│
├─ /[petId]/prestadores
│  └─ Components:
│     ├─ PrestadoresList.tsx
│     ├─ PrestadorCard.tsx
│     │  ├─ Avatar + Nome + Rating
│     │  ├─ Especialidade
│     │  ├─ Permissões Display
│     │  └─ Actions: [Editar] [Remover]
│     ├─ InvitePrestadorModal.tsx
│     │  ├─ Email Input
│     │  ├─ Type Selector
│     │  ├─ Permission Checkboxes
│     │  └─ Validity Date Picker
│     └─ PermissionEditor.tsx
│
├─ /[petId]/tutores
│  └─ Components:
│     ├─ TutoresList.tsx
│     │  ├─ TutorCard.tsx (cada tutor)
│     │  └─ RoleSelector.tsx
│     ├─ InviteTutorModal.tsx
│     ├─ GuardianshipRequestForm.tsx
│     └─ PendingRequestsList.tsx
│
└─ /new
   └─ Components:
      ├─ PetFormWizard.tsx
      │  ├─ Step1_BasicInfo.tsx
      │  ├─ Step2_Photo.tsx
      │  ├─ Step3_Health.tsx (opcional)
      │  └─ Step4_Confirmation.tsx
      └─ MicrochipValidator.tsx
```

### 3. Tutores / Guardiões
```typescript
// /frontend/src/app/(authenticated)/tutor/tutores/

Components:
├─ TutoresLayout.tsx
├─ TutoresByRole.tsx
│  ├─ TutoresPrincipal.tsx
│  ├─ TutoresEmergencia.tsx
│  └─ Visitantes.tsx
├─ TutorCard.tsx
├─ AddTutorModal.tsx
│  ├─ EmailInput
│  ├─ RoleSelector
│  └─ PermissionSettings
├─ InviteVisitorModal.tsx          // ← NEW: Convite de Visitante
│  ├─ EmailInput
│  ├─ RelacaoSelector              // Avó, Tio, Amigo, Cuidador, etc
│  ├─ PermissaoVisitanteCheckboxes // DADOS_BASICOS (fixo), STATUS_SAUDE (fixo),
│  │                                // HISTORICO_VACINACAO, MEDICAMENTOS,
│  │                                // AGENDA_CONSULTAS, PRESTADORES_PET,
│  │                                // TIMELINE_ATUALIZACOES
│  ├─ ValidadePicker               // Sem prazo / 30 dias / 90 dias / Personalizado
│  └─ [Cancelar] [Enviar Convite]
├─ VisitorCard.tsx                 // ← NEW: Card do visitante na lista
│  ├─ Nome + Relação + Email
│  ├─ Status (Pendente/Aceito/Expirado)
│  ├─ Permissões ativas (badges)
│  └─ [Revogar Acesso] [Editar Permissões]
├─ GuardianshipRequestsSection.tsx
├─ GuardianshipRequestCard.tsx
│  └─ [Aceitar] [Recusar] [Sugerir Alteração]
└─ ManageTutorModal.tsx
```

### 4. Prestadores Marketplace
```typescript
// /frontend/src/app/(authenticated)/tutor/prestadores/

Components:
├─ PrestadoresLayout.tsx
├─ PrestadorFilters.tsx
│  ├─ TypeFilter: [Vet] [Sitter] [DayCare] [etc]
│  ├─ LocationFilter: [Mapa] [Raio]
│  ├─ RatingFilter: [★★★★★]
│  └─ AvailabilityFilter
├─ PrestadorGrid.tsx
│  └─ PrestadorCard.tsx
│     ├─ Avatar + Nome + Especialidade
│     ├─ Rating + Review Count
│     ├─ Bio/Descrição
│     ├─ Serviços oferecidos
│     ├─ Horários
│     └─ [Ver Perfil] [Convidar]
├─ PrestadorProfileModal.tsx
│  ├─ Header: Foto + Info completa
│  ├─ Bio: Descrição completa
│  ├─ Serviços: O que oferece
│  ├─ Preços: Tabela de serviços
│  ├─ Reviews: Avaliações
│  ├─ Localização: Mapa + Endereço
│  └─ [Convidar]
└─ ReviewList.tsx
```

### 5. Configurações Tutor
```typescript
// /frontend/src/app/(authenticated)/tutor/settings/

Components:
├─ SettingsLayout.tsx (abas)
├─ AccountSettings.tsx
│  ├─ PersonalInfoForm.tsx
│  ├─ EmailChangeForm.tsx
│  ├─ PhoneChangeForm.tsx
│  └─ AddressForm.tsx
├─ SecuritySettings.tsx
│  ├─ PasswordChangeForm.tsx
│  ├─ TwoFactorSetup.tsx
│  └─ SessionManager.tsx
├─ NotificationSettings.tsx
│  ├─ EmailPreferences.tsx
│  ├─ SMSPreferences.tsx
│  └─ PushPreferences.tsx
├─ PrivacySettings.tsx
│  ├─ DataVisibilityOptions.tsx
│  ├─ RecommendationToggle.tsx
│  └─ ExportDataButton.tsx
├─ SubscriptionManager.tsx
│  ├─ CurrentPlanDisplay.tsx
│  ├─ UpgradeButton.tsx
│  └─ BillingHistory.tsx
└─ DangerZone.tsx
   └─ DeleteAccountButton.tsx
```

---

## Componentes do Prestador

### 1. Dashboard Principal
```typescript
// /frontend/src/app/(authenticated)/prestador/home/page.tsx

Componentes:
├─ MetricsCard.tsx (reutilizável)
│  ├─ Revenue this month
│  ├─ Appointments scheduled
│  ├─ Client count
│  └─ Rating average
├─ RevenueChart.tsx (Chart.js ou Recharts)
├─ NextAppointmentsWidget.tsx
├─ ReputationWidget.tsx
│  ├─ Star rating
│  ├─ Recent reviews preview
│  └─ [Ver Todos]
├─ PendingInvitesWidget.tsx
│  └─ [Aceitar] [Recusar]
└─ QuickActionButtons.tsx
   ├─ [Editar Agenda]
   ├─ [Novo Serviço]
   └─ [Ver Financeiro]
```

### 2. Meus Clientes (Pets)
```typescript
// /frontend/src/app/(authenticated)/prestador/clientes/

Components:
├─ ClientsList.tsx
├─ ClientCard.tsx
│  ├─ Pet info + avatar
│  ├─ Tutor name
│  ├─ Last appointment
│  ├─ Permissions list
│  └─ [Ver Prontuário] [Agendar]
├─ ClientFilters.tsx
│  ├─ Filter by status (ativo, pendente)
│  └─ Sort by (recent, name)
├─ ClientDetail.tsx (/[petId])
│  ├─ PetProfileHeader.tsx
│  ├─ ClientInfoCard.tsx (tutor)
│  ├─ HealthRecords.tsx (read-only)
│  ├─ ServiceHistory.tsx
│  │  ├─ Date
│  │  ├─ Service type
│  │  ├─ Notes
│  │  └─ Amount
│  └─ Actions:
│     ├─ [Agendar Consulta]
│     ├─ [Registrar Serviço]
│     ├─ [Enviar Mensagem]
│     └─ [Editar Permissões]
└─ AcceptInviteModal.tsx
```

### 3. Agenda
```typescript
// /frontend/src/app/(authenticated)/prestador/agenda/

Components:
├─ CalendarView.tsx (Month/Week/Day)
│  └─ Powered by: react-big-calendar ou fullcalendar
├─ AppointmentCard.tsx
│  ├─ Time + Pet name
│  ├─ Client name
│  ├─ Service type
│  ├─ Location / Type (presencial/home/tele)
│  ├─ Status: [Confirmado] [Pendente] [Concluído]
│  └─ Actions: [Editar] [Confirmar] [Cancelar]
├─ AvailabilityManager.tsx
│  ├─ Set working hours
│  ├─ Define off days
│  └─ Configure appointment duration
├─ AppointmentForm.tsx (modal)
│  ├─ Client selector
│  ├─ Date time picker
│  ├─ Service type selector
│  ├─ Location/type toggle
│  ├─ Notes field
│  └─ Confirm button
└─ AppointmentHistory.tsx
   └─ Past appointments list
```

### 4. Financeiro
```typescript
// /frontend/src/app/(authenticated)/prestador/financeiro/

Components:
├─ FinancialDashboard.tsx
│  ├─ RevenueCard.tsx
│  │  ├─ Total this month
│  │  ├─ Commission deducted
│  │  ├─ Your earnings
│  │  └─ Trend indicator
│  ├─ TransactionList.tsx
│  │  ├─ Date
│  │  ├─ Client pet
│  │  ├─ Service
│  │  ├─ Amount
│  │  └─ Status
│  ├─ WithdrawalSection.tsx
│  │  ├─ Available balance
│  │  ├─ Next withdrawal date
│  │  └─ [Request Withdrawal]
│  └─ BankDetailsForm.tsx
├─ TransactionFilter.tsx
│  ├─ Date range picker
│  ├─ Status filter
│  └─ Export button
├─ WithdrawalHistoryModal.tsx
│  └─ Past withdrawals list
└─ InvoiceGenerator.tsx (opcional)
```

### 5. Reputação
```typescript
// /frontend/src/app/(authenticated)/prestador/reputacao/

Components:
├─ RatingWidget.tsx (grande)
│  ├─ Star count (4.8 ⭐)
│  ├─ Total reviews (47)
│  └─ Rating breakdown (5★ x%, 4★ x%, etc)
├─ ReviewList.tsx
│  └─ ReviewCard.tsx
│     ├─ Client name
│     ├─ Pet name
│     ├─ Rating (stars)
│     ├─ Review text
│     ├─ Date
│     ├─ Photos (se houver)
│     └─ [Responder] [Report]
├─ ResponseForm.tsx (modal)
│  └─ Thank you message input
├─ ReviewFilters.tsx
│  ├─ By rating (5, 4, 3, 2, 1)
│  ├─ By date
│  └─ By keyword
└─ ReportReviewModal.tsx (se necessário reportar)
```

### 6. Configurações Prestador
```typescript
// /frontend/src/app/(authenticated)/prestador/settings/

Components (estendidos de Tutor):
├─ ProfessionalProfileSettings.tsx
│  ├─ Professional photo
│  ├─ Bio/description
│  ├─ Credentials (CRMV, etc)
│  ├─ Service types offered
│  ├─ Website/social links
│  └─ Pricing table editor
├─ BankDetailsForm.tsx
│  ├─ Bank selector dropdown
│  ├─ Agency/account inputs
│  ├─ Account type selector
│  └─ Holder name validation
├─ ServiceTypesManager.tsx
│  ├─ Add/remove service types
│  ├─ Price per service
│  ├─ Duration per service
│  └─ Location types (presencial/home/tele)
└─ AvailabilityManager.tsx
   ├─ Working hours
   ├─ Days off
   └─ Appointment buffer time
```

---

## Componentes do Visitante

> **🔒 REGRA CRÍTICA:** Visitante só vê dados de pets para os quais recebeu e aceitou convite.
> Todas as telas devem verificar `PetVisitante.aceito === true` e `permissoesVisualizacao`.
> Ver regras completas em `VISITOR_ACCESS_RULES.md`.

### 1. Dashboard Principal
```typescript
// /frontend/src/app/(authenticated)/visitante/home/page.tsx

Componentes (simplificados):

// Estado quando NÃO tem convites aceitos:
├─ EmptyStateNoInvites.tsx                    // ← NEW
│  ├─ Mensagem: "Nenhum pet disponível"
│  ├─ Instrução: "Peça ao tutor para enviar convite"
│  └─ Email do usuário (para facilitar compartilhamento)

// Convites pendentes de aceitação:
├─ PendingInvitesList.tsx                     // ← NEW
│  └─ PendingInviteCard.tsx
│     ├─ Pet name + photo
│     ├─ Convidado por: [tutor name]
│     ├─ Relação: [tipo selecionado]
│     ├─ Permissões oferecidas (badges)
│     ├─ Data de expiração (se houver)
│     └─ [Aceitar Convite] [Recusar]

// Estado quando TEM pets (convites aceitos):
├─ PetCardList.tsx (read-only)
│  └─ PetCard.tsx (versão visitante)
│     ├─ Photo
│     ├─ Name + basic info
│     ├─ Health status
│     ├─ Convidado por: [tutor name]
│     ├─ Desde: [data aceite]
│     ├─ Last update
│     └─ [Ver Detalhes]
├─ UpdatesFeed.tsx (timeline apenas, conforme permissões)
│  └─ UpdateItem.tsx
│     ├─ Icon + action
│     ├─ Pet name
│     ├─ Description
│     └─ Timestamp
├─ HealthAlerts.tsx (conforme permissões do convite)
│  └─ Alert items (apenas se HISTORICO_VACINACAO ou MEDICAMENTOS autorizados)
└─ ContactTutorWidget.tsx
   └─ [Chamar Tutor]
```

### 2. Pets que Acompanho (Visualização por Convite)
```typescript
// /frontend/src/app/(authenticated)/visitante/pets/

Components:
├─ PetsLayout.tsx
├─ PetCard.tsx (read-only version, com badge "Convidado por [tutor]")
├─ PetDetail.tsx (/[petId])
│  ├─ PetProfileHeader.tsx
│  │  └─ Photo + name + breed + "Convidado por: [tutor]"
│  ├─ BasicInfoCard.tsx                       // SEMPRE visível
│  │  ├─ Age
│  │  ├─ Sex
│  │  └─ Tutor name (link to contact)
│  ├─ HealthSummary.tsx                       // SEMPRE visível (STATUS_SAUDE)
│  │  └─ Resumo geral de saúde
│  ├─ VaccinationHistory.tsx                  // 🔒 Só se HISTORICO_VACINACAO
│  │  └─ Vaccination status (icons) + datas
│  ├─ MedicationsCard.tsx                     // 🔒 Só se MEDICAMENTOS
│  │  └─ Active medications list
│  ├─ AppointmentsCard.tsx                    // 🔒 Só se AGENDA_CONSULTAS
│  │  └─ Next appointment info
│  ├─ ProfessionalsCard.tsx                   // 🔒 Só se PRESTADORES_PET
│  │  └─ List with contact info
│  ├─ UpdatesTimeline.tsx                     // 🔒 Só se TIMELINE_ATUALIZACOES
│  │  └─ Recent activities only
│  ├─ LockedSectionPlaceholder.tsx            // ← NEW: para seções não autorizadas
│  │  └─ "🔒 Peça ao tutor para liberar acesso"
│  ├─ ContactTutorButton.tsx
│  └─ LeaveAccessButton.tsx                   // ← NEW: auto-revogar acesso
│     └─ "Sair deste pet" (confirmar antes)
├─ NothingToSeeWarning.tsx (sem convites aceitos)
└─ AccessDeniedPage.tsx (tentou acessar pet sem convite)
```

### 3. Atualizações (Timeline)
```typescript
// /frontend/src/app/(authenticated)/visitante/atualizacoes/

Components:
├─ UpdatesList.tsx
├─ UpdateCard.tsx
│  ├─ Icon (type-specific)
│  ├─ Pet name
│  ├─ Action description
│  ├─ Timestamp
│  └─ By whom (tutor/prestador)
├─ FilterSection.tsx
│  ├─ By pet
│  ├─ By date range
│  └─ Type filter
└─ LoadMoreButton.tsx
```

### 4. Mensagens
```typescript
// /frontend/src/app/(authenticated)/visitante/mensagens/

Components (simplificados):
├─ ConversationList.tsx
│  └─ ConversationItem.tsx (apenas tutores)
├─ ChatInterface.tsx
│  ├─ MessageList.tsx (read/send)
│  ├─ MessageInput.tsx
│  └─ AttachmentUpload.tsx (opcional)
├─ TypingIndicator.tsx
└─ ContactRequestForm.tsx (se novo contato)
```

### 5. Configurações Visitante
```typescript
// /frontend/src/app/(authenticated)/visitante/settings/

Components (muito simplificadas):
├─ AccountSettings.tsx
│  ├─ Name
│  ├─ Email
│  └─ Relationship field
├─ SecuritySettings.tsx (apenas password)
├─ NotificationSettings.tsx (básico)
│  └─ Toggle email/SMS
└─ LogoutAllButton.tsx
```

---

## Rotas Recomendadas

### Estrutura de Pastas Frontend

```
/frontend/src/
├─ /app
│  ├─ /auth
│  │  ├─ /login
│  │  ├─ /register
│  │  │  ├─ /step-1
│  │  │  ├─ /step-2
│  │  │  ├─ /step-3
│  │  │  └─ /step-4
│  │  └─ /forgot-password
│  │
│  ├─ /(authenticated)
│  │  ├─ /tutor
│  │  │  ├─ /home
│  │  │  ├─ /pets
│  │  │  │  ├─ /[petId]
│  │  │  │  │  ├─ /profile
│  │  │  │  │  ├─ /health
│  │  │  │  │  ├─ /prestadores
│  │  │  │  │  ├─ /tutores
│  │  │  │  │  └─ /timeline
│  │  │  │  └─ /new
│  │  │  ├─ /tutores
│  │  │  ├─ /prestadores (marketplace)
│  │  │  ├─ /prestadores
│  │  │  │  └─ /[id] (detail modal)
│  │  │  ├─ /notificacoes
│  │  │  ├─ /mensagens
│  │  │  │  └─ /[conversationId]
│  │  │  └─ /settings
│  │  │
│  │  ├─ /prestador
│  │  │  ├─ /home
│  │  │  ├─ /clientes
│  │  │  │  └─ /[petId]
│  │  │  ├─ /agenda
│  │  │  ├─ /financeiro
│  │  │  ├─ /reputacao
│  │  │  ├─ /notificacoes
│  │  │  ├─ /mensagens
│  │  │  │  └─ /[conversationId]
│  │  │  └─ /settings
│  │  │
│  │  └─ /visitante
│  │     ├─ /home
│  │     ├─ /pets
│  │     │  └─ /[petId]
│  │     ├─ /atualizacoes
│  │     ├─ /notificacoes
│  │     ├─ /mensagens
│  │     │  └─ /[conversationId]
│  │     └─ /settings
│  │
│  └─ /layout.tsx (root layout)
│
├─ /components
│  ├─ /shared
│  │  ├─ TopBar.tsx
│  │  ├─ NotificationCenter.tsx
│  │  ├─ MessageCenter.tsx
│  │  ├─ ProfileCard.tsx
│  │  ├─ MetricsCard.tsx
│  │  └─ /modals
│  │     ├─ ConfirmationModal.tsx
│  │     ├─ LoadingModal.tsx
│  │     └─ ErrorModal.tsx
│  │
│  ├─ /tutor
│  │  ├─ /home
│  │  ├─ /pets
│  │  ├─ /tutores
│  │  ├─ /prestadores
│  │  └─ /settings
│  │
│  ├─ /prestador
│  │  ├─ /home
│  │  ├─ /clientes
│  │  ├─ /agenda
│  │  ├─ /financeiro
│  │  ├─ /reputacao
│  │  └─ /settings
│  │
│  └─ /visitante
│     ├─ /home
│     ├─ /pets
│     ├─ /atualizacoes
│     └─ /settings
│
├─ /contexts
│  ├─ AuthContext.tsx
│  ├─ NotificacaoContext.tsx
│  ├─ MessageContext.tsx
│  └─ UserTypeContext.tsx (novo)
│
├─ /hooks
│  ├─ useAuth.ts
│  ├─ useNotificacoes.ts
│  ├─ useMessages.ts
│  ├─ usePermissions.ts (novo)
│  └─ useVisitorAccess.ts (novo)      // Verifica permissões do visitante por pet
│     └─ canViewSection(petId, permission)
│     └─ getVisiblePermissions(petId)
│
├─ /lib
│  ├─ api.ts
│  ├─ config.ts
│  ├─ permissions.ts (novo)
│  │  └─ canUserAccess()
│  │  └─ canUserEdit()
│  │  └─ getVisibleFields()
│  └─ visitor-permissions.ts (novo)   // Lógica do VISITOR_ACCESS_RULES.md
│     └─ canVisitorAccess(petId, permission)
│     └─ canInviteVisitor(petId, userId)
│     └─ getVisitorPermissions(petId)
│
└─ /styles
   ├─ globals.css
   ├─ colors.css
   └─ profiles.css (colors by profile)
```

### Rotas da API Backend

```
GET    /api/v1/auth/me
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

GET    /api/v1/users/profile
PUT    /api/v1/users/profile
GET    /api/v1/users/permissions

GET    /api/v1/pets
POST   /api/v1/pets
GET    /api/v1/pets/:petId
PUT    /api/v1/pets/:petId
DELETE /api/v1/pets/:petId

GET    /api/v1/pets/:petId/health/vacinas
POST   /api/v1/pets/:petId/health/vacinas
GET    /api/v1/pets/:petId/health/medicamentos
POST   /api/v1/pets/:petId/health/medicamentos

GET    /api/v1/pets/:petId/prestadores
POST   /api/v1/pets/:petId/prestadores/convidar
DELETE /api/v1/pets/:petId/prestadores/:id

GET    /api/v1/pets/:petId/tutores
POST   /api/v1/pets/:petId/tutores/convidar

GET    /api/v1/notifications
GET    /api/v1/notifications/count
PATCH  /api/v1/notifications/:id/read
POST   /api/v1/notifications/read-all

GET    /api/v1/messages
POST   /api/v1/messages
GET    /api/v1/messages/:conversationId

GET    /api/v1/prestadores
GET    /api/v1/prestadores/:id
PUT    /api/v1/prestadores/profile
GET    /api/v1/prestadores/clientes
GET    /api/v1/prestadores/agenda
POST   /api/v1/prestadores/agenda

# Visitantes (NEW - ver VISITOR_ACCESS_RULES.md)
POST   /api/v1/pets/:petId/visitantes/convidar     # Tutor convida visitante
GET    /api/v1/pets/:petId/visitantes               # Listar visitantes do pet
DELETE /api/v1/pets/:petId/visitantes/:id            # Revogar acesso (soft delete)
PATCH  /api/v1/pets/:petId/visitantes/:id/permissoes # Editar permissões do visitante
POST   /api/v1/visitantes/convites/:id/aceitar      # Visitante aceita convite
POST   /api/v1/visitantes/convites/:id/recusar      # Visitante recusa convite
GET    /api/v1/visitantes/convites/pendentes         # Convites pendentes do visitante
GET    /api/v1/visitantes/pets                       # Pets que o visitante acompanha
GET    /api/v1/visitantes/pets/:petId                # Detalhe do pet (respeita permissões)
DELETE /api/v1/visitantes/pets/:petId/sair           # Auto-revogar acesso
```

---

## 🎨 Design System

### Paleta de Cores

```css
/* Primary */
--color-tutor: #2563EB;        /* Blue */
--color-prestador: #10B981;     /* Green */
--color-visitante: #6B7280;     /* Gray */

/* Semantic */
--color-success: #059669;
--color-error: #DC2626;
--color-warning: #F59E0B;
--color-info: #0EA5E9;

/* Neutral */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F9FAFB;
--color-text-primary: #111827;
--color-text-secondary: #6B7280;
--color-border: #E5E7EB;
```

### Tipografia

```css
--font-heading-xl: 32px / 40px;
--font-heading-lg: 24px / 32px;
--font-heading-md: 20px / 28px;
--font-body-lg: 16px / 24px;
--font-body-md: 14px / 20px;
--font-body-sm: 12px / 16px;
```

### Spacing

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
```

---

**Status:** Pronto para handoff ao time de design/desenvolvimento
**Próximos passos:** Criar wireframes detalhados e protótipos no Figma

