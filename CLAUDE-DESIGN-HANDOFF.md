# Claude Design Handoff — felipesztutman.com

Data: 2026-04-29

## Objetivo

Refinar a superfície pública de `felipesztutman.com` sem desmontar sua arquitetura atual.

O site já está no ar e funciona. O problema principal **não é estrutural/técnico** — é de **lapidação formal**. Hoje a experiência ainda tem cara de protótipo cru / vibe coding: hierarquia tímida, tipografia genérica, pouca tensão entre imagem e texto, ritmo visual pouco autoral e pouca diferença de linguagem entre páginas.

Queremos:
- manter a solidez e a clareza do site atual
- preservar a arquitetura de informação existente
- elevar o projeto para uma presença **mais autoral, editorial e institucional**
- evitar linguagem visual de startup, agência ou template premium genérico

---

## O que o site é

`felipesztutman.com` é o site público de Felipe Sztutman como artista.

Não é:
- site da AYA
- portfólio de agência
- landing page de produto
- vitrine de serviços

É:
- presença autoral
- arquivo vivo de obras
- superfície editorial
- ponto de contato institucional
- membrana entre obra, pensamento, trajetória e documentação

Eixo conceitual central:
- **tornar visível o invisível**
- luz, espaço, sistemas, percepção, imersão
- ambientes que só existem plenamente quando alguém entra

---

## Arquitetura atual que deve ser preservada

### Rotas principais
- `/` — home
- `/mapa` — mapa interativo
- `/obras/[slug]` — páginas de obra
- `/escritos/[slug]` — páginas de texto
- `/publicacoes`
- `/trajetoria`
- `/sobre`
- `/en/...` — espelho em inglês
- `/grafo` — superfície legacy separada

### Estrutura de conteúdo
- home editorial
- páginas individuais de obras
- páginas individuais de escritos
- publicação
- trajetória
- sobre
- versão em inglês
- mapa como peça especial

### O que NÃO deve ser quebrado
- arquitetura geral de rotas
- existência do mapa como superfície própria
- bilinguismo PT/EN
- páginas por obra e por escrito
- legibilidade do conteúdo textual
- possibilidade de crescimento futuro por arquivo/editorial

### O que PODE mudar
- layout
- tipografia
- escala e ritmo da home
- hierarquia visual
- grid
- proporções
- relação imagem/texto
- navegação visual
- espaçamento
- tratamento dos listados
- peso institucional / peso autoral

---

## Stack e contexto técnico

### Stack real
- Astro 6
- páginas em `.astro` e `.md`
- `Base.astro` como layout principal
- `Obra.astro` e `Escrito.astro` como layouts de conteúdo
- `mapa.astro` como experiência especial
- `public/grafo.html` como peça legacy

### Observação importante
Não estamos pedindo redesign que exija reinvenção completa de stack.
A preferência é por uma direção que **encaixe bem na implementação existente**.

Isto é: pensar como um redesign sério e sofisticado, **não como conceito impossível de sustentar**.

---

## Diagnóstico honesto da superfície atual

### Qualidades já existentes
- arquitetura clara
- conteúdo forte
- conceito consistente
- bom material de obras
- mapa interessante como diferencial
- tom sóbrio
- site já funcional e publicável

### Problemas percebidos
- aparência ainda crua demais
- dark minimalismo ainda genérico
- pouca assinatura tipográfica
- home com pouca tensão e pouca respiração dramática
- relação entre texto e obra ainda burocrática
- listagens lembram mais protótipo funcional do que presença pública madura
- páginas compartilham uma linguagem visual pouco diferenciada
- o peso da obra ainda não aparece com a força que deveria
- parece mais “site correto” do que “site inevitável”

### Risco a evitar
Na tentativa de sofisticar, **não cair em**:
- startup premium
- dashboard aesthetic
- brutalismo clichê
- interações excessivas
- motion decorativo
- visual de agência tech
- portfólio Behance refinado
- template editorial luxuoso demais sem corpo autoral

---

## Direção desejada

Queremos uma linguagem entre estes polos:

