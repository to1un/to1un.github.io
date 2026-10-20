import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'writing'>;

/** Posts newest first. Drafts are only visible in dev. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Dates are UTC midnight from frontmatter, so format in UTC. */
export const formatDate = (date: Date) => date.toISOString().slice(0, 10); // YYYY-MM-DD
export const formatMonth = (date: Date) => date.toISOString().slice(0, 7); // YYYY-MM
