import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const writing = defineCollection({
  // One folder per post (`<slug>/index.md`) with its images next to it; the id is the folder name.
  loader: glob({ base: './src/content/writing', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      // Tags become URL segments (/writing/tags/<tag>/), so keep them slug-safe.
      tags: z.array(z.string().regex(/^[a-z0-9-]+$/, 'tags must be lowercase-kebab-case')).default([]),
      draft: z.boolean().default(false),
      // Pinned posts are listed first on the homepage and /writing/.
      pinned: z.boolean().default(false),
      // Language of the body; the site chrome stays English. Keep in sync with `Lang` in src/site.ts.
      lang: z.enum(['en', 'tr']).default('en'),
      // Optional cover image, relative to the entry file; shown above the body.
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{yaml,yml}' }),
  schema: ({ image }) =>
    z.union([
      z.object({
        name: z.string(),
        // The mark (src/lib/mark.ts): a tile in the colour `bg` with one or two letters (the standard,
        // and a placeholder until the project has a real icon), or with the project's own icon (an SVG
        // next to the file, drawn for the 48px tile).
        logo: z.union([
          z.strictObject({ mono: z.string().regex(/^\p{L}{1,2}$/u, 'mono is one or two letters'), bg: z.string() }),
          z.strictObject({ icon: image(), bg: z.string() }),
        ]),
        tagline: z.string().optional(),
        // Its name links to the post about it, else to its website, else to its repo. The website and
        // the repo also show as small icons beside the name: the site by its own favicon (a local
        // copy next to the file, SVG or PNG; never hotlinked), else an arrow, the repo by the GitHub
        // mark. Any of them, or none.
        post: reference('writing').optional(),
        url: z.url().optional(),
        favicon: image().optional(),
        repo: z.url({ hostname: /^github\.com$/, error: 'repo is a github.com URL' }).optional(),
        // Not shown; newer projects are listed first.
        year: z.number().int(),
        // upcoming: on its way, shown dimmed and last.
        status: z.enum(['active', 'upcoming', 'archived']),
        secret: z.literal(false).optional(),
      }).refine((p) => !p.favicon || p.url, { message: 'a favicon needs the url of its site', path: ['favicon'] }),
      // Not announced yet: shown last as a shadowed mark, nothing else. The name only tells the
      // file apart and never reaches the site.
      z.strictObject({ name: z.string(), secret: z.literal(true) }),
    ]),
});

export const collections = { writing, projects };