### Sim
- editorial contemporâneo
- arquivo de artista
- instituição cultural discreta
- presença autoral madura
- sobriedade com rigor
- imagem com escala
- tipografia com caráter
- ritmo espacial
- sensação de obra, não de template
- silêncio visual
- inteligência formal

### Não
- SaaS
- agência criativa
- estúdio de branding
- startup de IA
- visual “futurista” óbvio
- excesso de gradiente, glow, glass, cards, pills
- abundância de microinterações
- sentimentalismo visual

---

## Referências conceituais de linguagem

Usar como eixo, não para copiar literalmente:
- Olafur Eliasson — arquivo, publicação, peso institucional, pesquisa
- Ryoji Ikeda — rigor, secura, clareza extrema
- NONOTAK — contenção e força visual
- Raquel Kogan — grade limpa e direta
- James Turrell / Es Devlin como referências de maturidade autoral/institucional

Importante:
- não assumir linguagem de estúdio comercial
- não estetizar “arte e tecnologia” de forma clichê
- evitar visual cyber/AI/genérico

---

## O que priorizar no redesign

### 1. Home
A home precisa virar uma superfície realmente memorável.

Ela deve:
- apresentar Felipe como artista com clareza
- equilibrar statement, obras e arquivo
- ter um ritmo mais espacial
- parecer menos lista funcional e mais construção autoral
- criar uma entrada forte sem cair em hero de startup

### 2. Páginas de obra
Precisam ganhar:
- mais peso visual
- melhor hierarquia entre título / meta / imagem / texto / ficha
- sensação de documentação séria de obra
- relação mais precisa entre imagens e texto

### 3. Páginas de escritos
Precisam parecer:
- mais editoriais
- mais legíveis
- mais deliberadas
- menos “markdown bem arrumado”

### 4. Listagens
Obras, escritos e publicações devem parecer curadoria, não dump.

### 5. Navegação
Precisa continuar simples, mas menos provisória.

---

## Restrições formais

- sem visual de produto
- sem componente ornamental demais
- sem “cards” por default para tudo
- sem interface fofa
- sem iconografia excessiva
- sem gimmicks de IA
- sem hero genérico com CTA central de marketing
- sem dark mode “neon tech”
- sem tentar transformar tudo em experiência imersiva no navegador

---

## Entregáveis desejados do Claude Design

### Fase 1 — diagnóstico e direções
Pedir primeiro:
1. diagnóstico da superfície atual
2. 3 direções visuais distintas
3. para cada direção:
   - lógica conceitual
   - sistema tipográfico
   - comportamento de grid
   - ritmo de espaçamento
   - tratamento de imagem
   - tratamento de navegação
   - riscos
4. **não gerar código ainda**

### Fase 2 — escolha de uma direção
Depois de escolher uma direção:
1. detalhar a nova home
2. detalhar obra page
3. detalhar escrito page
4. detalhar list pages
5. propor sistema visual mínimo coerente

### Fase 3 — handoff para implementação
Só no final:
- especificações visuais
- grid
- tipografia
- escalas
- espaçamentos
- comportamento responsivo
- notas de implementação para Astro

---

## O que enviar para Claude Design

### Enviar
- screenshots da home atual
- screenshot de `/mapa`
- screenshot de 1 página de obra
- screenshot de 1 página de escrito
- screenshot de `/sobre`
- este documento
- opcional: 2–4 referências externas bem escolhidas

### Não enviar
- repo inteiro
- dezenas de páginas
- dump de arquivos
- benchmark excessivo
- tudo de uma vez

Se for apontar código, apontar só para o mínimo:
- `src/layouts/Base.astro`
- `src/pages/index.astro`
- `src/layouts/Obra.astro`
- `src/layouts/Escrito.astro`
- `src/pages/mapa.astro`

---

## Prompt recomendado — Fase 1

