import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// Entradas do diário só entram no sitemap com index: true no frontmatter.
const diarioDir = new URL('./src/pages/diario/', import.meta.url);
const diarioIndexado = new Set(
  readdirSync(diarioDir)
    .filter((f) => f.endsWith('.md'))
    .filter((f) => /^index:\s*true\s*$/m.test(readFileSync(new URL(f, diarioDir), 'utf8').split('---')[1] || ''))
    .map((f) => f.replace(/\.md$/, ''))
);

export default defineConfig({
  site: 'https://felipesztutman.com',
  build: { format: 'directory' },
  trailingSlash: 'always',
  integrations: [sitemap({
    filter: (page) => {
      const m = page.match(/\/diario\/([^/]+)\/?$/);
      return !m || diarioIndexado.has(m[1]);
    },
    i18n: {
      defaultLocale: 'pt-BR',
      locales: { 'pt-BR': 'pt-BR', en: 'en' }
    },
    // x-default aponta para a versão em português de cada par traduzido.
    serialize(item) {
      const links = item.links || [];
      const pt = links.find((l) => l.lang === 'pt-BR');
      if (pt && links.length > 1 && !links.some((l) => l.lang === 'x-default')) {
        item.links = [...links, { lang: 'x-default', url: pt.url }];
      }
      return item;
    }
  })]
});
