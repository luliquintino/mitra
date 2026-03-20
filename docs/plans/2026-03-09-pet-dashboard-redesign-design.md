# Pet Dashboard Redesign — Design Doc

**Data:** 2026-03-09
**Status:** Aprovado

## Objetivo

Transformar a pagina do pet em um painel de administracao completo. O tutor deve conseguir acompanhar saude, registrar eventos, gerenciar pessoas e organizar compromissos — tudo acessivel em menos de 2 cliques.

## Principio

> "Este e o lugar onde a vida do meu pet esta organizada."

## Decisoes de Design

| Decisao | Escolha |
|---------|---------|
| Navegacao | 3 tabs: Dashboard, Agenda, Perfil |
| Expansao de secoes | Bottom sheets (85% tela mobile, modal desktop) |
| Card de Saude | Unico card com sub-tabs internas no bottom sheet |
| Tabs antigas | Eliminadas. Dashboard absorve Home+Saude+Historico. Perfil absorve Perfil+Guarda. Agenda e nova. |
| Calendario | Implementacao custom com Tailwind (sem lib externa) |
| Registro rapido | Botao `+ Registrar` no header, funciona em qualquer tab |

---

## Estrutura de Navegacao

```
← Meus pets                    [+ Registrar]  ⚙️
   LUNA (foto 48x48)
───────────────────────────────────────────────
     Dashboard   |   Agenda   |   Perfil
───────────────────────────────────────────────
```

- `← Meus pets`: volta para `/home`
- `+ Registrar`: abre modal de registro rapido (vacina, consulta, banho, medicacao, sintoma, observacao, servico)
- `⚙️`: navega para tab Perfil
- Foto + nome do pet: mantidos do layout atual

---

## Tab 1: Dashboard

### 1.1 Info Basica (topo)

Area compacta sem card, direto no fundo da pagina:

```
GOLDEN RETRIEVER · 5 anos
♀ Fêmea · 28.5kg · Dourada
```

- Raca (ou especie se nao tem raca) + idade
- Genero + peso + cor em linha unica
- Sem foto (ja esta no header do layout)

### 1.2 Smart Cards

Mantem o sistema existente (`generateTutorSmartCards()`):
- Prioridades: urgent (vermelho), warning (amber), reminder (azul), suggestion (mitra)
- Cards com acao clicavel (botao no canto direito)
- Filtrados para mostrar apenas actionable (exclui `info`)

### 1.3 Card-Resumo: Saude

Conteudo compacto:
```
Saude                              [>]
💉 1 vacina pendente
💊 1 medicamento ativo
🩺 Nenhum sintoma recente
```

Ao clicar, abre **bottom sheet** com 3 sub-tabs:
- **Vacinas**: lista de vacinas + formulario de registro
- **Medicamentos**: lista (ativos/historico) + formulario + administrar dose
- **Sintomas**: lista + formulario com evidencias

O bottom sheet reutiliza a logica ja existente em `saude/page.tsx`.

### 1.4 Card-Resumo: Pessoas

Conteudo compacto:
```
Pessoas                            [>]
👥 4 pessoas vinculadas
Ana · Tutor | Carlos · Tutor
João · Adestrador | Pedro · Passeador
```

Ao clicar, abre **bottom sheet** com 3 grupos:
- **Tutores**: lista com badges, acao de convidar
- **Prestadores**: adestradores, passeadores, veterinarios
- **Visitantes**: lista com permissoes editaveis

Acoes: convidar pessoa, remover acesso, editar permissoes.

### 1.5 Card-Resumo: Atividade

Conteudo compacto (3 eventos recentes):
```
Atividade                          [>]
🎯 Sessao adestramento        · 1d
🐕 Passeio Ibirapuera         · 2d
📋 Solicitacao guarda          · 9d
```

Ao clicar, abre **bottom sheet** com timeline completa (agrupada por mes).

### 1.6 Animacoes

Staggered entrance de cima para baixo:
- Info basica: 0ms
- Smart cards: 100ms
- Saude card: 200ms
- Pessoas card: 300ms
- Atividade card: 400ms

---

## Tab 2: Agenda

### 2.1 Calendario Mensal

- Custom implementation (Tailwind, sem lib externa)
- Navegacao: `◀ Março 2026 ▶`
- Grid 7 colunas (Seg-Dom)
- Dias com eventos: dots coloridos abaixo do numero
- Hoje: destaque visual (bg mitra, bold)
- Ao tocar num dia: mostra eventos do dia abaixo

### 2.2 Eventos do Dia

Abaixo do calendario, lista de eventos do dia selecionado:
```
Hoje, 9 de março
🏥 10:00  Consulta veterinaria
💊 08:00  Bravecto (administrar)
🐕 09:00  Passeio com Pedro
```

Se nao ha eventos: "Nenhum evento para este dia."

### 2.3 Compromissos Recorrentes

Lista fixa de compromissos do pet:
```
🐕 Passeio · Qua e Sex 9-11h    (Pedro Santos)
🎯 Adestramento · Ter 10-11h     (João Ferreira)

[+ Novo compromisso]
```

