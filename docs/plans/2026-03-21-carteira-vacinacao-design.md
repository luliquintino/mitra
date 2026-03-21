# Carteira de Vacinacao — Design Document

## Resumo

Nova sub-aba "Carteira" dentro da aba Saude do pet. Simula uma caderneta de vacinacao digital com visual de "Passaporte de Saude" — mistura documento oficial com gamificacao. O pet coleciona selos de protecao conforme vacinas sao aplicadas.

## Decisoes

- Sub-aba separada (nao substitui "Vacinas" existente)
- Veterinario pode enviar lembretes + criar agendamentos
- Visual: caderneta com elementos de progresso e gamificacao
- Vacinas pendentes: hibrido (automatico por especie + vet personaliza)

---

## Estrutura da UI

### 1. Header — Capa da Caderneta

Card estilizado como capa de documento:

- Foto do pet (w-16 h-16 rounded-2xl) + nome + especie
- Anel SVG de protecao circular (% vacinas aplicadas / total recomendadas)
- Label dinamico baseado na porcentagem:
  - < 40%: "Protecao inicial" (coral)
  - 40-70%: "Bem protegido" (amarelo)
  - > 70%: "Imunizacao completa" (menta)
- Proximo lembrete destacado: "Proxima vacina: V10 em 15 dias"

### 2. Conquistas (badges colecionaveis)

Faixa horizontal scrollavel com badges:

| Badge | Condicao | Icone |
|-------|----------|-------|
| Primeira vacina | 1+ vacina aplicada | shield |
| Dia em dia | Todas obrigatorias em dia | syringe |
| Protecao total | 100% das recomendadas | trophy |
| Vet de confianca | Tem veterinario vinculado | star |

Badges nao conquistados ficam em grayscale com opacity-40.

### 3. Tres categorias de vacinas

#### Aplicadas (selo carimbado)
- Borda solida menta, icone checkmark verde
- Leve rotacao aleatoria (rotate-1 / -rotate-1) simulando carimbos
- Campos: nome, data aplicacao, veterinario, clinica
- Se tem proximaDose: badge com data e status (vencida/em breve/ok)

#### Agendadas (aguardando)
- Borda pontilhada amarela, icone calendario
- Campos: nome, data agendada, veterinario que agendou
- Countdown: "Em X dias"
- Botoes tutor: "Confirmar" / "Reagendar"
- Status: "Aguardando confirmacao" ou "Confirmada"

#### Pendentes (nao marcou)
- Borda pontilhada coral, fundo bg-coral/5
- Fonte: VACINAS_POR_ESPECIE + recomendacoes do vet
- Cada card: nome + origem ("Recomendada para Cachorro" ou "Recomendada por Dr. X")
- CTA tutor: "Agendar"
- CTA vet: "Recomendar ao tutor" / "Agendar para o pet"

### 4. Funcionalidades do Veterinario

Quando role === 'VETERINARIO' ou 'VETERINARIA':

- **Recomendar vacina**: modal com dropdown de vacinas da especie + nota personalizada
- **Lembrar tutor**: botao em vacinas pendentes/vencidas, envia notificacao
- **Agendar vacina**: cria agendamento com data/hora sugerida
- Badge visual: "Recomendado por Dr. X" nas vacinas marcadas pelo vet

### 5. Detalhes visuais divertidos

- Rotacao aleatoria nos selos aplicados (CSS rotate)
- Confetti CSS-only quando atinge 100%
- Transicao suave ao mudar de categoria
- Icones tematicos por tipo de vacina
- Anel de progresso animado ao carregar

---

## Dados e API

### Novos tipos

```typescript
interface RecomendacaoVacina {
  id: string;
  petId: string;
  nomeVacina: string;
  veterinarioId: string;
  veterinarioNome: string;
  nota?: string;
  criadoEm: string;
}

interface AgendamentoVacina {
  id: string;
  petId: string;
  nomeVacina: string;
  dataAgendada: string;
  veterinarioId?: string;
  veterinarioNome?: string;
  status: 'PENDENTE' | 'CONFIRMADA' | 'REAGENDADA' | 'CANCELADA';
  criadoEm: string;
}
```

### Novos endpoints mock

```typescript
healthApi.recomendacoesVacina(petId) -> RecomendacaoVacina[]
healthApi.recomendarVacina(petId, { nomeVacina, nota }) -> RecomendacaoVacina
healthApi.agendamentosVacina(petId) -> AgendamentoVacina[]
healthApi.agendarVacina(petId, { nomeVacina, dataAgendada }) -> AgendamentoVacina
healthApi.confirmarAgendamento(petId, agendamentoId) -> AgendamentoVacina
healthApi.lembrarTutorVacina(petId, nomeVacina) -> { mensagem }
```

### Mock data inicial (Luna)

```typescript
mockRecomendacoesLuna = [
  { id: 'rec-1', petId: 'pet-luna', nomeVacina: 'Leishmaniose',
    veterinarioId: 'usr-vet', veterinarioNome: 'Dr. Roberto Silva',
    nota: 'Recomendada por Luna frequentar areas com mosquitos.',
    criadoEm: '2026-02-15T10:00:00Z' },
]

mockAgendamentosLuna = [
  { id: 'ag-1', petId: 'pet-luna', nomeVacina: 'V10 (Dectupla)',
    dataAgendada: '2026-04-10T14:00:00Z',
    veterinarioNome: 'Dr. Roberto Silva',
    status: 'PENDENTE', criadoEm: '2026-03-15T10:00:00Z' },
]
```

---

## Logica de protecao

```
vacinasEspecie = VACINAS_POR_ESPECIE[pet.especie]
vacinasRecomendadas = vacinasEspecie + recomendacoes do vet (sem duplicatas)
vacinasAplicadas = vacinas com dataAplicacao e nao vencidas
porcentagem = vacinasAplicadas.length / vacinasRecomendadas.length * 100
```

Uma vacina "aplicada" conta como protecao ativa se:
- Nao tem proximaDose, OU
- proximaDose ainda nao passou

---

## Arquivos a criar/modificar

| Arquivo | Acao |
|---------|------|
| `frontend/src/types/index.ts` | ADD RecomendacaoVacina, AgendamentoVacina |
| `frontend/src/lib/mock-data.ts` | ADD mockRecomendacoesLuna, mockAgendamentosLuna |
| `frontend/src/lib/mock-api.ts` | ADD endpoints no mockHealthApi |
| `frontend/src/lib/api.ts` | ADD healthApi.recomendacoesVacina, etc |
| `frontend/src/app/pets/[id]/saude/page.tsx` | ADD sub-aba "Carteira" + componente CarteiraVacinacao |

---

## Constraints

- Zero bibliotecas externas (CSS-only animations)
- SVG inline para anel de progresso
- Preservar toda funcionalidade existente da aba Vacinas
- PT-BR em todo conteudo
- Design system PT (pt-card, pt-btn, cores coral/menta/amarelo/creme)
- Mobile-first (375px+)
