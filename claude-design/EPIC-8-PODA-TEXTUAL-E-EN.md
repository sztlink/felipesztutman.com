# Epic 8 — Poda textual + EN normalization

Data: 2026-04-29
Status: planejado

## Objetivo

Reduzir a função compensatória do texto e levar a lógica estabilizada no PT para o EN.

---

## Problema

Hoje muitos textos são bons, mas ainda precisam carregar inteligência que a interface só parcialmente absorve.
Ao mesmo tempo, a versão em inglês ainda não acompanha integralmente o novo sistema de regimes e dossiê.

---

## Resultado esperado

Ao final deste epic:
- leads, archive notes e blocos longos estarão mais precisos
- redundâncias entre texto e metadado serão cortadas
- o EN deixará de parecer superfície atrasada em relação ao PT

---

## Frentes

### Frente 8.1 — Poda textual no PT
- revisar leads e archive notes excessivamente explicativos
- cortar repetições do que já aparece no dossiê
- manter densidade apenas onde ela gera contexto durável

### Frente 8.2 — Normalização EN
- aplicar a lógica de regime nas páginas em inglês
- alinhar blocos estruturais com o PT
- preservar tradução honesta sem expandir ficcionalmente

### Frente 8.3 — Revisão final de durabilidade
- checar se os textos permanecem úteis como dossiê daqui a 1 ano
- evitar formulações datadas demais, defensivas demais ou infladas demais

---

## Stories

### Story 8.1 — Selecionar páginas com maior excesso explicativo
Sugestão inicial:
- `metadata`
- `flama`
- `player1`
- `luz-aeterna`

### Story 8.2 — Poda piloto
- fazer uma rodada curta
- validar se a interface absorve melhor a inteligência removida do texto

### Story 8.3 — EN por lote
- lote A: páginas de obra prioritárias
- lote B: páginas secundárias
- lote C: refinamento geral

---

## Critério de pronto

O epic termina quando:
- os textos deixam de explicar o que a interface já consegue mostrar
- o PT perde peso desnecessário sem perder voz
- o EN entra no mesmo nível estrutural do PT

---

## Claude Design

Pode ajudar aqui?
**Pouco.**

Bom uso:
- revisar se cortes textuais pedem microajustes de layout
- apontar onde a redução de texto desbalanceia a página

Mau uso:
- reescrever textos autorais
- inventar formulações de obra
- decidir tom, estatuto ou factualidade
