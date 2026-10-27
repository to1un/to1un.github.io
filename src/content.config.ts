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
        // An image, or a coloured tile with a monogram of one or two letters.
        logo: z.union([image(), z.object({ mono: z.string().min(1).max(2), bg: z.string() })]),
        tagline: z.string().optional(),
        // The project links to the post about it, else to its url (GitHub or its site); with both,
        // the url shows as a small secondary link. Either, both or neither.
        post: reference('writing').optional(),
        url: z.url().optional(),
        // Not shown; newer projects are listed first.
        year: z.number().int(),
        // upcoming: on its way, shown dimmed and last.
        status: z.enum(['active', 'upcoming', 'archived']),
        secret: z.literal(false).optional(),
      }),
      // Not announced yet: shown last as a shadowed pin, nothing else. The name only tells the
      // file apart and never reaches the site.
      z.strictObject({ name: z.string(), secret: z.literal(true) }),
    ]),
});

export const collections = { writing, projects };
