# felipesztutman.com

Contexto operacional e editorial do site público de Felipe Sztutman.

## Resumo executivo

- **Domínio de produção:** https://felipesztutman.com
- **URL Cloudflare Pages:** https://felipe-sztutman.pages.dev
- **Hosting:** Cloudflare Pages
- **Deploy:** GitHub Actions + Wrangler
- **Repo canônico:** `/home/aya/lastro/Documents/artista/felipesztutman-astro`
- **Repo histórico / fonte de contexto:** `/home/aya/lastro/Documents/artista/felipesztutman.com`
- **Data desta documentação:** 2026-04-29

## O que está no ar hoje

O domínio principal está servindo o **site novo em Astro**, não apenas o grafo antigo.

### Rotas confirmadas online

- `/` → home editorial do artista
- `/mapa` → mapa interativo novo em Astro
- `/en/` → versão em inglês
- `/grafo` → grafo legacy
- `/grafo.html` → redireciona para `/grafo`
- `/robots.txt`
- `/sitemap-index.xml`

### Sinais visíveis da produção atual

A home online contém:
- título `Felipe Sztutman — Artista, Sistemas Imersivos, São Paulo`
- navegação com `mapa`, `obras`, `escritos`, `publicações`, `trajetória`, `sobre`, `contato`, `grafo ↗`, `EN`
- SEO, canonical, alternate langs e schema.org

## Onde e como é publicado

### Infra real

- **Plataforma:** Cloudflare Pages
- **Project name:** `felipe-sztutman`
- **Domínio customizado:** `felipesztutman.com`
- **Projeto Pages ativo:** `https://felipe-sztutman.pages.dev`

### Evidências verificadas em 2026-04-29

- `felipesztutman.com` responde via Cloudflare
- `felipe-sztutman.pages.dev` responde via Cloudflare Pages
- `dig felipesztutman.com` retorna IPs Cloudflare:
  - `104.21.37.232`
  - `172.67.214.175`
- `/mapa` em produção e em `pages.dev` retornam o mesmo hash de conteúdo
- o root em produção e `pages.dev` têm mesmo título e mesma estrutura geral

## Deploy

### Pipeline

Arquivo:
- `.github/workflows/deploy.yml`

Fluxo:
1. push em `main`
2. GitHub Actions roda `npm ci`
3. GitHub Actions roda `npx astro build`
4. GitHub Actions roda:
   `npx wrangler pages deploy dist --project-name felipe-sztutman --branch main`

### Workflow atual

```yaml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npx astro build
      - name: Deploy to Cloudflare Pages
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: dcbe51427f4fd62c6207985cc3951c85
        run: npx wrangler pages deploy dist --project-name felipe-sztutman --branch main
```

## Repositórios e papéis

### 1) Repo canônico atual

**Path:** `/home/aya/lastro/Documents/artista/felipesztutman-astro`

É a base real do site publicado.

Contém:
- home editorial
- páginas de obras
- escritos
- publicações
- trajetória
- sobre
- versão em inglês
- mapa interativo em Astro
- `public/grafo.html` como peça legacy publicada junto

### 2) Repo / pasta histórica

**Path:** `/home/aya/lastro/Documents/artista/felipesztutman.com`

Papel:
- arquivo histórico
- fonte de inventário
- contexto do grafo original
- textos e esboços anteriores

Não deve ser tratado como base principal de deploy atual.

## Estrutura editorial atual

### PT
- 18 obras
- 4 escritos
- 1 publicação
- páginas top-level: `/`, `/mapa`, `/publicacoes`, `/trajetoria`, `/sobre`

### EN
- 18 obras
- 4 escritos
- 1 publicação
- páginas top-level: `/en/`, `/en/publicacoes`, `/en/trajetoria`, `/en/sobre`

### Superfícies especiais
- `/mapa` → mapa novo, integrado ao corpus atual
- `/grafo` → grafo antigo, mantido como camada legacy

## Stack atual

- **Astro 6**
- `@astrojs/sitemap`
- páginas em `.astro` e `.md`
- assets estáticos em `public/`
- mapa com `src/pages/mapa.astro` + `src/scripts/mapa-engine.js`

### Arquivos-chave

- `astro.config.mjs`
- `package.json`
- `.github/workflows/deploy.yml`
- `src/layouts/Base.astro`
- `src/pages/index.astro`
- `src/pages/mapa.astro`
- `src/data/mapa.json`
- `src/data/gallery.json`
- `public/grafo.html`

## Relação entre mapa e grafo

### `/mapa`
É o mapa novo do site atual, renderizado pelo projeto Astro.

### `/grafo`
É o grafo legacy publicado como arquivo estático. Continua no ar e é acessível pelo header via `grafo ↗`.

### Regra prática
- evolução principal do site → **Astro**
- preservação / referência do grafo antigo → **`public/grafo.html`**

## Git

Remote atual:

```bash
git@github.com:sztlink/felipesztutman.com.git
```

Branch principal:
- `main`

## Como revalidar rapidamente o estado online

### HTTP headers

```bash
curl -I -L https://felipesztutman.com
curl -I -L https://felipesztutman.com/mapa
curl -I -L https://felipesztutman.com/grafo.html
curl -I -L https://felipesztutman.com/en/
curl -I -L https://felipe-sztutman.pages.dev
```

### DNS

```bash
dig +short felipesztutman.com
dig +short www.felipesztutman.com
```

### Conteúdo servido

```bash
curl -L -s https://felipesztutman.com | head -n 40
curl -L -s https://felipesztutman.com/mapa | head -n 40
curl -L -s https://felipesztutman.com/robots.txt
curl -L -s https://felipesztutman.com/sitemap-index.xml
```

### Comparar produção vs Pages

```bash
curl -L -s https://felipesztutman.com | rg -o '<title>[^<]+' -m1
curl -L -s https://felipe-sztutman.pages.dev | rg -o '<title>[^<]+' -m1
```

## Observações importantes

### Build local pode falhar por dependência opcional do Rollup
Se aparecer erro como:
- `Cannot find module @rollup/rollup-linux-x64-gnu`

isso tende a ser problema local de `node_modules`, não necessariamente do site em produção.

### `public/grafo.html` pode aparecer modificado sem mudança real
Em inspeção anterior, `git diff -w` não mostrava diferença substantiva. Suspeita: line endings / whitespace.

### `robots.txt`
O domínio está servindo um `robots.txt` com bloco **Cloudflare Managed Content** e sitemap declarado em:
- `https://felipesztutman.com/sitemap-index.xml`

## Procedimento de recuperação de contexto

Se alguém perguntar “como o site do Felipe está publicado?” ou “qual repo manda em produção?” a resposta curta é:

1. o site público está em **Cloudflare Pages**
2. o projeto Pages se chama **`felipe-sztutman`**
3. o repo canônico é **`felipesztutman-astro`**
4. o domínio **`felipesztutman.com`** aponta para essa publicação
5. o **grafo antigo ainda está no ar** em `/grafo`
6. o diretório `felipesztutman.com` antigo é **arquivo/contexto**, não a base principal de deploy

## Comando mental rápido

**produção = Cloudflare Pages**
**fonte = felipesztutman-astro**
**legacy = /grafo + pasta felipesztutman.com antiga**
