# Epic 7 — Obras menos lineares

Data: 2026-04-29
Status: planejado

## Objetivo

Fazer as páginas de obra dependerem menos de leitura linear contínua.

O conteúdo já existe.
O trabalho agora é reorganizar peso, ritmo e relação entre blocos para que a inteligência da obra apareça mais pela estrutura.

---

## Problema

As páginas de obra já são muito melhores do que antes, mas ainda recaem em um padrão de leitura relativamente corrido:
- dossiê
- bloco de regime
- texto
- relações laterais
- documentação

As relações existem, mas ainda não organizam tanto a experiência quanto poderiam.

---

## Resultado esperado

Ao final deste epic:
- dossiê, regime e relações devem ter mais força compositiva
- a narrativa longa deve perder o papel de centro absoluto
- cada regime deve modular mais claramente a experiência sem virar três sites distintos

---

## Frentes

### Frente 7.1 — Relações sobem de importância
- testar posição, ritmo e peso das relações públicas
- verificar se algumas relações devem entrar antes ou durante a narrativa

### Frente 7.2 — Blocos de regime mais fortes
- mecanismo / circulação / archive note devem ter presença mais clara
- o visitante deve captar o regime antes de ler tudo

### Frente 7.3 — Modulação da narrativa longa
- criar pequenas quebras ou variações de ritmo
- evitar “parede de texto” mesmo quando o texto é bom

---

## Stories

### Story 7.1 — Auditar `Obra.astro`
- mapear o que hoje é fixo demais
- listar pontos em que regimes poderiam modular a composição

### Story 7.2 — Prototipar 2 ou 3 variações de leitura
- sem mudar a tese
- sem apagar a unidade do site

### Story 7.3 — Aplicar em um trio de teste
Sugestão:
- `cachoeira`
- `metadata`
- `oceanvs`

### Story 7.4 — Expandir ao restante
- só depois de validar que a modulação melhora leitura

---

## Critério de pronto

O epic termina quando:
- a obra pode ser lida por mais de uma porta de entrada
- relações deixam de parecer apêndice
- os textos continuam fortes, mas deixam de ser o único motor da página

---

## Claude Design

Pode ajudar aqui?
**Sim, mas depois da auditoria estrutural feita no código.**

Bom uso:
- alternativas de hierarquia entre blocos
- modulações de composição por regime
- estudos de ritmo visual da página

Mau uso:
- reescrever a lógica editorial da página
- propor ornamentação para compensar estrutura fraca
