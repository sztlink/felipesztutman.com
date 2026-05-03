# Redesign ready — ponto de entrada

Data: 2026-04-29

## Objetivo
Parar a mineração de contexto e entrar em redesign/implementação.

## Pode começar agora?
**Sim.**

Já existe base suficiente para redesenhar e implementar estas 3 superfícies:
- Home
- Página de obra (`/obras/cachoeira` como primeira obra-modelo)
- Mapa

## Fontes canônicas para o redesign

### Estrutura editorial consolidada
- `src/data/works.json`
- `src/data/map-relations.json`
- `src/data/references.json`
- `src/data/publications.json`

### Conteúdo de obra e texto longo
- `src/pages/obras/*.md`
- `src/pages/escritos/*.md`

### Imagens atuais
- `src/data/gallery.json`

### Material curatorial do redesign
- `claude-design/material-claude-fase6.md`
- `claude-design/obras-oficiais.csv`
- `CLAUDE-DESIGN-HANDOFF.md`

### Artefatos brutos ignorados pelo Git

O ZIP e a pasta extraída do handoff Claude Design ficam locais e ignorados por serem material bruto/pesado de processo. As decisões canônicas foram preservadas nos Markdown versionados.

## Tese visual já travada
- regime: **ARQUIVO / EXIBIÇÃO**
- home: **arquivo com uma entrada monumental**
- páginas de obra: **preto + painéis claros embutidos**
- mapa: **diagrama técnico claro**
- evitar estética de app, dashboard, startup ou template editorial genérico
- usar só dados reais

## Decisões já assumidas para começar
- abertura home: `FELIPE SZTUTMAN`
- statement curto: `Tornar visível o invisível.`
- base do arquivo: `18 obras`
- contagem atual: `16 REALIZADA` + `2 A_CONFIRMAR`
- `Cachoeira = nº 003`
- `AMANO` e `Luz Æterna` permanecem em `obras` por enquanto

## O que NÃO bloqueia o redesign
Estas questões podem ficar pendentes sem impedir implementação da primeira rodada:
- status final de `FLAMA`
- status final de `Player 1`
- paleta final de todas as cores-pulso
- curadoria final de todas as relações públicas do mapa
- créditos expandidos de todas as obras

## O que já está suficiente para a primeira implementação

### Home
- lista de 18 obras
- número, título, ano, local, contexto, status
- statement e abertura monumental

### Cachoeira
- título, número, ano, local, contexto
- narrativa longa
- ficha técnica mínima
- galeria existente
- imprensa e publicação

### Mapa
- nós de obra
- referências
- publicação
- relações seed já classificadas em `PUBLICA` e `INTERNA`

## Ordem recomendada de execução
1. refazer `/` com a nova home
2. refazer layout de obra e aplicar primeiro em `/obras/cachoeira`
3. refazer `/mapa` usando `works.json` + `map-relations.json`
4. depois expandir para as outras obras

## Regra operacional daqui em diante
**Não abrir nova rodada conceitual.**

O próximo trabalho é de implementação.

## Perguntas pendentes que podem ser respondidas no meio do processo
- `FLAMA` = REALIZADA ou permanece `A_CONFIRMAR`?
- `Player 1` = REALIZADA ou permanece `A_CONFIRMAR`?
- `ATIVO 2008–` ou `ATIVO 2009–` na home?
- manter painel de colaboradores no mapa ou deixar fora do v1?

## Conclusão
O redesign **não está bloqueado por conteúdo**.

Ele pode começar agora com base suficiente e com pendências controladas.
