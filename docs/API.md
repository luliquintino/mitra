# API Reference — MITRA

Base URL: `http://localhost:3000/api/v1`

Todas as rotas autenticadas requerem header: `Authorization: Bearer {accessToken}`

---

## Auth

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| POST | `/auth/register` | Registrar usuario | Nao |
| POST | `/auth/login` | Login | Nao |
| POST | `/auth/logout` | Logout | Sim |
| POST | `/auth/refresh` | Renovar tokens | Refresh |
| GET | `/auth/me` | Dados do usuario | Sim |

### POST /auth/register

```json
// Request
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "SenhaForte123",
  "telefone": "11999990000",
  "tipoUsuario": "TUTOR",
  "dadosProfissionais": {
    "tipoPrestador": "VETERINARIO",
    "telefoneProfissional": "1133334444",
    "endereco": "Rua Exemplo, 123"
  }
}

// Response 201
{
  "usuario": { "id": "...", "nome": "Maria Silva", "email": "maria@email.com", "tipoUsuario": "TUTOR" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### POST /auth/login

```json
// Request
{ "email": "maria@email.com", "senha": "SenhaForte123" }

// Response 200
{
  "usuario": { "id": "...", "nome": "Maria Silva", ... },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}

// Response 401
{ "message": "Credenciais invalidas." }
```

---

## Pets

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/pets` | Listar meus pets |
| POST | `/pets` | Criar pet |
| GET | `/pets/:id` | Detalhe do pet |
| PUT | `/pets/:id` | Atualizar pet |
| GET | `/pets/:id/dashboard` | Dashboard do pet |
| GET | `/pets/codigo/:codigo` | Buscar por codigo |
| POST | `/pets/vincular` | Vincular por codigo |

### POST /pets

```json
// Request
{
  "nome": "Luna",
  "especie": "CACHORRO",
  "raca": "Golden Retriever",
  "genero": "FEMEA",
  "dataNascimento": "2021-03-14",
  "cor": "Dourada",
  "peso": 28.5,
  "tipoGuarda": "CONJUNTA"
}

// Response 201
{ "id": "...", "nome": "Luna", "codigoPet": "MTRA5K", ... }
```

### POST /pets/vincular

```json
// Request
{ "codigo": "MTRA5K", "role": "TUTOR_PRINCIPAL" }

// Response 200
{ "petId": "...", "message": "Vinculado com sucesso" }
```

---

## Saude

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/pets/:id/health/vacinas` | Listar vacinas |
| POST | `/pets/:id/health/vacinas` | Registrar vacina |
| GET | `/pets/:id/health/medicamentos` | Listar medicamentos |
| POST | `/pets/:id/health/medicamentos` | Registrar medicamento |
| POST | `/pets/:id/health/medicamentos/:medId/administrar` | Registrar dose |
| GET | `/pets/:id/health/sintomas` | Listar sintomas |
| POST | `/pets/:id/health/sintomas` | Registrar sintoma |
| GET | `/pets/:id/health/plano-saude` | Obter plano de saude |
| PUT | `/pets/:id/health/plano-saude` | Atualizar plano de saude |

### POST /pets/:id/health/vacinas

```json
// Request
{
  "nome": "V10",
  "dataAplicacao": "2025-06-01",
  "proximaDose": "2026-06-01",
  "veterinario": "Dr. Carlos",
  "clinica": "Pet Clinic",
  "lote": "LOT123"
}

// Response 201
{
  "vacina": { "id": "...", "nome": "V10", ... },
  "mensagem": "Vacina \"V10\" registrada em 01/06/2025 e notificada ao outro tutor."
}
```

---

## Guarda / Custody

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/pets/:id/custody/guardas` | Historico de guardas |
| GET | `/pets/:id/custody/solicitacoes` | Listar solicitacoes |
| POST | `/pets/:id/custody/solicitacoes` | Criar solicitacao |
| POST | `/pets/:id/custody/solicitacoes/:solId/responder` | Responder solicitacao |
| GET | `/pets/:id/custody/temporarias` | Guardas temporarias |
| POST | `/pets/:id/custody/temporarias` | Criar guarda temporaria |
| POST | `/pets/:id/custody/temporarias/:guardaId/confirmar` | Confirmar |
| POST | `/pets/:id/custody/temporarias/:guardaId/cancelar` | Cancelar |

