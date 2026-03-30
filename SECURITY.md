# Politica de Seguranca

## Reportando uma Vulnerabilidade

Se voce encontrar uma vulnerabilidade de seguranca no MITRA, agradecemos sua ajuda em divulga-la de forma responsavel.

**NAO abra uma issue publica no GitHub para vulnerabilidades de seguranca.**

### Como reportar

1. Envie um email para **seguranca@mitra.pet** com:
   - Descricao da vulnerabilidade
   - Passos para reproduzir
   - Impacto potencial
   - Sugestao de correcao (se tiver)

2. Voce recebera uma confirmacao de recebimento em ate **48 horas**.

3. Trabalharemos com voce para entender e corrigir o problema antes de qualquer divulgacao publica.

### O que esperamos

- Nos de tempo razoavel para corrigir o problema antes de divulga-lo publicamente
- Faca um esforco de boa fe para evitar violacoes de privacidade, destruicao de dados e interrupcao de servico
- Nao acesse ou modifique dados de outros usuarios

### O que oferecemos

- Reconhecimento publico (se desejado) no CHANGELOG ou README
- Comunicacao transparente sobre o progresso da correcao
- Nenhuma acao legal contra pesquisadores de seguranca que sigam esta politica

## Versoes Suportadas

| Versao | Suportada |
|--------|-----------|
| main (latest) | Sim |
| Versoes anteriores | Nao |

## Boas Praticas

Se voce esta fazendo deploy do MITRA, recomendamos:

- Manter todas as dependencias atualizadas
- Usar HTTPS em producao
- Nunca commitar arquivos `.env` com secrets reais
- Rotacionar JWT secrets periodicamente
- Configurar rate limiting no backend
- Usar uma senha forte para o banco de dados PostgreSQL
