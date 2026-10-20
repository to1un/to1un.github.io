// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Placeholder until a domain is chosen. The only place the site URL lives.
const SITE = 'https://to1un.example';

export default defineConfig({
  site: SITE,
  server: { port: 4322 },
  integrations: [sitemap()],
});
