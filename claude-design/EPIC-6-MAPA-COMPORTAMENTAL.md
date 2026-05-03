# Epic 6 — Mapa comportamental

Data: 2026-04-29
Status: planejado

## Objetivo

Fazer `/mapa` mostrar mais processo e menos estado.

A página já está correta como diagrama técnico.
O próximo passo é fazê-la se comportar mais como leitura viva do arquivo.

---

## Problema

Hoje o mapa comunica estrutura, mas ainda é tímido comportamentalmente.
Para um site baseado em relação, genealogia e transformação de leitura, isso limita seu papel.

---

## Resultado esperado

Ao final deste epic:
- a troca entre lentes deve mudar de fato a leitura
- seleção de nós e relações deve ter peso mais claro
- o mapa deve parecer superfície de exploração e descoberta, não só quadro-resumo

---

## Frentes

### Frente 6.1 — Lentes mais ativas
- reforçar diferença entre:
  - temporal
  - conceitual
  - linhagem
- garantir que a mudança seja legível sem explicação longa

### Frente 6.2 — Estados de foco
- melhorar seleção, hover, contexto local e relações do nó ativo
- calibrar opacidade, peso e isolamento relacional

### Frente 6.3 — Leitura de processo
- aproximar o mapa da ideia de percurso
- deixar a superfície sugerir transformação de leitura, não só navegação entre nós

---

## Stories

### Story 6.1 — Revisão de estrutura atual do mapa
- inventariar comportamento já existente
- listar onde a diferença entre lentes ainda está fraca

### Story 6.2 — Prototipar lente temporal / conceitual / linhagem
- aumentar contraste comportamental
- validar sem virar espetáculo ou gimmick

### Story 6.3 — Reforçar seleção e relações públicas
- melhorar legibilidade do nó ativo
- mostrar claramente o que muda quando um nó entra em foco

### Story 6.4 — Rodada de poda
- remover qualquer camada que pareça feature de produto
- preservar sobriedade técnica do mapa

---

## Critério de pronto

O epic termina quando:
- o usuário percebe rapidamente que cada lente reorganiza a leitura
- o mapa não compete com a home, mas expande o arquivo
- o ganho de comportamento não transforma o site em espetáculo de interface

---

## Claude Design

Pode ajudar aqui?
**Sim, provavelmente melhor aqui do que em qualquer outro epic.**

Bom uso:
- alternativas de estados de interação
- estudos de contraste entre lentes
- exploração de foco relacional e hierarquia visual

Mau uso:
- propor filtros, busca, UI de ferramenta ou centro egóico em Felipe
- transformar o mapa em visualização “wow” que enfraqueça o arquivo