Botao abre **bottom sheet** com formulario:
- Tipo: PASSEIO, CONSULTA, BANHO, ADESTRAMENTO, CRECHE, HOSPEDAGEM, OUTRO
- Responsavel: selecionar entre pessoas vinculadas
- Recorrencia: UNICO, DIARIO, SEMANAL, QUINZENAL, MENSAL
- Dias da semana (se recorrente)
- Horario inicio/fim
- Data inicio/fim

### 2.4 Fontes de Dados no Calendario

Aparecem como eventos no calendario:
- Compromissos recorrentes (calculados a partir de diasSemana + recorrencia)
- Proximas doses de vacina (proximaDose)
- Medicacoes ativas (horarios + frequencia)
- Guardas temporarias (dataInicio/dataFim)

---

## Tab 3: Perfil

Absorve conteudo de:
- Antiga tab "Perfil" (dados do pet, AirTag, tutores, plano saude, feedback)
- Antiga tab "Guarda" (guarda compartilhada, solicitacoes, guardas temporarias)

### Secoes

1. **Dados do pet** — foto, nome, especie, raca, nascimento, codigo (copiar) + botao Editar
2. **Dados detalhados** — peso, cor, microchip, brincadeira favorita, petisco favorito, observacoes
3. **Localizacao** — AirTag (cadastrar/ver/alterar)
4. **Guarda** — tipo de guarda, guarda atual, proximo tutor, solicitar alteracao, guardas temporarias
5. **Plano de Saude** — operadora, plano, cartao, vigencia, coberturas
6. **Acoes** — enviar feedback, arquivar pet, badge beta

---

## Bottom Sheet: Especificacao

- **Mobile:** sobe de baixo, ocupa ~85% da tela, backdrop escuro, swipe-down para fechar
- **Desktop:** modal centralizado, max-width 560px, backdrop escuro, click-outside para fechar
- **Animacao:** slide-up 200ms ease-out
- **Header:** titulo + botao X para fechar
- **Scroll:** conteudo interno com overflow-y-auto

---

## Modal: Registrar Evento

Acessivel pelo botao `+ Registrar` no header (visivel em qualquer tab).

Passo 1 — Selecionar tipo:
```
Qual evento registrar?
[💉 Vacina]  [🏥 Consulta]  [🛁 Banho]
[💊 Medicação] [🩺 Sintoma] [📝 Observação]
[🔧 Serviço]
```

Passo 2 — Formulario especifico do tipo selecionado.

Para tipos que ja tem formulario (Vacina, Medicamento, Sintoma, Consulta): reutilizar logica existente.
Para tipos novos (Banho, Observacao, Servico): formularios simples (titulo + descricao + data).

---

## Arquivos Impactados

### Modificar
| Arquivo | Mudanca |
|---------|---------|
| `frontend/src/app/pets/[id]/layout.tsx` | Novas 3 tabs (Dashboard, Agenda, Perfil). Adicionar botao `+ Registrar` no header. Remover tabs antigas. |
| `frontend/src/app/pets/[id]/page.tsx` | Reescrever: dashboard com info basica + smart cards + cards-resumo |
| `frontend/src/app/pets/[id]/perfil/page.tsx` | Absorver conteudo de guarda. Reestruturar secoes. |

### Criar
| Arquivo | Conteudo |
|---------|---------|
| `frontend/src/app/pets/[id]/agenda/page.tsx` | Nova tab: calendario + eventos do dia + compromissos |
| `frontend/src/components/BottomSheet.tsx` | Componente reutilizavel de bottom sheet |
| `frontend/src/components/CalendarMonth.tsx` | Calendario mensal custom |
| `frontend/src/components/RegisterEventModal.tsx` | Modal de registro rapido |

### Remover/Deprecar
| Arquivo | Razao |
|---------|-------|
| `frontend/src/app/pets/[id]/saude/page.tsx` | Conteudo migra para bottom sheet do Dashboard |
| `frontend/src/app/pets/[id]/guarda/page.tsx` | Conteudo migra para tab Perfil |
| `frontend/src/app/pets/[id]/historico/page.tsx` | Conteudo migra para bottom sheet do Dashboard |
| `frontend/src/app/pets/[id]/registrar-consulta/page.tsx` | Absorvido pelo modal de registro rapido |

**Nota:** As paginas removidas podem ser mantidas como redirects temporarios por seguranca.

---

## APIs Existentes (nenhuma nova necessaria)

Todas as APIs ja existem e suportam a funcionalidade descrita:
- `petsApi`, `healthApi`, `eventsApi`, `compromissosApi`, `governanceApi`, `custodyApi`, `registrosApi`, `visitantesApi`

---

## Ordem de Implementacao Sugerida

1. Componente `BottomSheet` reutilizavel
2. Layout: novas 3 tabs + botao Registrar
3. Dashboard: info basica + smart cards (reusar) + cards-resumo
4. Bottom sheets: Saude, Pessoas, Atividade
5. Modal: Registrar Evento
6. Tab Agenda: calendario + compromissos
7. Tab Perfil: absorver guarda + reestruturar
8. Cleanup: remover paginas antigas, adicionar redirects
