# Epic 5 — Hierarquia de superfícies + estatutos visíveis

Data: 2026-04-29
Status: pronto para execução

## Objetivo

Deixar inequívoco:
- `home` = entrada
- `obra` = lastro
- `mapa` = exploração
- `grafo` = camada legacy / arquivo paralelo

E, ao mesmo tempo, parar de colocar no mesmo plano visual:
- `REALIZADA`
- `A_CONFIRMAR`
- obra autoral
- direção espacial
- colaboração estruturante

---

## Problema

Hoje a arquitetura já existe, mas parte dela ainda depende de leitura cuidadosa demais.
A inteligência está no sistema, porém nem sempre aparece rápido o suficiente na interface.

---

## Resultado esperado

Ao final deste epic:
- a hierarquia das superfícies deve estar clara em navegação, microcopy e sinalização
- obras ambíguas devem parecer ambíguas de forma controlada, não parecer apenas mal resolvidas
- regimes e estatutos devem ganhar expressão visual mínima consistente

---

## Frentes

### Frente 5.1 — Hierarquia explícita das superfícies
Entregas:
- revisar sinais de navegação entre `/`, `/mapa`, `/obras/*` e `/grafo`
- marcar `/grafo` explicitamente como camada legacy
- reforçar no `/mapa` que ele é leitura relacional do arquivo, não homepage paralela

Arquivos prováveis:
- `src/pages/index.astro`
- `src/pages/mapa.astro`
- `src/layouts/Obra.astro`
- eventual superfície de `/grafo` se houver wrapper textual

### Frente 5.2 — Status visíveis
Entregas:
- sistema visual claro para `REALIZADA` vs `A_CONFIRMAR`
- aplicar especialmente em:
  - `flama`
  - `player1`
  - home
  - páginas de obra
  - mapa, se couber

Arquivos prováveis:
- `src/layouts/Obra.astro`
- `src/pages/index.astro`
- `src/pages/mapa.astro`
- `src/data/works.json` apenas se algum metadado auxiliar for necessário

### Frente 5.3 — Estatuto autoral / espacial / colaborativo
Entregas:
- explicitar melhor quando uma peça é:
  - obra autoral
  - instalação-sistema
  - exposição dirigida
  - colaboração estruturante
- testar forma curta de exibição disso no dossiê, sem virar burocracia

Obras prioritárias:
- `luz-aeterna`
- `amano`
- `flama`
- `player1`
- eventualmente `oceanvs`

---

## Stories

### Story 5.1 — Microcopy de hierarquia
- revisar labels e chamadas curtas
- evitar superfícies paralelas sem nome claro

### Story 5.2 — Sistema de status
- desenhar 1 solução mínima
- aplicar no home + obra
- validar se não vira UI de dashboard

### Story 5.3 — Sistema de estatuto
- criar uma gramática curta
- testar nos casos ambíguos
- não inventar novas categorias além das já sustentadas pelo arquivo

### Story 5.4 — Rodada de consistência
- verificar se os sinais aparecem com coerência nas páginas principais
- garantir que o ganho visual não dependa de texto explicativo extra

---

## Critério de pronto

O epic termina quando:
- um visitante entende mais rapidamente o papel de cada superfície
- `A_CONFIRMAR` deixa de parecer detalhe escondido
- obras de estatuto ambíguo deixam de parecer simplesmente iguais às demais
- a interface passa a carregar parte da ambiguidade que hoje ainda está só no texto

---

## Claude Design

Pode ajudar aqui?
**Sim, mas com escopo estreito.**

Bom uso:
- explorar 2–3 alternativas de diferenciação visual de status
- propor micro-hierarquias de navegação
- testar como mostrar estatuto sem poluir o dossiê

Mau uso:
- reinventar a home
- reabrir tese visual
- transformar isso em interface-app ou sistema excessivamente sinalizado
