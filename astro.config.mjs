import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://felipesztutman.com',
  build: { format: 'directory' },
  integrations: [sitemap({
    i18n: {
      defaultLocale: 'pt-BR',
      locales: { 'pt-BR': 'pt-BR', en: 'en' }
    }
  })]
});
