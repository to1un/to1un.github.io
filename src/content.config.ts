import { defineCollection } from 'astro:content';
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

export const collections = { writing };
