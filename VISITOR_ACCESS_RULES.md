# 🔒 Regras de Acesso do Visitante - MITRA

**Data:** 07/03/2026
**Status:** Regra de negócio validada
**Prioridade:** CRÍTICA - Segurança de dados

---

## 1. Princípio Fundamental

> **O Visitante NÃO tem acesso a NENHUMA informação de pet por padrão.**
> Todo acesso é concedido mediante convite + aprovação do tutor do pet.

---

## 2. Quem é o Visitante?

- Familiares (avó, tio, primo)
- Amigos próximos
- Contatos de confiança
- Cuidadores eventuais (sem perfil profissional)

**O Visitante:**
- ✅ Pode visualizar informações do pet (se convidado)
- ✅ Pode receber notificações sobre o pet (se convidado)
- ✅ Pode enviar mensagens ao tutor
- ❌ NÃO pode editar nenhuma informação
- ❌ NÃO pode convidar outros visitantes
- ❌ NÃO pode convidar prestadores
- ❌ NÃO pode registrar vacinas, medicamentos, serviços
- ❌ NÃO pode participar de votações de governança
- ❌ NÃO pode solicitar guarda provisória

---

## 3. Quem Pode Convidar um Visitante?

### Regra 1: Tutor do Pet
O tutor (TUTOR_PRINCIPAL ou TUTOR_EMERGENCIA) pode convidar visitantes para os pets sob sua tutela.

```
Tutor Ana → Convida Visitante para Luna ✅
Tutor Ana → Convida Visitante para Miau ✅ (se é tutora de Miau)
Tutor Ana → Convida Visitante para Rex  ❌ (Rex não é seu pet)
```

### Regra 2: Prestador que TAMBÉM é Tutor
Um usuário com `tipoUsuario = AMBOS` (Prestador + Tutor) pode convidar visitantes, MAS:
- **SOMENTE para pets onde ele é TUTOR** (role em `PetUsuario`)
- **NUNCA para pets que ele atende como PRESTADOR** (role em `PetPrestador`)

```
Dr. Silva é:
  - TUTOR de Rex (seu próprio pet)
  - PRESTADOR de Luna (pet da Ana)

Dr. Silva → Convida Visitante para Rex   ✅ (é tutor de Rex)
Dr. Silva → Convida Visitante para Luna  ❌ (é prestador de Luna, NÃO tutor)
```

### Regra 3: Visitante NÃO Pode Convidar
Visitante NUNCA pode convidar outros visitantes ou prestadores para nenhum pet.

```
Visitante Avó → Convida outro Visitante  ❌ PROIBIDO
Visitante Avó → Convida Prestador        ❌ PROIBIDO
```

---

## 4. Fluxo de Convite

### Passo a Passo

```
1. TUTOR entra no Pet → Aba "Visitantes" (ou "Compartilhar Acesso")
   ↓
2. Clica [+ Convidar Visitante]
   ↓
3. Modal abre:
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
   ↓
4. Backend cria registro em PetVisitante com:
   - aceito: false
   - permissoesVisualizacao: [DADOS_BASICOS, STATUS_SAUDE]
   - convidadoPor: tutorId
   ↓
5. Visitante recebe notificação:
   - Email: "Ana convida você para acompanhar Luna"
   - In-app: Notification + Toast
   ↓
6. Visitante clica [Aceitar Convite]
   ↓
7. Backend atualiza:
   - aceito: true
   - dataAceite: now()
   ↓
8. Tutor recebe confirmação:
   - "Avó Maria aceitou convite para acompanhar Luna"
   ↓
9. Pet Luna agora aparece na home do Visitante (read-only)
```

---

## 5. Escopo por Pet (Isolamento)

### Regra: Um convite = Um pet

O convite é **por pet**, não por usuário. Se o tutor tem 2 pets e quer que o visitante veja ambos, precisa enviar 2 convites separados.

```
Tutor Ana tem:
  - Luna (Golden)
  - Miau (Persa)

Se Ana convida Avó para Luna:
  - Avó vê Luna    ✅
  - Avó vê Miau    ❌ (precisa de convite separado)

Se Ana convida Avó para ambos:
  - Avó vê Luna    ✅
  - Avó vê Miau    ✅
```

### Regra: Permissões são independentes por pet

```
Convite para Luna:
  - Dados básicos: ✅
  - Vacinação: ✅
  - Medicamentos: ❌

Convite para Miau:
  - Dados básicos: ✅
  - Vacinação: ❌
  - Medicamentos: ✅

(Cada pet pode ter permissões de visualização diferentes)
```

---

## 6. Permissões de Visualização do Visitante

### O que o Visitante PODE ver (se autorizado)

