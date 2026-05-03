# Epic 5 — Plano operacional

Data: 2026-04-29
Status: pronto para implementação
Epic-base: `claude-design/EPIC-5-HIERARQUIA-E-ESTATUTOS.md`

## Tese fixa

Não reabrir direção.

A tese continua:

> **ARQUIVO / EXIBIÇÃO**

O trabalho deste epic é fazer a interface mostrar melhor:
- hierarquia das superfícies
- status factual
- estatuto da obra
- regime editorial

---

## Diagnóstico de partida

### Já funciona
- home como entrada monumental + arquivo tabular
- páginas de obra com dossiê, blocos de regime, narrativa, relações e documentação
- mapa como diagrama técnico de relações públicas
- `A_CONFIRMAR` já existe em dados e aparece como chip mínimo

### Ainda fraco
- `A_CONFIRMAR` parece detalhe, não regime de incerteza controlada
- obra autoral, exposição dirigida, instalação-sistema e colaboração aparecem quase com o mesmo peso visual
- `/grafo` ainda não está declarado como camada legacy na experiência principal
- `/mapa` diz que é técnico, mas ainda não se posiciona claramente como exploração relacional dentro da hierarquia do site
- parte da ambiguidade ainda depende demais de texto longo

---

## Arquivos principais

### Obrigatórios
- `src/pages/index.astro`
- `src/layouts/Obra.astro`
- `src/pages/mapa.astro`
- `src/data/works.json`

### Prováveis
- `src/pages/sobre.astro`
- `src/pages/trajetoria.astro`
- `src/pages/publicacoes.astro`
- `src/pages/escritos/index.astro`

### Só se necessário
- `src/data/work-regimes.json`
- `src/data/map-relations.json`
- `public/grafo.html` ou rota equivalente, apenas se houver forma segura de sinalizar legacy sem quebrar o grafo

---

## Implementação recomendada

## Story 5.1 — Vocabulário de superfícies

### Objetivo
Declarar a hierarquia:
- home = entrada / índice do arquivo
- obras = lastro / dossiê
- mapa = exploração relacional
- grafo = arquivo legado / camada histórica

### Tarefas
1. Em `src/pages/index.astro`:
   - ajustar bloco de links finais para nomear as superfícies com função curta
   - exemplo de intenção:
     - `mapa — exploração relacional`
     - `escritos — camada conceitual`
     - `publicações — circulação editorial`
     - `trajetória — cronologia`
     - `sobre — contexto`
     - `grafo — arquivo legacy`
2. Em `src/pages/mapa.astro`:
   - trocar ou complementar o texto atual para reforçar: mapa = exploração relacional do arquivo atual
   - manter restrição: sem busca, sem filtros, sem centro em Felipe
3. Em `src/layouts/Obra.astro`:
   - revisar `← arquivo` para manter volta clara à home/arquivo
   - opcional: adicionar link discreto para `/mapa` como `ver relações no mapa`, sem transformar página de obra em hub de navegação

### Critério de aceite
- Um visitante entende a função de `/mapa` antes de interagir
- `/grafo` não compete com `/mapa`
- os links não parecem menu de app

---

## Story 5.2 — Sistema visual de status

### Objetivo
Fazer `REALIZADA` e `A_CONFIRMAR` terem diferença visual clara, sem estética de dashboard.

### Tarefas
1. Criar helper de status em `index.astro` e `Obra.astro`:
   - label curto
   - descrição curta opcional
   - classe visual consistente
2. Home:
   - manter tabela, mas tornar `A_CONFIRMAR` mais legível
   - linhas pendentes devem sugerir arquivo em confirmação, não erro
3. Obra:
   - ampliar o chip `A_CONFIRMAR` no topo
   - no dossiê, status deve aparecer com nota curta quando for `A_CONFIRMAR`
4. Mapa:
   - manter `FLAMA` e `Player 1` fora do mapa v1 se ainda for a decisão
   - se mencionados no texto, explicar que ficam fora das relações públicas até confirmação

### Critério de aceite
- `FLAMA` e `Player 1` são imediatamente percebidas como obras publicadas em estado pendente
- `A_CONFIRMAR` não parece bug nem nota escondida
- `REALIZADA` não precisa de excesso de destaque

---

## Story 5.3 — Estatuto editorial da obra

### Objetivo
Criar uma camada curta de estatuto que ajude a diferenciar:
- obra autoral
- instalação-sistema
- arte pública / intervenção
- exposição dirigida
- colaboração estruturante

### Dados
Usar dados já existentes antes de criar novos campos.

Fontes possíveis:
- `work.tipo`
- `work.contexto`
- `work.serie`
- `frontmatter.mechanism`
- `frontmatter.circulation`
- `frontmatter.collaborationNote`
- `work.status`

### Tarefas
1. Criar helper em `Obra.astro`:
   - `deriveEditorialStatus(work, frontmatter)` ou equivalente
   - saída curta, por exemplo:
     - `ARTE PÚBLICA / GESTO FUNDACIONAL`
     - `INSTALAÇÃO-SISTEMA`
     - `EXPOSIÇÃO DIRIGIDA`
     - `DIREÇÃO ESPACIAL / COLABORAÇÃO`
     - `PROJETO EM CONFIRMAÇÃO`
