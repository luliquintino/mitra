# 🔑 Credenciais - Usuários de Teste

Banco de dados criado e populado com sucesso em: **07/03/2026 10:32**

---

## 👥 Usuários Cadastrados

### 1️⃣ Tutor (Dono de Pet)
```
Email:    luiza.tutora@teste.com
Senha:    JCHh14025520
Tipo:     TUTOR
ID:       ddd1547b-17b4-455c-abe4-21962c0e2bbf
```
**Funcionalidades:**
- Criar e gerenciar pets
- Convidar prestadores de serviço
- Controlar acesso de tutores e prestadores
- Solicitar guarda provisória
- Participar de votações de governança

---

### 2️⃣ Prestador de Serviço (Veterinário)
```
Email:    luiza.prestadora@teste.com
Senha:    JCHh14025520
Tipo:     PRESTADOR
ID:       9d150071-d5fa-41e0-a30a-284e1ace9ff4
```
**Perfil Profissional:**
- Tipo: Veterinário
- Empresa: Clínica Veterinária Luiza
- Endereço: Rua das Flores, 123, São Paulo, SP
- Telefone: 11999999002
- ID do Perfil: e2e16d97-15e1-438b-9b1b-24d0e099f349

**Funcionalidades:**
- Visualizar pets para os quais foi convidado
- Registrar vacinações
- Registrar medicamentos
- Registrar observações
- Editar dados de saúde (permissão de vet)
- Anexar documentos

---

### 3️⃣ Visitante / Familiar (Tutor de Contato)
```
Email:    luiza.visitante@teste.com
Senha:    JCHh14025520
Tipo:     TUTOR
ID:       615ac3a9-b37e-4274-8337-3bd0d7ad8acc
```
**Funcionalidades:**
- Ser adicionado como tutor de contato/familiar
- Acessar dados básicos do pet (se autorizado)
- Ser notificado sobre eventos importantes
- Visualizar histórico de saúde

---

## 🗄️ Banco de Dados

**Status:** ✅ Criado e Sincronizado

```
Host:       localhost
Port:       5432
Database:   mitra_db
User:       luizaquintino
URL:        postgresql://luizaquintino@localhost:5432/mitra_db
```

### Schema
- ✅ 13 tabelas criadas
- ✅ Relacionamentos configurados
- ✅ Indexes aplicados
- ✅ Enums definidos
- ✅ Soft deletes implementados

---

## 🧪 Testes Recomendados

### 1. Login & Autenticação
```bash
# Tutor
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "luiza.tutora@teste.com",
    "senha": "JCHh14025520"
  }'

# Prestador
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "luiza.prestadora@teste.com",
    "senha": "JCHh14025520"
  }'
```

### 2. Criar Pet (como Tutor)
Acesse `http://localhost:3001/` após login e crie um pet.

### 3. Convidar Prestador
1. Entre em um pet como tutor
2. Vá para "Prestadores"
3. Clique "Convidar prestador"
4. Insira email: `luiza.prestadora@teste.com`
5. Selecione tipo: "Veterinário"
6. Configure permissões
7. Envie o convite

### 4. Aceitar Convite (como Prestador)
1. Faça login como `luiza.prestadora@teste.com`
2. Vá para "Notificações"
3. Aceite o convite de prestador

---

## 📊 Estrutura de Banco de Dados

### Tabelas Principais
- `usuarios` - Dados dos usuários
- `perfis_prestador` - Perfis profissionais
- `pets` - Pets cadastrados
- `pet_usuarios` - Relacionamento tutor ↔ pet
- `pet_prestadores` - Relacionamento prestador ↔ pet com permissões
- `vacinas` - Registro de vacinações
- `medicamentos` - Medicamentos prescritos
- `notificacoes` - Sistema de notificações
- `guardas` - Guarda provisória
- `votos` - Sistema de votação
- `eventos` - Histórico de eventos

---

## 🔐 Segurança

- ✅ Senhas com hash Argon2
- ✅ JWT com access (15m) + refresh (7d)
- ✅ CORS configurado
- ✅ Validação de entrada (class-validator)
- ✅ Soft deletes para auditoria

---

## 📝 Notas

- **Perfil "Visitante"** é criado como TUTOR porque o sistema suporta 3 tipos: TUTOR, PRESTADOR, AMBOS
- **Prestador criado** com permissões padrão: VISUALIZAR, REGISTRAR_SERVICO
- **Veterinário** recebe automaticamente: EDITAR_SAUDE em adição às permissões padrão
- Todos os usuários foram criados em **Horário de Brasília (BRT/BRST)**

---

## 🚀 Próximos Passos

1. Iniciar o backend: `npm run start`
2. Iniciar o frontend: `npm run dev`
3. Fazer login com qualquer uma das credenciais acima
4. Testar os fluxos descritos em `FASE_1A_E2E_TESTING.md`

---

**Data de Criação:** 07/03/2026 10:32
**Versão:** 1.0
