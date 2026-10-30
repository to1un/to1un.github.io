// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The only place the site URL lives.
const SITE = 'https://to1un.com';

export default defineConfig({
  site: SITE,
  server: { port: 4322 },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      // The "default" GitHub themes: their code colours reach 4.5:1 on their own background,
      // where github-light / github-dark miss it (comments, variables). The sky picks one (global.css).
      themes: { light: 'github-light-default', dark: 'github-dark-default' },
    },
  },
});