```txt
Você está revisando o site público de um artista contemporâneo brasileiro de arte, tecnologia, luz, espaço e sistemas imersivos.

O site é felipesztutman.com.

Objetivo:
refinar a superfície pública do artista sem desmontar a arquitetura atual. O site já está no ar e funciona, mas ainda parece cru, com cara de protótipo/vibe coding. O problema principal não é técnico, é formal: hierarquia, ritmo, tipografia, relação entre imagem e texto, densidade autoral e presença institucional.

O site NÃO é:
- site de estúdio comercial
- landing page de startup
- vitrine de serviços
- produto SaaS

O site É:
- presença autoral
- arquivo vivo de obras
- superfície editorial
- ponto de contato institucional
- membrana entre obra, pensamento, trajetória e documentação

Conceitos centrais:
- tornar visível o invisível
- luz, espaço, sistemas, percepção, imersão
- ambientes que só existem plenamente quando alguém entra

Arquitetura que deve ser preservada:
- home
- mapa
- páginas de obra
- páginas de escritos
- publicações
- trajetória
- sobre
- versão em inglês
- grafo legacy como superfície separada

O que pode mudar:
- layout
- grid
- tipografia
- escala
- ritmo
- relação imagem/texto
- navegação visual
- tratamento de listagens

O que evitar:
- visual de startup
- agência tech
- brutalismo clichê
- excesso de motion
- excesso de efeitos
- UI decorativa
- estética genérica de “arte e tecnologia”

Referências de linguagem (como eixo, não para copiar):
- Olafur Eliasson
- Ryoji Ikeda
- NONOTAK
- Raquel Kogan
- James Turrell
- Es Devlin

Tarefa:
1. diagnostique os principais problemas da superfície atual
2. proponha 3 direções visuais distintas
3. para cada direção, descreva:
   - lógica conceitual
   - sistema tipográfico
   - grid
   - ritmo de espaçamento
   - relação entre imagem e texto
   - linguagem de navegação
   - riscos
4. diga qual direção você recomendaria
5. não gere código ainda
6. seja preciso, econômico e crítico
```

---

## Prompt recomendado — Fase 2

```txt
Desenvolva a direção [ESCOLHIDA].

Quero um handoff de design para implementação no site atual em Astro.

Detalhe:
1. home
2. página de obra
3. página de escrito
4. páginas de listagem
5. navegação
6. sistema tipográfico
7. paleta
8. escala de espaçamento
9. princípios responsivos

Restrições:
- manter a arquitetura atual
- não exigir mudança radical de stack
- evitar componentes desnecessários
- preservar legibilidade
- resultado deve parecer artista contemporâneo maduro, não template bonito

Não escreva código ainda.
Primeiro entregue a especificação visual e estrutural em linguagem clara, implementável e hierarquizada.
```

---

## Prompt recomendado — Fase 3

```txt
Agora traduza a direção aprovada em um handoff implementável para Astro.

Quero:
- estrutura por página
- hierarchy map
- tokens tipográficos
- tokens de espaçamento
- regras de imagem
- navegação desktop/mobile
- notas de acessibilidade
- notas de implementação progressiva

Não reinventar a arquitetura atual.
Trabalhar como redesign sofisticado sobre base existente.
```

---

## Critério de sucesso

O redesign será bem-sucedido se:
- o site continuar simples
- mas deixar de parecer provisório
- ganhar densidade autoral
- parecer mais inevitável, mais maduro, mais preciso
- sustentar melhor a obra de Felipe no espaço público
- respeitar a arquitetura existente sem parecer refém dela

---

## Resumo curto para abrir a conversa

Se precisar de uma versão ainda mais curta:

```txt
Quero elevar felipesztutman.com de um site funcional e cru para uma presença autoral, editorial e institucional mais madura.

Preservar a arquitetura atual (home, mapa, obras, escritos, sobre, trajetória, publicações, EN/PT), mas refinar profundamente layout, tipografia, grid, ritmo, hierarquia e relação imagem/texto.

Evitar linguagem de startup, agência ou template tech. Buscar uma sobriedade autoral entre arquivo de artista, publicação contemporânea e presença institucional discreta.

Primeiro: diagnóstico + 3 direções. Sem código ainda.
```