### POST /pets/:id/custody/solicitacoes

```json
// Request
{
  "destinatarioId": "user-id-2",
  "tipo": "ALTERACAO_GUARDA",
  "justificativa": "Mudanca de horario"
}

// Response 201
{
  "solicitacao": { "id": "...", "status": "PENDENTE", "expiradoEm": "..." },
  "mensagem": "Solicitacao enviada. O outro tutor tem 48h para responder."
}
```

### POST /pets/:id/custody/solicitacoes/:solId/responder

```json
// Request
{ "aprovada": true, "mensagem": "Concordo" }

// Response 200
{ "mensagem": "Solicitacao aprovada as 14:30. O solicitante foi notificado." }
```

---

## Governanca

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/pets/:id/governance/tutores` | Listar tutores |
| POST | `/pets/:id/governance/tutores` | Adicionar tutor |
| POST | `/pets/:id/governance/arquivar` | Arquivar pet |
| POST | `/pets/:id/governance/reativar` | Reativar pet |

### POST /pets/:id/governance/tutores

```json
// Request
{ "email": "carlos@email.com", "role": "TUTOR_PRINCIPAL" }

// Response 201
{
  "vinculo": { ... },
  "mensagem": "Carlos adicionado como tutor com sucesso."
}

// Response 400
{ "message": "O pet ja possui 2 tutores principais. Limite atingido." }
```

---

## Historico / Events

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/pets/:id/events/historico` | Timeline agrupada por mes |

---

## Notificacoes

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/notifications` | Listar (ultimas 30) |
| GET | `/notifications/count` | Contagem nao lidas |
| POST | `/notifications/:id/read` | Marcar como lida |
| POST | `/notifications/read-all` | Marcar todas como lidas |

---

## Compromissos / Agenda

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/pets/:id/compromissos` | Listar ativos |
| POST | `/pets/:id/compromissos` | Criar |
| PUT | `/pets/:id/compromissos/:compId` | Atualizar |
| DELETE | `/pets/:id/compromissos/:compId` | Desativar |

### POST /pets/:id/compromissos

```json
// Request
{
  "titulo": "Passeio diario",
  "tipo": "PASSEIO",
  "recorrencia": "DIARIO",
  "horarioInicio": "08:00",
  "horarioFim": "09:00",
  "dataInicio": "2025-07-01",
  "geraGuarda": true
}
```

---

## Prestadores (por pet)

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/pets/:id/prestadores/invite` | Convidar prestador |
| GET | `/pets/:id/prestadores` | Listar prestadores do pet |
| POST | `/pets/:id/prestadores/:ppId/accept` | Aceitar convite |
| POST | `/pets/:id/prestadores/:ppId/reject` | Recusar convite |
| DELETE | `/pets/:id/prestadores/:prestadorId` | Revogar acesso |

---

## Visitantes (por pet)

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/pets/:id/visitantes/invite` | Convidar visitante |
| GET | `/pets/:id/visitantes` | Listar visitantes do pet |
| POST | `/pets/:id/visitantes/:pvId/accept` | Aceitar convite |
| POST | `/pets/:id/visitantes/:pvId/reject` | Recusar convite |
| DELETE | `/pets/:id/visitantes/:visitanteId` | Revogar acesso |
| PUT | `/pets/:id/visitantes/:visitanteId/permissoes` | Editar permissoes |

---

## Registros (prestador/tutor)

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/pets/:id/registros` | Criar registro |
| GET | `/pets/:id/registros/meus` | Meus registros |

---

## Usuarios

| Metodo | Rota | Descricao |
|--------|------|-----------|
| PUT | `/users/profile` | Atualizar perfil |
| POST | `/users/feedback` | Enviar feedback |

---

## Codigos de Erro

| Codigo | Significado |
|--------|------------|
| 400 | Bad Request — dados invalidos |
| 401 | Unauthorized — token invalido ou ausente |
| 403 | Forbidden — sem permissao para esta acao |
| 404 | Not Found — recurso nao encontrado |
| 409 | Conflict — registro duplicado |