| Informação | Padrão | Configurável |
|-----------|--------|-------------|
| Nome, raça, idade, foto | ✅ Sempre | Não |
| Status de saúde (resumo) | ✅ Sempre | Não |
| Histórico de vacinação | ❌ Off | Sim |
| Medicamentos ativos | ❌ Off | Sim |
| Agenda de consultas | ❌ Off | Sim |
| Prestadores do pet | ❌ Off | Sim |
| Timeline/Atualizações | ❌ Off | Sim |
| Contato do tutor | ✅ Sempre | Não |

### O que o Visitante NUNCA pode ver

| Informação | Motivo |
|-----------|--------|
| Dados pessoais dos tutores | Privacidade |
| Dados financeiros | Sensível |
| Governança / Votações | Sem autoridade |
| Solicitações de guarda | Sem autoridade |
| Documentos sensíveis | Privacidade |
| Outros visitantes do pet | Privacidade |
| Permissões de prestadores | Sem autoridade |
| Dados de microchip | Segurança |

---

## 7. Verificação de Acesso (Backend)

### Lógica de Verificação

```typescript
// Verificar se visitante pode acessar informação do pet
async canVisitorAccess(
  petId: string,
  visitorUserId: string,
  permission: VisitorPermission
): Promise<boolean> {
  const petVisitante = await prisma.petVisitante.findUnique({
    where: {
      petId_visitanteId: { petId, visitanteId: visitorUserId }
    }
  });

  // 1. Convite deve existir
  if (!petVisitante) return false;

  // 2. Convite deve ter sido aceito
  if (!petVisitante.aceito) return false;

  // 3. Vínculo deve estar ativo
  if (petVisitante.statusVinculo !== 'ATIVO') return false;

  // 4. Não pode ter expirado
  if (petVisitante.dataFim && petVisitante.dataFim < new Date()) return false;

  // 5. Deve ter a permissão de visualização específica
  if (!petVisitante.permissoesVisualizacao.includes(permission)) return false;

  return true;
}
```

### Verificar se pode convidar visitante

```typescript
// Verificar se usuário pode convidar visitante para um pet
async canInviteVisitor(
  petId: string,
  inviterUserId: string
): Promise<boolean> {
  // Buscar relação do usuário com o pet como TUTOR
  const petUsuario = await prisma.petUsuario.findFirst({
    where: {
      petId,
      usuarioId: inviterUserId,
      ativo: true,
      role: { in: ['TUTOR_PRINCIPAL', 'TUTOR_EMERGENCIA'] }
    }
  });

  // SOMENTE tutores podem convidar
  // Prestadores NÃO podem convidar visitantes para pets que atendem
  return !!petUsuario;
}
```

---

## 8. Modelo de Dados (Prisma)

### Novo Model: PetVisitante

```prisma
model PetVisitante {
  id                      String    @id @default(uuid())
  petId                   String    @map("pet_id")
  visitanteId             String    @map("visitante_id")
  permissoesVisualizacao  PermissaoVisitante[]  @default([DADOS_BASICOS, STATUS_SAUDE])
  statusVinculo           String    @default("ATIVO")  // ATIVO, BLOQUEADO, EXPIRADO
  relacao                 String?   // "Avó", "Tio", "Amigo", etc
  convidadoPor            String    @map("convidado_por")
  aceito                  Boolean   @default(false)
  dataAceite              DateTime? @map("data_aceite")
  dataFim                 DateTime? @map("data_fim")  // Expiração opcional
  criadoEm                DateTime  @default(now()) @map("criado_em")
  atualizadoEm            DateTime  @updatedAt @map("atualizado_em")

  pet                     Pet       @relation(fields: [petId], references: [id], onDelete: Cascade)
  visitante               Usuario   @relation(fields: [visitanteId], references: [id], onDelete: Cascade)

  @@unique([petId, visitanteId])
  @@map("pet_visitantes")
}

enum PermissaoVisitante {
  DADOS_BASICOS           // Nome, raça, idade, foto (sempre incluso)
  STATUS_SAUDE            // Resumo de saúde (sempre incluso)
  HISTORICO_VACINACAO     // Ver vacinas registradas
  MEDICAMENTOS            // Ver medicamentos ativos
  AGENDA_CONSULTAS        // Ver próximas consultas
  PRESTADORES_PET         // Ver quais profissionais cuidam
  TIMELINE_ATUALIZACOES   // Ver timeline de eventos
}
```

---

## 9. Revogação de Acesso

### Quem pode revogar?

```
Tutor do pet → Revogar qualquer visitante  ✅
Visitante    → Auto-revogar (sair)         ✅
Prestador    → Revogar visitante            ❌ PROIBIDO
```

### Fluxo de Revogação

