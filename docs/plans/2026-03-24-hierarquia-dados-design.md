# Hierarquia de Dados — Design

## Contexto

O MITRA precisa de controle granular de acesso por role. Hoje o sistema filtra apenas quais **abas** cada role vê, mas dentro das abas todo conteúdo é visível. O objetivo é implementar filtragem **dentro** de cada aba, especialmente na Saúde.

## Matriz de Permissões

| Funcionalidade | Tutor Principal | Tutor Emergência | Veterinário | Visitante |
|---|---|---|---|---|
| Home (alertas, stats, calendário, atividade) | Tudo | Tudo | Leitura | ✗ |
| Saúde > Carteira | Tudo | Tudo | Leitura | **Leitura** |
| Saúde > Vacinas | CRUD | CRUD | Ver + recomendar/agendar | **Leitura** |
| Saúde > Medicamentos | CRUD | CRUD | Ver + registrar administração | **Leitura** |
| Saúde > Sintomas | CRUD + fotos | CRUD + fotos | **Leitura** (ver fotos) | ✗ |
| Saúde > Mural (NOVO) | Ver + postar | Ver + postar | **Ver + postar** | ✗ |
| Saúde > Plano de Saúde | Tudo | Leitura | ✗ | ✗ |
| Saúde > Consultas | CRUD | CRUD | ✗ | ✗ |
| Guarda | Tudo | Tudo | ✗ | ✗ |
| Histórico | Tudo | Tudo | Leitura | ✗ |
| Perfil | Tudo | Leitura | ✗ | ✗ |

## Implementação

### 1. Sub-tabs Saúde filtradas por role
- Tutor: Carteira, Vacinas, Medicamentos, Sintomas, Mural, Plano, Consultas
- Vet: Carteira, Vacinas, Medicamentos, Sintomas, Mural (com readOnly onde aplicável)
- Visitante: Carteira, Vacinas, Medicamentos (todos readOnly)

### 2. Prop `readOnly` em cada sub-tab
- Esconde formulários de criação/edição
- Esconde botões de ação (excluir, editar)
- Mantém visualização completa dos dados

### 3. Nova sub-aba "Mural"
- Feed de fotos/observações com autor + role badge + data
- Upload de foto + texto (vet e tutor podem postar)
- Mock data + endpoints

### 4. Visitante com acesso à Saúde
- Rota `/visitante/pets/[id]` ganha sub-abas de saúde
- Reutiliza componentes com readOnly=true

### Arquivos a modificar
- `pets/[id]/saude/page.tsx` — filtrar sub-tabs, prop readOnly, nova MuralTab
- `pets/[id]/historico/page.tsx` — readOnly para vet
- `pets/[id]/perfil/page.tsx` — readOnly para tutor emergência
- `visitante/pets/[id]/page.tsx` — adicionar sub-tabs saúde
- `lib/mock-api.ts` — novos endpoints mural
- `lib/mock-data.ts` — mock mural posts
- `lib/api.ts` — wrappers mural
- `types/index.ts` — tipo MuralPost

## Verificação
1. Login como tutor → acesso total
2. Login como vet → vê Carteira/Vacinas/Meds/Sintomas/Mural, não vê Plano/Consultas
3. Login como visitante → vê Carteira/Vacinas/Meds read-only
4. Mural: tutor e vet podem postar fotos, visitante não vê
5. Formulários escondidos quando readOnly
