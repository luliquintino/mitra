# Pet Dashboard Redesign — Design Document

**Goal:** Reorganizar o dashboard do pet em 5 tabs funcionais (Home, Saude, Guarda, Historico, Perfil) reaproveitando componentes existentes, e integrar todas as features do produto MITRA.

**Decisoes do usuario:**
- 5 tabs: Home, Saude, Guarda, Historico, Perfil
- Home: alertas + mini-cards + calendario completo + atividade recente
- Saude: dashboard + 5 sub-abas (vacinas, medicamentos, sintomas, plano, consultas)
- Guarda: foco em custodia (guarda atual, solicitacoes, temporarias, historico)
- Historico: timeline com filtros + diario (galeria)
- Perfil: dados do pet + sobre + rede de cuidado (tutores/prestadores/visitantes)

**O que ja existe vs o que precisa ser feito:**
- SaudeSheet, AtividadeSheet, PessoasSheet → migrar conteudo para tabs
- Pagina /agenda orfa → migrar calendario para Home
- Pagina /diario orfa → migrar galeria para Historico
- RegisterEventModal → adicionar FAB na Home
- Alertas visuais → criar componente novo
- Tabs stub (saude, guarda, historico) → implementar com conteudo real