2. Exibir no topo e/ou dossiê sem inflar a página
3. Testar especialmente:
   - `luz-aeterna`
   - `amano`
   - `flama`
   - `player1`
   - `oceanvs`
4. Só criar campo novo em `works.json` se a inferência ficar frágil demais

### Critério de aceite
- `Luz Æterna` e `AMANO` não parecem iguais a `Cachoeira`
- `FLAMA` e `Player 1` não parecem finalizadas
- a página não ganha burocracia excessiva

---

## Story 5.4 — Regimes visíveis sem virar template novo

### Objetivo
Mostrar A / B / C como prioridade de leitura, não como taxonomia decorativa.

### Tarefas
1. Usar `src/data/work-regimes.json` ou helper local para derivar regime
2. Exibir um sinal mínimo:
   - Regime A: `fundacional / território / linhagem`
   - Regime B: `sistema / corpo / mecanismo`
   - Regime C: `espaço / circulação / colaboração`
3. Aplicar principalmente em `Obra.astro`
4. Opcional na home: não transformar tabela em excesso de tags

### Critério de aceite
- Regime ajuda a ler a obra
- Não vira filtro, dashboard ou taxonomia corporativa
- O visitante percebe diferença sem precisar decorar A/B/C

---

## Story 5.5 — Consistência nas páginas secundárias

### Objetivo
Garantir que `/sobre`, `/trajetoria`, `/publicacoes` e `/escritos` acompanhem a hierarquia geral.

### Tarefas
1. Revisar títulos/kickers para manter função clara:
   - `/sobre` = contexto do artista
   - `/trajetoria` = cronologia
   - `/publicacoes` = circulação editorial
   - `/escritos` = camada conceitual
2. Adicionar links de retorno ou cruzamentos apenas se reforçarem o arquivo
3. Não transformar páginas secundárias em manifesto

### Critério de aceite
- Páginas secundárias não parecem outro site
- Elas sustentam o arquivo, não competem com a home

---

## Ordem de execução

1. Story 5.2 — sistema de status
2. Story 5.3 — estatuto editorial
3. Story 5.4 — regimes visíveis
4. Story 5.1 — vocabulário de superfícies
5. Story 5.5 — consistência secundária
6. build
7. auditoria curta Casey/Bauman ou reviewer
8. deploy com confirmação infra

Motivo da ordem:
- status e estatuto resolvem primeiro a ambiguidade mais sensível
- hierarquia de superfícies depois fica mais simples
- páginas secundárias são acabamento de consistência

---

## Não fazer neste epic

- não redesenhar a home do zero
- não criar busca ou filtros
- não centralizar o mapa em Felipe
- não decidir status final de `FLAMA` ou `Player 1`
- não mover `AMANO` ou `Luz Æterna` para fora de obras
- não reescrever textos longos, exceto microcopy necessária
- não mexer profundamente no EN

---

## Uso de subagentes

### Worker
Bom para:
- implementar helpers e classes
- aplicar microcopy
- testar consistência em arquivos

### Reviewer
Obrigatório antes do build final:
- procurar overreach factual
- verificar se `A_CONFIRMAR` não foi resolvido falsamente
- checar se a interface não virou dashboard

### Casey Reas
Usar depois da primeira implementação:
- forma expressa comportamento?
- status/regime aparecem como sistema ou decoração?

### Bauman
Usar depois da primeira implementação:
- forma ficou mais durável ou mais líquida?
- sinalização adicionou consistência ou ruído?

---

## Quando chamar Claude Design

### Pode chamar depois da Story 5.2 ou antes da Story 5.3

Melhor briefing:
- mandar screenshots atuais da home, obra `flama`, obra `luz-aeterna`, mapa
- pedir apenas 2–3 alternativas visuais para:
  - `A_CONFIRMAR`
  - estatuto editorial
  - regime de obra
- proibir mudança de tese, layout geral e texto autoral

### Prompt sugerido

```text
Estamos refinando felipesztutman.com. A tese ARQUIVO / EXIBIÇÃO já está congelada. Não redesenhe o site.

Quero apenas alternativas formais pequenas para diferenciar:
1. status REALIZADA vs A_CONFIRMAR
2. estatuto editorial da obra: arte pública, instalação-sistema, exposição dirigida, colaboração/direção espacial
3. regime de leitura: fundacional, sistema, circulação

Use as telas como base. Preserve a linguagem: preto/off-white, arquivo, dossiê, sem estética de dashboard, startup, app ou template editorial genérico.

Entregue 2 ou 3 opções visuais aplicáveis aos componentes existentes, com prós/contras. Não reescreva textos. Não proponha nova arquitetura.
```

### Quando NÃO chamar
- antes de sabermos exatamente qual dado a interface precisa mostrar
- para resolver ambiguidade curatorial
- para revisar copy autoral

---

## Definição de pronto do Epic 5

O Epic 5 está pronto quando:
- home, obra e mapa deixam claro seu papel relativo
- `A_CONFIRMAR` tem presença pública honesta
- estatutos editoriais aparecem sem burocracia
- regimes ajudam a leitura sem virar decoração
- build passa
- deploy verificado em pelo menos:
  - `/`
  - `/mapa`
  - `/obras/flama`
  - `/obras/player1`
  - `/obras/luz-aeterna`
  - `/obras/amano`
