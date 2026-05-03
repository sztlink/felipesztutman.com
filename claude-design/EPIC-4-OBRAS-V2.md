# Epic 4 — Obras V2 / Arquivo Vivo

Data: 2026-04-29
Status: pronto para execução

## Objetivo

Evitar que o site vire um arquivo homogêneo.

A próxima rodada não muda a tese ARQUIVO / EXIBIÇÃO.
Ela aprofunda a diferença real entre obras.

## Resultado esperado

Ao final deste epic, o site deve ter:
- 3 obras-piloto em regimes distintos
- regras claras de variação estrutural por tipo de obra
- legenda/crédito/documentação mais consistente
- checklist de normalização para as 18 obras

---

## Regimes de obra

### A. Fundacional / arte pública / gesto inaugural
Exemplos:
- `cachoeira`
- `occupycopan`
- `mantiqueira`
- `corrego-rio-verde`

Comportamento:
- dossiê forte
- contexto urbano/territorial visível
- relações genealógicas importantes
- documentação histórica pesa mais que espetáculo

### B. Instalação / sistema / mecanismo perceptivo
Exemplos:
- `mementos`
- `interludio`
- `metadata`
- `o-que-nos-une`

Comportamento:
- ficha técnica e mecanismo sobem de importância
- relação corpo/sistema precisa aparecer
- documentação deve mostrar operação, não só ambiente

### C. Exposição imersiva / direção espacial / circulação institucional
Exemplos:
- `oceanvs`
- `floresta-utopica`
- `andromeda`
- `luz-aeterna`
- `amano`

Comportamento:
- circulação e adaptação importam
- colaboração pesa mais
- escala e espacialidade precisam aparecer
- narrativa da obra não pode apagar a infraestrutura

---

## Obras-piloto

### Piloto 1 — `cachoeira`
Motivo:
- já está mais avançada
- é dobradiça genealógica do arquivo
- serve como modelo fundacional

Objetivo desta rodada:
- fechar a página-modelo final do regime A
- consolidar ficha / relações / documentação / navegação
- revisar legendas documentais, especialmente TCC

### Piloto 2 — `mementos`
Motivo:
- regime B puro
- obra de sistema, luz e mecanismo
- hoje a galeria está fraca: 6 captions nulas

Objetivo desta rodada:
- transformar a página em obra-sistema, não galeria muda
- explicitar mecanismo, material, operação
- resolver captions e estrutura mínima da documentação

### Piloto 3 — `oceanvs`
Motivo:
- regime C claro
- co-criação, itinerância e espacialidade fortes
- já tem texto e créditos úteis

Objetivo desta rodada:
- mostrar circulação e adaptação como parte da obra
- destacar colaboração sem virar página institucional
- criar o modelo de exposição imersiva / direção espacial

---

## Stories

### Story 4.1 — Fechar tipologias de obra
Entregas:
- regra visual/comportamental dos 3 regimes
- quais blocos cada regime prioriza
- quais blocos cada regime pode omitir

Saída esperada:
- mini spec por regime

### Story 4.2 — Refinar `cachoeira`
Entregas:
- revisar lead
- revisar painel de dossiê
- revisar bloco de relações públicas
- revisar legendas da galeria
- validar navegação de arquivo

Pendências já conhecidas:
- confirmar imagens 05 e 06 do TCC
- confirmar eventual equipe técnica adicional

### Story 4.3 — Reestruturar `mementos`
Entregas:
- levantar ficha mínima
- reorganizar a página para priorizar sistema/mecanismo
- substituir captions nulas por placeholders editoriais decentes ou preencher com dado real se existir
- explicitar o que falta

### Story 4.4 — Reestruturar `oceanvs`
Entregas:
- enfatizar co-criação
- explicitar circulação SP/BH
- tratar adaptação arquitetônica como parte da obra
- equilibrar narrativa, ficha e colaboração

### Story 4.5 — Normalização editorial do arquivo
Entregas:
- checklist por obra
- listar captions nulas
- listar obras sem ficha expandida
- listar relações públicas relevantes por obra
- marcar obras ainda muito template

---

## Ordem de execução recomendada

1. fechar tipologias
2. refinar `cachoeira`
3. reestruturar `mementos`
4. reestruturar `oceanvs`
5. consolidar checklist das 18 obras

---

## Irregularidades já detectadas

### Gallery captions nulas
- `mementos` → 6/6
- `floresta-utopica` → 6/6
- `amano` → 6/6
- `interludio` → 6/7

### Ficha técnica expandida consolidada
- `cachoeira` = parcialmente consolidada
- demais obras = ainda precisam de camada mais consistente

### Status pendente
- `flama`
- `player1`

### Curadoria ainda ambígua
- `luz-aeterna`
- `amano`

---

## Definição de pronto do epic

O epic termina quando:
- `cachoeira`, `mementos` e `oceanvs` estiverem claramente diferentes entre si
- cada uma delas expressar um regime próprio sem quebrar a tese geral
- existir um checklist concreto para expandir o mesmo raciocínio às outras 15 obras

---

## Fora deste epic

Não entra agora:
- grande redesenho do mapa
- revisão profunda da versão EN
- decisão final sobre `grafo ↗`
- revisão total de todas as 18 obras de uma vez

---

## Próximo gesto operacional

Começar por:
- `Story 4.1` + `Story 4.2`
- isto é: tipologias + `cachoeira`
