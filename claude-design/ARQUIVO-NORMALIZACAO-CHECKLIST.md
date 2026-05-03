# Arquivo — normalização editorial

Data: 2026-04-29
Status: após Stories 4.1–4.4

## Síntese

Três obras já saíram do template único:
- `cachoeira` → regime A
- `mementos` → regime B
- `oceanvs` → regime C

O próximo trabalho não é mudar a tese.
É **normalizar o resto do arquivo** para que a diferença entre obras continue crescendo sem desorganizar o sistema.

---

## Prioridade imediata

### P1 — problemas visíveis e objetivos

#### `interludio`
- regime: **B**
- problema: **6/7 captions nulas**
- falta:
  - `lead`
  - `archiveNote`
  - `mechanism`
  - `fichaTecnica`
- motivo da prioridade:
  - par direto de `mementos`
  - hoje perde força por falta de documentação mínima

#### `floresta-utopica`
- regime: **C**
- problema: **6/6 captions nulas**
- falta:
  - `lead`
  - `archiveNote`
  - `circulation` ou equivalente estrutural
  - `fichaTecnica`
- motivo da prioridade:
  - ligação forte com `cachoeira`
  - obra-chave do argumento “tornar visível o invisível”

#### `amano`
- regime: **C**
- problema: **6/6 captions nulas**
- falta:
  - `lead`
  - `archiveNote`
  - `circulation`
  - `collaborationNote`
  - `fichaTecnica`
- motivo da prioridade:
  - obra de circulação institucional intensa
  - ainda muito genérica para o peso que tem

---

## Prioridade média

#### `metadata`
- regime: **B**
- captions: ok
- falta:
  - `lead`
  - `mechanism`
  - `fichaTecnica`
- observação:
  - boa candidata para consolidar subgrupo sistema/dados

#### `o-que-nos-une`
- regime: **B**
- captions: ok
- falta:
  - `lead`
  - `mechanism`
  - `fichaTecnica`
- observação:
  - precisa evidenciar melhor corpo/sensor/sincronização

#### `andromeda`
- regime: **C**
- captions: ok
- falta:
  - `lead`
  - `circulation` ou bloco espacial equivalente
  - `fichaTecnica`
- observação:
  - ainda corre risco de parecer obra imersiva genérica

#### `luz-aeterna`
- regime: **C**
- captions: ok
- falta:
  - `lead`
  - `circulation`
  - `fichaTecnica`
- pendência curatorial:
  - decidir se permanece em `obras`

---

## Prioridade de consolidação do bloco fundacional

#### `objeto-em-forma-de-espaco`
- regime: **A**
- captions: ok
- falta:
  - `lead`
  - `archiveNote`
  - `fichaTecnica`
- observação:
  - peça inaugural do arquivo; merece dossiê melhor

#### `canvas13`
- regime: **A**
- captions: ok
- falta:
  - `lead`
  - `archiveNote`
  - `fichaTecnica`

#### `corrego-rio-verde`
- regime: **A**
- captions: ok
- falta:
  - `lead`
  - `fichaTecnica`

#### `mantiqueira`
- regime: **A**
- captions: ok
- falta:
  - `lead`
  - `archiveNote`
  - `fichaTecnica`

#### `occupycopan`
- regime: **A**
- problema: **sem galeria atual**
- falta:
  - `lead`
  - `fichaTecnica`
  - documentação visual, se existir

---

## Obras com status ou enquadramento ainda sensíveis

#### `flama`
- regime: **B**
- status: `A_CONFIRMAR`
- problema: sem galeria atual
- falta:
  - confirmação factual final
  - `lead`
  - `mechanism`
  - `fichaTecnica`

#### `player1`
- regime: **B**
- status: `A_CONFIRMAR`
- problema: sem galeria atual
- falta:
  - confirmação factual final
  - `lead`
  - `mechanism`
  - `fichaTecnica`

---

## Obras já estabilizadas nesta rodada

### `cachoeira`
- regime A implantado
- `lead` ok
- `archiveNote` ok
- legenda de TCC corrigida para reprodução de arquivo
- ainda falta:
  - crédito exato das reproduções do TCC
  - eventual equipe técnica adicional

### `mementos`
- regime B implantado
- `mechanism` ok
- `archiveNote` ok
- captions mínimas ok
- ainda falta:
  - crédito fotográfico específico
  - ficha expandida mais precisa

### `oceanvs`
- regime C implantado
- `circulation` ok
- `collaborationNote` ok
- captions mínimas ok
- ainda falta:
  - ficha expandida mais precisa
  - crédito fotográfico específico

---

## Padrão mínimo por obra daqui em diante

Cada obra deve caminhar para ter:
- `lead`
- `fichaTecnica` mínima
- bloco específico do regime:
  - A → `archiveNote`
  - B → `mechanism`
  - C → `circulation` / `collaborationNote`
- galeria sem captions nulas
- `todo` explícito em `works.json` quando houver lacuna real

---

## Ordem recomendada de execução

1. `interludio`
2. `floresta-utopica`
3. `amano`
4. `metadata`
5. `o-que-nos-une`
6. `objeto-em-forma-de-espaco`
7. `mantiqueira`
8. `corrego-rio-verde`
9. `canvas13`
10. decidir `flama` / `player1`

---

## Definição de pronto da normalização

O arquivo estará suficientemente normalizado quando:
- não houver captions nulas nas obras publicadas com galeria
- cada obra tiver pelo menos um bloco coerente com seu regime
- as obras sensíveis tiverem status claro ou marcação de pendência explícita
- o restante do arquivo não depender mais de uma única página-modelo
