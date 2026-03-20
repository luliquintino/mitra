# 🎯 Jornadas de Usuário por Perfil - MITRA

**Status:** Pronto para implementação
**Última atualização:** 07/03/2026

---

## 📋 Índice

1. [👨‍👩‍👧 Jornada do TUTOR](#jornada-do-tutor)
2. [🏥 Jornada do PRESTADOR](#jornada-do-prestador)
3. [👥 Jornada do VISITANTE](#jornada-do-visitante)
4. [🔄 Fluxos Compartilhados](#fluxos-compartilhados)
5. [📊 Comparativo de Funcionalidades](#comparativo-de-funcionalidades)

---

## 👨‍👩‍👧 Jornada do TUTOR

### 📍 Perfil
- **Email:** luiza.tutora@teste.com
- **Tipo:** TUTOR
- **Visão Central:** Centralizar toda a gestão de saúde e bem-estar dos seus pets
- **Princípio:** "Meu pet, minha responsabilidade, minhas decisões"

### 🎯 Onboarding (Primeiros Passos)

**Tela 1: Bem-vindo**
```
┌─────────────────────────────────┐
│         🐾 Bem-vindo à MITRA    │
├─────────────────────────────────┤
│ Gerencie a saúde e bem-estar   │
│ dos seus pets em um só lugar    │
│                                 │
│ [Começar →]                     │
└─────────────────────────────────┘
```

**Tela 2: Primeiro Pet**
```
┌─────────────────────────────────┐
│ Registre seu primeiro pet       │
├─────────────────────────────────┤
│ Nome: _________                 │
│ Raça: _________                 │
│ Data Nascimento: ___/___/___    │
│ Foto: [📷 Upload]               │
│                                 │
│ [Próximo →]                     │
└─────────────────────────────────┘
```

**Tela 3: Convide Prestadores**
```
┌─────────────────────────────────┐
│ Convide seu veterinário         │
├─────────────────────────────────┤
│ (Vamos ajudá-lo depois)         │
│                                 │
│ [Pular] [Convidar Agora →]      │
└─────────────────────────────────┘
```

### 🏠 Home (Dashboard Principal)

**Layout:**
```
┌──────────────────────────────────────────┐
│ 🐾 Olá, Luiza! (avatar + nome)           │ 🔔 Notificações
├──────────────────────────────────────────┤
│                                          │
│ 📊 MEUS PETS (Seção Principal)           │
│ ┌────────────────────────────────────┐   │
│ │ 🐕 Luna                            │   │
│ │ Raça: Golden Retriever             │   │
│ │ Próxima vacina: 15/03              │   │
│ │ Status: ✅ Saúde em dia            │   │
│ │ Tutores: Ana (você), João          │   │
│ │ Prestadores: Dr. Silva (Vet)       │   │
│ │ [Ver Detalhes] [Editar]            │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ 🐈 Miau                            │   │
│ │ Raça: Persa                        │   │
│ │ Próximo banho: 20/03               │   │
│ │ Status: ⚠️ Precisa de atenção      │   │
│ │ [Ver Detalhes]                     │   │
│ └────────────────────────────────────┘   │
│                                          │
│ [+ Adicionar Pet]                        │
│                                          │
│ ─────────────────────────────────────────│
│                                          │
│ 🔄 ATIVIDADES RECENTES                   │
│ • Dr. Silva registrou vacina (há 2h)    │
│ • Nova solicitação de guarda (há 1d)    │
│ • João marcou presença (há 3d)          │
│                                          │
└──────────────────────────────────────────┘
```

**Menu Principal (Bottom Navigation / Sidebar):**
```
├─ 🏠 Home (Ativo)
├─ 🐾 Meus Pets
├─ 👥 Tutores
├─ 🏥 Prestadores
├─ 📋 Documentos
├─ ⚙️ Configurações
└─ 👤 Minha Conta
```

### 📍 Seção: MEUS PETS (Detalhes Completos)

**Página de Pet - Abas:**

**1. 📋 Perfil**
```
┌─────────────────────────────────┐
│ 🐕 Luna - Golden Retriever      │
├─────────────────────────────────┤
│ Foto: [imagem grande]           │
│                                 │
│ Dados Pessoais:                 │
│ • Data Nascimento: 10/05/2020   │
│ • Sexo: Fêmea                   │
│ • Pelagem: Dourada              │
│ • Microchip: A1B2C3D4E5F6G7H8   │
│                                 │
│ Status: ✅ Documentado          │
│ [Editar Dados]                  │
└─────────────────────────────────┘
```

**2. 💊 Saúde**
```
┌─────────────────────────────────┐
│ 💉 Vacinações                   │
│ ┌───────────────────────────────┤
│ │ ✅ Raiva       [02/03/2025]   │
│ │ ✅ V10         [02/03/2025]   │
│ │ ⏳ Reforço      [Em breve]     │
│ └───────────────────────────────┤
│                                 │
│ 💊 Medicamentos Ativos          │
│ ┌───────────────────────────────┤
│ │ Amoxicilina (3 dias)          │
│ │ Antialérgico (conforme uso)   │
│ └───────────────────────────────┤
│                                 │
│ 🏥 Plano de Saúde               │
│ • Vet Pets (Ativo até 12/2026)  │
│                                 │
│ [+ Registrar Vacina]            │
│ [+ Adicionar Medicamento]       │
└─────────────────────────────────┘
```

**3. 🤝 Prestadores**
```
┌─────────────────────────────────┐
│ Veterinários (1)                │
│ ┌───────────────────────────────┤
│ │ 👨‍⚕️ Dr. Silva                  │
│ │ Clínica Veterinária Silva     │
│ │ ⭐⭐⭐⭐⭐ (5.0)                  │
│ │ Permissões:                   │
│ │ ✓ Visualizar                  │
│ │ ✓ Registrar Vacina            │
│ │ ✓ Editar Saúde                │
│ │ Status: Ativo desde 10/02     │
│ │ [Revogar Acesso] [Editar]     │
│ └───────────────────────────────┤
│                                 │
│ Pet Sitters (1)                 │
│ ┌───────────────────────────────┤
│ │ 👩 Maria Sitter               │
│ │ ⭐⭐⭐⭐ (4.5)                   │
│ │ Status: Aguardando aceitar    │
│ └───────────────────────────────┤
│                                 │
│ [+ Convidar Prestador]          │
└─────────────────────────────────┘
```

**4. 👥 Tutores / Guardiões**
```
┌─────────────────────────────────┐
│ Tutores Principais (2)          │
│ ┌───────────────────────────────┤
│ │ 👩 Você (Proprietário)        │
│ │ Ana Silva                      │
│ │ Criou este pet                 │
│ │ Permissões: Todas             │
│ └───────────────────────────────┤
│ ┌───────────────────────────────┤
│ │ 👨 João Silva (Cônjuge)       │
│ │ Adicionado há 5 meses         │
│ │ Permissões: Todas             │
│ │ [Remove] [Editar Permissões]  │
│ └───────────────────────────────┤
│                                 │
│ Tutores de Emergência (1)       │
│ ┌───────────────────────────────┤
│ │ 👴 Pai                        │
│ │ Criado para emergências       │
│ │ Status: Confirmado            │
│ └───────────────────────────────┤
│                                 │
│ [+ Convidar Tutor]              │
│ [+ Solicitar Guarda Provisória] │
└─────────────────────────────────┘
```

**5. 📅 Agendamentos**
```
┌─────────────────────────────────┐
│ Próximos Atendimentos           │
│ ┌───────────────────────────────┤
│ │ 🩺 Consulta - Dr. Silva       │
│ │ 15/03/2026 às 10:00           │
│ │ Clínica Veterinária Silva     │
│ │ [Editar] [Cancelar]           │
│ └───────────────────────────────┤
│                                 │
│ ┌───────────────────────────────┤
│ │ 🛁 Banho - Petshop João      │
│ │ 18/03/2026 às 14:00           │
│ │ [Editar] [Cancelar]           │
│ └───────────────────────────────┤
│                                 │
│ [+ Agendar Novo Serviço]        │
└─────────────────────────────────┘
```

**6. 📜 Histórico / Timeline**
```
┌─────────────────────────────────┐
│ Histórico Completo do Pet       │
│ ┌───────────────────────────────┤
│ │ 06/03 - Dr. Silva registrou   │
│ │         vacina (Raiva)        │
│ │ 04/03 - João marcou presença  │
│ │ 28/02 - Peso: 27kg            │
│ │ 25/02 - Banho realizado       │
│ │ 20/02 - Consulta agendada     │
│ └───────────────────────────────┤
│                                 │
│ [Filtrar] [Exportar Relatório]  │
└─────────────────────────────────┘
```

### 📍 Seção: TUTORES (Gerenciamento)

**Página de Tutores:**
```
┌─────────────────────────────────┐
│ Tutores dos Meus Pets           │
├─────────────────────────────────┤
│                                 │
│ Principal (2):                  │
│ ├─ Você (Ana)                   │
│ └─ João Silva (Cônjuge)         │
│                                 │
│ Emergência (1):                 │
│ └─ Pai (Confirmado)             │
│                                 │
│ Visitantes (0):                 │
│ [+ Convidar Familiar/Visitante] │
│                                 │
│ ─────────────────────────────────│
│                                 │
│ Solicitações Pendentes:         │
│ ├─ Guarda prov. (Maria) - 🔔    │
│ └─ Tutoria temporária (Carlos)  │
│                                 │
│ [Aceitar] [Recusar]             │
│                                 │
└─────────────────────────────────┘
```

**Modal: Convidar Visitante** (abre ao clicar [+ Convidar Familiar/Visitante]):
```
┌─────────────────────────────────┐
│ Convidar Visitante               │
├─────────────────────────────────┤
│ Email: ___________________       │
│ Relação: [Familiar ▼]           │
│                                  │
│ Informações visíveis:            │
│ ☑ Dados básicos (nome, raça)     │
│ ☑ Status de saúde               │
│ ☐ Histórico de vacinação        │
│ ☐ Medicamentos                   │
│ ☐ Agenda de consultas            │
│ ☐ Prestadores do pet             │
│                                  │
│ Validade: [Sem prazo ▼]          │
│                                  │
│ [Cancelar] [Enviar Convite]      │
└─────────────────────────────────┘
```

> **Regras do Convite de Visitante:**
> - Convite é **por pet** (precisa enviar um para cada pet)
> - Dados básicos + Status de saúde são **sempre visíveis** (não desmarcar)
> - Outras permissões são opcionais e configuráveis pelo tutor
> - Visitante precisa **aceitar** o convite para ter acesso
> - Tutor pode **revogar** acesso a qualquer momento
> - Visitante **NUNCA** pode convidar outros visitantes ou prestadores
> - Ver regras completas em `VISITOR_ACCESS_RULES.md`

### 📍 Seção: PRESTADORES (Marketplace)

**Página de Prestadores:**
```
┌──────────────────────────────────┐
│ Encontre Prestadores             │
├──────────────────────────────────┤
│ [🔍 Buscar] [Filtros ▼]          │
│                                  │
│ Veterinários (48 disponíveis)    │
│ ┌────────────────────────────────┤
│ │ 👨‍⚕️ Dr. Silva                  │
│ │ Clínica Veterinária Silva      │
│ │ ⭐⭐⭐⭐⭐ (5.0) - 120 reviews  │
│ │ "Excelente atendimento"        │
│ │ 📍 Zona Norte - SP             │
│ │ 💬 "Especializado em cães"     │
│ │ [Ver Perfil] [Convidar]        │
│ └────────────────────────────────┤
│                                  │
│ Pet Sitters (15 disponíveis)     │
│ ┌────────────────────────────────┤
│ │ 👩 Maria Sitter                │
│ │ ⭐⭐⭐⭐ (4.8) - 56 reviews     │
│ │ Passeios diários e cuidados    │
│ │ [Ver Perfil] [Convidar]        │
│ └────────────────────────────────┤
│                                  │
│ Day Cares (8 disponíveis)        │
│ Day Care Puppies                 │
│ [Ver Perfil] [Convidar]          │
│                                  │
└──────────────────────────────────┘
```

### ⚙️ Configurações do Tutor

**Página de Configurações:**
```
┌─────────────────────────────────┐
│ Configurações Pessoais          │
├─────────────────────────────────┤
│                                 │
│ Conta                           │
│ ├─ Dados Pessoais: Ana Silva... │
│ ├─ Email: luiza.tutora@...      │
│ ├─ Telefone: 11 99999-0001      │
│ ├─ Endereco: Rua das Flores...  │
│ ├─ Documento: ••••••••••1234    │
│ └─ [Editar]                     │
│                                 │
│ Segurança                       │
│ ├─ Senha: ••••••••              │
│ ├─ Autenticação 2FA: ✓ Ativada  │
│ ├─ Logout de todos os dispositivos │
│ └─ [Gerenciar Sessões]          │
│                                 │
│ Privacidade & Notificações      │
│ ├─ Permitir recomendações: ✓    │
│ ├─ Notificações por email: ✓    │
│ ├─ SMS: ✓                       │
│ └─ [Personalizar]               │
│                                 │
│ Plano & Assinatura              │
│ ├─ Plano: PREMIUM (R$ 29/mês)   │
│ ├─ Renovação: 07/04/2026        │
│ ├─ Método de Pagamento: Visa    │
│ └─ [Gerenciar Assinatura]       │
│                                 │
│ Dados & Privacidade             │
│ ├─ Exportar Meus Dados          │
│ ├─ Política de Privacidade      │
│ ├─ Termos de Serviço            │
│ └─ Deletar Conta...             │
│                                 │
└─────────────────────────────────┘
```

---

## 🏥 Jornada do PRESTADOR

### 📍 Perfil
- **Email:** luiza.prestadora@teste.com
- **Tipo:** PRESTADOR
- **Especialidade:** Veterinário
- **Visão Central:** "Atender qualidade e crescer profissionalmente"
- **Princípio:** "Oferecer melhor serviço, ganhar reputação, escalar negócio"

### 🎯 Onboarding (Primeiros Passos)

**Tela 1: Bem-vindo Profissional**
```
┌─────────────────────────────────┐
│ Bem-vindo ao MITRA Pro! 🚀      │
├─────────────────────────────────┤
│ Expanda seu negócio veterinário  │
│ com nossa plataforma             │
│                                 │
│ [Configurar Perfil →]            │
└─────────────────────────────────┘
```

**Tela 2: Perfil Profissional**
```
┌─────────────────────────────────┐
│ Configure seu Perfil Profissional│
├─────────────────────────────────┤
│ Tipo: Veterinário (fixo)        │
│ Empresa: Clínica Vet Luiza      │
│ CNPJ: ••••••••••••              │
│ Telefone: 11 ••••-••••          │
│ Endereço: Rua... São Paulo      │
│ CRMV: ••••••                    │
│ Descrição:                      │
│ [Especializada em cães]         │
│ Website: www.clinicavet.com.br  │
│                                 │
│ [Próximo →]                     │
└─────────────────────────────────┘
```

**Tela 3: Método de Recebimento**
```
┌─────────────────────────────────┐
│ Configure Pagamentos            │
├─────────────────────────────────┤
│ Banco: Itaú                     │
│ Agência: ••••                   │
│ Conta: ••••••                   │
│ Tipo: Corrente                  │
│                                 │
│ ⚠️ Você receberá 85% do valor    │
│ (MITRA fica com 15% de comissão)│
│                                 │
│ [Confirmar →]                   │
└─────────────────────────────────┘
```

### 🏠 Home (Dashboard Principal)

**Layout:**
```
┌──────────────────────────────────────────┐
│ 🏥 Olá, Luiza! (avatar + nome + PREMIUM) │ 🔔 Notificações
├──────────────────────────────────────────┤
│                                          │
│ 📊 DASHBOARD PROFISSIONAL                │
│ ┌────────────────────────────────────┐   │
│ │ 💰 Faturamento (Este Mês)          │   │
│ │ R$ 1.245,50 (+15% vs mês anterior) │   │
│ │ • 8 consultas realizadas           │   │
│ │ • Valor médio: R$ 155,68           │   │
│ │ • Próximo saque: 05/04 (R$ 1.058)  │   │
│ │ [Ver Extrato Detalhado]            │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ⭐ Reputação                             │
│ │ 4.8 ⭐ (47 avaliações)                │
│ │ "Ótima profissional, recomendo" ✓   │
│ │ [Ver Comentários]                   │
│                                          │
│ 📅 Próximos Agendamentos                 │
│ │ 🕐 15/03 10:00 - Luna (Golden)       │
│ │ 🕐 15/03 14:00 - Miau (Persa)        │
│ │ 🕐 18/03 09:00 - Rex (Labrador)      │
│ │ [Ver Agenda Completa]                │
│                                          │
│ 🔔 Pendências                            │
│ │ • 2 Convites novos ⚠️                 │
│ │ • 1 Saque aguardando (R$ 500)       │
│ │ • Avaliar 3 clientes                │
│                                          │
│ ─────────────────────────────────────────│
│                                          │
│ 🎯 AÇÕES RÁPIDAS                         │
│ [📋 Editar Agenda] [📍 Novo Serviço]    │
│ [⭐ Ver Reviews]    [💬 Mensagens]       │
│                                          │
└──────────────────────────────────────────┘
```

**Menu Principal:**
```
├─ 🏠 Home (Ativo)
├─ 📅 Minha Agenda
├─ 🐾 Meus Clientes (Pets)
├─ 💰 Financeiro
├─ ⭐ Reputação
├─ 💬 Mensagens
├─ 📊 Relatórios
├─ ⚙️ Configurações
└─ 👤 Meu Perfil
```

### 📍 Seção: MEUS CLIENTES (Pets Atendidos)

**Página de Pets:**
```
┌──────────────────────────────────┐
│ Pets que Atendo (8)              │
├──────────────────────────────────┤
│                                  │
│ Ativos (7):                      │
│ ┌────────────────────────────────┤
│ │ 🐕 Luna (Golden Retriever)     │
│ │ Tutor: Ana Silva               │
│ │ Permissões: Visualizar,        │
│ │            Registrar Vacina,   │
│ │            Editar Saúde        │
│ │ Convite: Aceito (10/02)        │
│ │ Último atendimento: 06/03      │
│ │ [Ver Prontuário] [Agendar]     │
│ └────────────────────────────────┤
│                                  │
│ ┌────────────────────────────────┤
│ │ 🐈 Miau (Persa)                │
│ │ Tutor: João Costa              │
│ │ Permissões: Visualizar,        │
│ │            Registrar Serviço   │
│ │ Convite: Pendente ⏳           │
│ │ [Aceitar] [Recusar]            │
│ └────────────────────────────────┤
│                                  │
│ ... (5 mais)                     │
│                                  │
└──────────────────────────────────┘
```

### 📍 Seção: AGENDA

**Página de Agenda:**
```
┌──────────────────────────────────┐
│ 📅 Minha Agenda - Março/2026     │
├──────────────────────────────────┤
│ [◀ Fevereiro] [Abril ▶]          │
│                                  │
│ Seg 15/03                         │
│ ├─ 10:00 - Luna (Golden)         │
│ │  Consulta de rotina            │
│ │  📍 Clínica (Rua...)           │
│ │  [Confirmar] [Editar]          │
│ │                                │
│ ├─ 14:00 - Miau (Persa)          │
│ │  Vacinação (2ª dose)           │
│ │  📍 Clínica                    │
│ │  [✓ Confirmado]                │
│ │                                │
│ └─ 15:30 - Rex (Lab)             │
│    Home visit (Banho)            │
│    📍 Rua Brasil, 100            │
│    [Confirmar]                   │
│                                  │
│ Qua 16/03                         │
│ └─ 09:00 - Bella (Bulldog)       │
│    Consulta                      │
│                                  │
│ [+ Adicionar Disponibilidade]    │
│ [⚙️ Configurar Horários]         │
│                                  │
└──────────────────────────────────┘
```

### 📍 Seção: FINANCEIRO

**Página de Financeiro:**
```
┌──────────────────────────────────┐
│ 💰 Financeiro                    │
├──────────────────────────────────┤
│                                  │
│ Resumo (Março/2026)              │
│ ┌────────────────────────────────┤
│ │ Faturamento: R$ 1.245,50       │
│ │ Comissão (15%): -R$ 186,83     │
│ │ ────────────────────────────   │
│ │ Seu Ganho: R$ 1.058,67         │
│ │ ────────────────────────────   │
│ │ Status: ✓ Pronto para Saque    │
│ └────────────────────────────────┤
│                                  │
│ Transações Recentes:             │
│ ┌────────────────────────────────┤
│ │ 06/03 - Consulta (Luna)        │
│ │         Tutor: Ana             │
│ │         Valor: R$ 150          │
│ │         Status: ✓ Concluído    │
│ │                                │
│ │ 04/03 - Consulta (Miau)        │
│ │         Tutor: João            │
│ │         Valor: R$ 120          │
│ │         Status: ✓ Concluído    │
│ └────────────────────────────────┤
│                                  │
│ Saques:                          │
│ ┌────────────────────────────────┤
│ │ 05/04 - Automático (Próximo)   │
│ │ Valor: R$ 1.058,67             │
│ │ Status: ⏳ Processando         │
│ │ [Ver Comprovante]              │
│ └────────────────────────────────┤
│                                  │
│ [Solicitar Saque Manual]         │
│ [Extratos Anteriores]            │
│                                  │
└──────────────────────────────────┘
```

### ⚙️ Configurações do Prestador

**Página de Configurações:**
```
┌──────────────────────────────────┐
│ Configurações Profissionais      │
├──────────────────────────────────┤
│                                  │
│ Perfil Profissional              │
│ ├─ Foto: [Sua Foto]              │
│ ├─ Nome: Luiza Dra Silva         │
│ ├─ Bio: Especialista em cães...  │
│ ├─ Tipo: Veterinário (fixo)      │
│ ├─ Empresa: Clínica Vet Luiza   │
│ ├─ CRMV: 123456                  │
│ ├─ Website: www.clinica.com.br   │
│ └─ [Editar]                      │
│                                  │
│ Disponibilidade                  │
│ ├─ Seg-Sex: 09:00 - 18:00        │
│ ├─ Sábado: 09:00 - 14:00         │
│ ├─ Domingo: Fechado              │
│ └─ [Editar Horários]             │
│                                  │
│ Tipo de Atendimento              │
│ ├─ ✓ Presencial (Clínica)        │
│ ├─ ✓ Home Visit                  │
│ ├─ ✓ Teleconsultoria             │
│ └─ [Modificar]                   │
│                                  │
│ Métodos de Recebimento           │
│ ├─ Conta Bancária                │
│ │  Itaú - Agência ••••           │
│ └─ [Editar]                      │
│                                  │
└──────────────────────────────────┘
```

---

## 👥 Jornada do VISITANTE

### 📍 Perfil
- **Email:** luiza.visitante@teste.com
- **Tipo:** VISITANTE (acesso somente por convite)
- **Relação:** Familiar ou Contato de Confiança
- **Visão Central:** "Estar informado sobre os pets da família"
- **Princípio:** "Acesso somente mediante convite e aprovação do tutor do pet"

### 🔒 Regras de Acesso (CRÍTICAS)
- **Sem acesso padrão:** Visitante NÃO vê nenhum pet até ser convidado
- **Convite por pet:** Cada pet requer um convite separado
- **Somente tutor convida:** Apenas quem é TUTOR do pet pode convidar visitantes
- **Prestador NÃO convida:** Mesmo que seja AMBOS, só convida para pets como tutor
- **Read-only:** Visitante NUNCA edita informações
- **Permissões configuráveis:** Tutor define o que o visitante pode ver
- **Ver regras completas em:** `VISITOR_ACCESS_RULES.md`

### 🎯 Onboarding

**Tela 1: Bem-vindo**
```
┌─────────────────────────────────┐
│ Bem-vindo ao MITRA! 👋          │
├─────────────────────────────────┤
│ Fique próximo aos pets da sua   │
│ família                          │
│                                 │
│ [Começar →]                     │
└─────────────────────────────────┘
```

**Tela 2: Dados Básicos**
```
┌─────────────────────────────────┐
│ Qual é sua relação com a família│
├─────────────────────────────────┤
│ ○ Avó/Avô                       │
│ ○ Pai/Mãe                       │
│ ○ Tio/Tia                       │
│ ○ Primo/Prima                   │
│ ○ Amigo(a) Próximo              │
│ ○ Cuidador Regular              │
│                                 │
│ [Próximo →]                     │
└─────────────────────────────────┘
```

**Tela 3: Aguardando Convite**
```
┌─────────────────────────────────┐
│ Quase lá! 🎉                    │
├─────────────────────────────────┤
│ Sua conta foi criada!            │
│                                 │
│ Para acompanhar um pet, você    │
│ precisa receber um convite do   │
│ tutor responsável pelo pet.     │
│                                 │
│ Peça ao tutor para enviar um    │
│ convite usando seu email:       │
│ luiza.visitante@teste.com       │
│                                 │
│ Você será notificado quando     │
│ receber um convite!             │
│                                 │
│ [Ir para Home →]                │
└─────────────────────────────────┘
```

### 🏠 Home (Dashboard Principal)

**Estado Inicial (Sem Convites):**
```
┌──────────────────────────────────────────┐
│ 👋 Olá, Luiza! (avatar + nome)           │ 🔔 Notificações
├──────────────────────────────────────────┤
│                                          │
│ 🔒 NENHUM PET DISPONÍVEL                │
│ ┌────────────────────────────────────┐   │
│ │                                    │   │
│ │ Você ainda não recebeu convites    │   │
│ │ para acompanhar nenhum pet.        │   │
│ │                                    │   │
│ │ Peça ao tutor responsável para     │   │
│ │ enviar um convite usando seu email:│   │
│ │ luiza.visitante@teste.com          │   │
│ │                                    │   │
│ └────────────────────────────────────┘   │
│                                          │
│ 🔔 Convites Pendentes (0)               │
│                                          │
└──────────────────────────────────────────┘
```

**Estado Após Aceitar Convite:**
```
┌──────────────────────────────────────────┐
│ 👋 Olá, Luiza! (avatar + nome)           │ 🔔 Notificações
├──────────────────────────────────────────┤
│                                          │
│ 📊 PETS QUE ACOMPANHO (Somente Leitura)│
│ ┌────────────────────────────────────┐   │
│ │ 🐕 Luna                            │   │
│ │ Raça: Golden Retriever             │   │
│ │ Status: ✅ Saúde em dia            │   │
│ │ Convidado por: Ana Silva (Tutor)   │   │
│ │ Desde: 07/03/2026                  │   │
│ │                                    │   │
│ │ Atualizações Recentes:             │   │
│ │ • Registrada vacina (02/03)        │   │
│ │ • Passou em consulta (28/02)       │   │
│ │ • Banho realizado (25/02)          │   │
│ │                                    │   │
│ │ [Ver Detalhes] [Chamar Tutor]      │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ 🐈 Miau                            │   │
│ │ Raça: Persa                        │   │
│ │ Status: ⚠️ Requer Atenção          │   │
│ │ [Ver Mais]                         │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ─────────────────────────────────────────│
│ 🔔 NOTIFICAÇÕES IMPORTANTES              │
│ • Vacina de Luna vence em 9 dias    │
│ • Medicação de Miau em falta        │
│ • Consulta com Dr. Silva marcada    │
│                                          │
└──────────────────────────────────────────┘
```

**Menu Principal (Simplificado):**
```
├─ 🏠 Home (Ativo)
├─ 🐾 Meus Pets (Visualização)
├─ 📋 Atualizações
├─ 💬 Mensagens
├─ ⚙️ Configurações
└─ 👤 Minha Conta
```

### 📍 Seção: MEUS PETS (Visualização Restrita)

**Página de Pet - O que Vê:**

**1. 📋 Perfil (Visível)**
```
┌─────────────────────────────────┐
│ 🐕 Luna - Golden Retriever      │
├─────────────────────────────────┤
│ Foto: [imagem grande]           │
│                                 │
│ Informações Básicas:            │
│ • Data Nascimento: 10/05/2020   │
│ • Sexo: Fêmea                   │
│ • Tipo de Pelagem: Dourada      │
│ • Peso: 27 kg                   │
│                                 │
│ Tutor Principal: Ana Silva      │
│ [Enviar Mensagem]               │
└─────────────────────────────────┘
```

**2. 💊 Saúde (Conforme Permissões do Convite)**
```
┌─────────────────────────────────┐
│ Status de Saúde                 │
│ 🔒 Visível conforme autorização │
│    do tutor no convite          │
│                                 │
│ Vacinações (se HISTORICO_VACINACAO autorizado):
│ ✅ Raiva (02/03/2025)           │
│ ✅ V10 (02/03/2025)             │
│ ⏳ Próxima: 02/06/2025          │
│                                 │
│ Medicamentos (se MEDICAMENTOS autorizado):
│ • Antialérgico (conforme uso)   │
│                                 │
│ ⚠️ Seções bloqueadas:           │
│ 🔒 Agenda de Consultas          │
│ 🔒 Prestadores do Pet           │
│ (Peça ao tutor para liberar)   │
│                                 │
│ [Chamar Tutor]                  │
└─────────────────────────────────┘
```

> **Nota:** As informações visíveis são definidas pelo tutor no momento do convite.
> Permissões configuráveis: HISTORICO_VACINACAO, MEDICAMENTOS, AGENDA_CONSULTAS,
> PRESTADORES_PET, TIMELINE_ATUALIZACOES.
> Ver detalhes em `VISITOR_ACCESS_RULES.md` (Seção 6)

**3. 🤝 Prestadores (Se PRESTADORES_PET autorizado no convite)**
```
┌─────────────────────────────────┐
│ Profissionais Cuidando          │
│ 🔒 Visível se autorizado        │
│                                 │
│ Dr. Silva (Veterinário)         │
│ Clínica Veterinária Silva       │
│ ⭐⭐⭐⭐⭐ (5.0)                   │
│ "Atendendo desde fevereiro"     │
│                                 │
│ [Ver Contato]                   │
│                                 │
│ Maria Sitter (Pet Sitter)       │
│ "Passeia com Luna 2x por semana"│
│                                 │
│ [Ver Contato]                   │
│                                 │
│ ❌ Visitante NÃO pode:          │
│ • Convidar prestadores          │
│ • Remover prestadores           │
│ • Ver permissões de prestadores │
└─────────────────────────────────┘
```

**4. 📅 Agendamentos (Se AGENDA_CONSULTAS autorizado no convite)**
```
┌─────────────────────────────────┐
│ Próximos Atendimentos           │
│ 🔒 Visível se autorizado        │
│                                 │
│ 🩺 Consulta - Dr. Silva         │
│ 15/03/2026 às 10:00             │
│ Clínica Veterinária Silva       │
│ Status: Confirmado              │
│                                 │
│ 🛁 Banho - Petshop João        │
│ 18/03/2026 às 14:00             │
│ Status: Confirmado              │
│                                 │
│ [Chamar Tutor em Caso de Dúvida]│
│                                 │
└─────────────────────────────────┘
```

**Abas NÃO Visíveis:**
- ❌ Governança / Votos
- ❌ Solicitações de Guarda
- ❌ Documentos Sensíveis
- ❌ Dados Financeiros

### 📍 Seção: ATUALIZAÇÕES (Timeline Simplificada)

**Página de Atualizações:**
```
┌─────────────────────────────────┐
│ Últimas Novidades dos Pets      │
├─────────────────────────────────┤
│                                 │
│ Hoje - Luna                     │
│ 🩺 Dr. Silva registrou que Luna │
│    está com ótima saúde         │
│                                 │
│ Ontem - Miau                    │
│ 🛁 Recebeu banho no Petshop João│
│                                 │
│ 3 dias atrás - Luna             │
│ 💪 Ana marcou que Luna está     │
│    brincalhona e feliz!         │
│                                 │
│ [Carregar Mais Atualizações]    │
│                                 │
└─────────────────────────────────┘
```

### 💬 Seção: MENSAGENS (Comunicação)

**Página de Mensagens:**
```
┌─────────────────────────────────┐
│ Conversas                       │
├─────────────────────────────────┤
│                                 │
│ Ana Silva (Tutor)               │
│ Última mensagem: hoje às 14:30  │
│ "Luna está ótima com a vacina"  │
│ [Abrir Chat] [Deletar]          │
│                                 │
│ João Costa (Tutor)              │
│ Última mensagem: ontem às 10:15 │
│ "Miau precisa de atenção"       │
│ [Abrir Chat] [Deletar]          │
│                                 │
│ [+ Nova Conversa]               │
│                                 │
└─────────────────────────────────┘
```

### ⚙️ Configurações do Visitante

**Página de Configurações:**
```
┌─────────────────────────────────┐
│ Minhas Configurações            │
├─────────────────────────────────┤
│                                 │
│ Conta Pessoal                   │
│ ├─ Nome: Luiza Visitante        │
│ ├─ Email: luiza.visitante@...   │
│ ├─ Relação: Avó                 │
│ └─ [Editar]                     │
│                                 │
│ Segurança                       │
│ ├─ Senha: ••••••••              │
│ ├─ [Alterar Senha]              │
│ └─ Logout de outros dispositivos│
│                                 │
│ Notificações                    │
│ ├─ Email: ✓ Ativado             │
│ ├─ Alertas de Saúde: ✓          │
│ ├─ Atualizações Diárias: ✓      │
│ └─ [Personalizar]               │
│                                 │
└─────────────────────────────────┘
```

---

## 🔄 Fluxos Compartilhados

### 🔐 Autenticação (Igual para Todos)

**Login:**
```
┌─────────────────────────────────┐
│ 🐾 MITRA Login                  │
├─────────────────────────────────┤
│ Email: _________________        │
│ Senha: _________________        │
│                                 │
│ ☐ Lembrar-me                    │
│                                 │
│ [LOGIN]                         │
│                                 │
│ Novo por aqui? [Cadastrar]      │
│ Esqueci a senha [Recuperar]     │
└─────────────────────────────────┘
```

**Recuperação de Senha (SMS/Email):**
```
1. Insere email
2. Recebe link/código
3. Define nova senha
4. Confirma com 2FA (opcional)
```

### 📧 Sistema de Notificações

**Tipos de Notificação (Contextuais por Perfil):**

| Evento | Tutor | Prestador | Visitante |
|--------|-------|-----------|-----------|
| Novo Convite (Prestador) | 🔔 | 🔔 | - |
| Convite Aceito (Prestador) | 🔔 | - | - |
| Convite para Visitante Enviado | 🔔 | - | 🔔 |
| Visitante Aceitou Convite | 🔔 | - | - |
| Acesso de Visitante Revogado | 🔔 | - | 🔔 |
| Convite de Visitante Expirado | - | - | 🔔 |
| Consulta Agendada | 🔔 | 🔔 | 🔔* |
| Vacina Registrada | 🔔 | - | 🔔* |
| Novo Medicamento | 🔔 | 🔔 | 🔔* |
| Avaliação Recebida | - | 🔔 | - |
| Mensagem | 🔔 | 🔔 | 🔔 |
| Alerta de Saúde | 🔔 | 🔔 | 🔔* |

> `🔔*` = Visitante recebe SOMENTE se a permissão correspondente foi autorizada no convite.
> Ex: Vacina → precisa de HISTORICO_VACINACAO. Ver `VISITOR_ACCESS_RULES.md` (Seção 11).

**Canais:**
- ✅ In-app (Bell icon + Toast)
- ✅ Email
- ✅ SMS (opcional)
- ✅ Push notifications (futuro)

### 💬 Sistema de Mensagens

**Quem pode falar com quem?**

```
TUTOR ↔ TUTOR        (Qualquer um neste pet)
TUTOR ↔ PRESTADOR    (Se aceitaram convite)
TUTOR ↔ VISITANTE    (Se foi adicionado)
PRESTADOR ↔ TUTOR    (Se aceitaram convite)
VISITANTE → TUTOR    (Pedido de permissão)
```

**Não permitido:**
```
✗ PRESTADOR ↔ PRESTADOR (diferentes pets)
✗ VISITANTE ↔ PRESTADOR
✗ VISITANTE ↔ VISITANTE
```

### 🔔 Centro de Notificações (Igual para Todos)

**Página Unificada:**
```
┌──────────────────────────────────┐
│ 🔔 Notificações                  │
├──────────────────────────────────┤
│ [Todas] [Não-lidas] [Arquivadas] │
├──────────────────────────────────┤
│                                  │
│ 🤝 Novo convite para Luna        │
│    Ana convida você para atender │
│    Há 2 horas                    │
│    [Aceitar] [Recusar]           │
│                                  │
│ 💬 Nova mensagem de João         │
│    "Luna está ótima!"            │
│    Há 1 hora                     │
│    [Responder] [Deletar]         │
│                                  │
│ ... (mais notificações)          │
│                                  │
│ [Marcar todos como lido]         │
│ [Limpar Arquivadas]              │
│                                  │
└──────────────────────────────────┘
```

---

## 📊 Comparativo de Funcionalidades

### Matriz de Acesso por Perfil

```
FUNCIONALIDADE                    │ TUTOR │ PRESTADOR │ VISITANTE
──────────────────────────────────┼───────┼───────────┼──────────
Criar Pet                         │  ✓    │     -     │    -
Editar Dados do Pet               │  ✓    │     -     │    -
Visualizar Pet Completo           │  ✓    │    ✓*     │    ✓+
Convidar Prestador                │  ✓    │     -     │    -
Revogar Acesso Prestador          │  ✓    │     -     │    -
Convidar Visitante                │  ✓    │    -◆     │    -
Revogar Acesso Visitante          │  ✓    │     -     │    -
Aceitar Convite de Visitante      │  -    │     -     │    ✓
Sair de Pet (Auto-revogar)        │  -    │     -     │    ✓
Adicionar Tutor                   │  ✓    │     -     │    -
Registrar Vacina                  │ ✓**   │    ✓      │    -
Registrar Medicamento             │ ✓**   │    ✓      │    -
Editar Saúde (Vet)                │ ✓**   │    ✓      │    -
Agendar Consulta                  │  ✓    │    ✓      │    -
Visualizar Agenda                 │  ✓    │    ✓      │   ✓+
Enviar Mensagens                  │  ✓    │    ✓      │   ✓†
Receber Pagamento                 │  -    │    ✓      │    -
Ver Reputação                     │  -    │    ✓      │    -
Ver Faturamento                   │  -    │    ✓      │    -
Governança (Votos)                │  ✓    │     -     │    -
Solicitação de Guarda             │  ✓    │     -     │    -
Exportar Dados                    │  ✓    │    ✓      │   ✓+
```

**Legenda:**
- `✓` = Acesso total
- `✓*` = Apenas pets para os quais foi convidado
- `✓**` = Ou designado (permissão)
- `✓+` = Acesso limitado (conforme permissões do convite)
- `✓†` = Apenas com tutores (não com prestadores ou outros visitantes)
- `-◆` = Se AMBOS, pode convidar SOMENTE para pets onde é TUTOR
- `-` = Sem acesso

---

## 🎨 Padrões de Design Aplicáveis

### Cores por Perfil

```
TUTOR:      Azul #2563EB (Confiança, Controle)
PRESTADOR:  Verde #10B981 (Crescimento, Profissionalismo)
VISITANTE:  Cinza #6B7280 (Informação, Passividade)
```

### Ícones de Status

```
✅ Ativo / Aceito
⏳ Pendente
❌ Bloqueado / Recusado
⚠️ Atenção Necessária
🔒 Acesso Restrito
```

### Mensagens Contextiais

**Para Tutor:**
- "Você é responsável por este pet"
- "Decisões suas controlam tudo"
- "Prestadores trabalhando para você"

**Para Prestador:**
- "Crescer e ganhar bem"
- "Sua reputação importa"
- "Clientes confiam em você"

**Para Visitante:**
- "Mantenha-se informado"
- "Suporte quando chamado"
- "Informações transparentes"

---

## 🚀 Implementação

### Prioridade de Desenvolvimento

**Fase 1 (MVP):**
1. Tutor - Home + Pet Management
2. Prestador - Home + Agenda
3. Visitante - Home + Visualização

**Fase 2:**
1. Tutor - Governança + Guarda
2. Prestador - Financeiro + Analytics
3. Ambos - Mensagens avançadas

**Fase 3:**
1. Marketplace
2. Pagamentos
3. Mobile responsivo

---

**Documento versão 1.0**
**Data:** 07/03/2026
**Pronto para:** Handoff para design/desenvolvimento