```
1. Tutor entra em Pet → Aba "Visitantes"
2. Vê lista de visitantes com acesso
3. Clica [X Revogar] no visitante
4. Confirma: "Remover acesso de Avó Maria?"
5. Backend: statusVinculo = "BLOQUEADO" (soft delete)
6. Visitante perde acesso imediatamente
7. Visitante recebe notificação:
   - "Seu acesso a Luna foi removido"
8. Pet desaparece da home do visitante
```

---

## 10. Cenários de Edge Cases

### Caso 1: Prestador tenta convidar visitante para pet que atende

```
Dr. Silva é PRESTADOR de Luna (pet da Ana)
Dr. Silva tenta convidar Avó para Luna

→ Backend verifica: Dr. Silva é tutor de Luna? NÃO (é prestador)
→ Resposta: 403 Forbidden - "Apenas tutores podem convidar visitantes"
→ Frontend: Botão "Convidar Visitante" NÃO aparece para prestadores
```

### Caso 2: Usuário AMBOS (Tutor + Prestador)

```
Dr. Silva é:
  - TUTOR de Rex (seu pet)
  - PRESTADOR de Luna (pet da Ana)

Na home, Dr. Silva vê:
  - Seção "Meus Pets": Rex [+ Convidar Visitante] ✅
  - Seção "Pets que Atendo": Luna [sem opção de convite] ✅

Frontend: Botão "Convidar Visitante" só aparece em pets onde
          o usuário tem role TUTOR_PRINCIPAL ou TUTOR_EMERGENCIA
```

### Caso 3: Visitante tenta acessar pet sem convite

```
Avó Maria tem acesso a Luna mas NÃO a Miau

Se Avó tenta acessar /pets/miau-id:
→ Backend verifica: Existe PetVisitante para Avó + Miau? NÃO
→ Resposta: 403 Forbidden
→ Frontend: Redireciona para Home com toast "Sem acesso a este pet"
```

### Caso 4: Convite expirado

```
Tutor Ana convidou Avó com validade de 30 dias
Após 30 dias:
→ Backend: dataFim < now() → acesso negado
→ Frontend: Pet desaparece da home do visitante
→ Notificação: "Seu acesso a Luna expirou"
→ Tutor pode renovar convite se desejar
```

### Caso 5: Tutor remove pet

```
Tutor Ana deleta pet Luna:
→ Cascade: Todos PetVisitante de Luna são removidos
→ Todos visitantes perdem acesso automaticamente
→ Notificação para visitantes: "O pet Luna foi removido"
```

### Caso 6: Visitante aceita convite mas tutor revoga antes

```
1. Ana convida Avó para Luna (aceito: false)
2. Ana muda de ideia e revoga (statusVinculo: BLOQUEADO)
3. Avó tenta aceitar convite
→ Backend: statusVinculo !== "ATIVO" → convite inválido
→ Frontend: "Este convite não é mais válido"
```

---

## 11. Notificações do Visitante

### Notificações que o Visitante RECEBE

| Evento | Recebe? | Condição |
|--------|---------|----------|
| Convite para acompanhar pet | ✅ Sempre | - |
| Vacina registrada | ✅ Se autorizado | HISTORICO_VACINACAO |
| Medicamento novo | ✅ Se autorizado | MEDICAMENTOS |
| Consulta agendada | ✅ Se autorizado | AGENDA_CONSULTAS |
| Atualização na timeline | ✅ Se autorizado | TIMELINE_ATUALIZACOES |
| Acesso revogado | ✅ Sempre | - |
| Convite expirado | ✅ Sempre | - |
| Mensagem do tutor | ✅ Sempre | - |

### Notificações que o Visitante NÃO recebe

| Evento | Motivo |
|--------|--------|
| Novo prestador convidado | Sem autoridade |
| Prestador aceito/removido | Sem autoridade |
| Votação de governança | Sem autoridade |
| Solicitação de guarda | Sem autoridade |
| Dados financeiros | Privacidade |

---

## 12. Resumo das Regras (Quick Reference)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  🔒 REGRAS DE ACESSO DO VISITANTE                       │
│                                                          │
│  1. Acesso SOMENTE por convite                           │
│  2. Convite é POR PET (não por usuário)                 │
│  3. Só TUTOR pode convidar                              │
│  4. Prestador NÃO convida visitantes                    │
│  5. Usuário AMBOS: convida só para pets como TUTOR      │
│  6. Visitante = READ-ONLY (nunca edita)                 │
│  7. Permissões de visualização são configuráveis         │
│  8. Dados básicos + status saúde sempre visíveis        │
│  9. Outros dados: habilitados pelo tutor no convite     │
│  10. Revogação: só tutor pode revogar                   │
│  11. Soft delete: statusVinculo para auditoria          │
│  12. Cascata: deletar pet remove todos visitantes       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

**Status:** ✅ Regras validadas e documentadas
**Próximo:** Propagar para documentação existente
