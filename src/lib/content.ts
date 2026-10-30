import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'writing'>;

/** Posts newest first. Drafts are only visible in dev. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** A project as the projects page shows it. */
export interface ProjectView {
  name: string;
  tagline?: string;
  status: 'active' | 'upcoming' | 'archived';
  secret?: true; // not announced: the name is a stand-in for screen readers, the mark a silhouette
  href?: string; // the post about it
  repo?: string; // its repository, on any host
  logo?: { bg: string; mono: string } | { bg: string; icon: ImageMetadata }; // a tile with letters, or with an icon
}

/** Projects newest first, the upcoming ones last and the unannounced ones after them. */
export async function getProjects(): Promise<ProjectView[]> {
  const rank = (p: ProjectView) => Number(p.status === 'upcoming') + Number(Boolean(p.secret));
  return (await getCollection('projects'))
    .sort((a, b) => ('year' in b.data ? b.data.year : 0) - ('year' in a.data ? a.data.year : 0))
    .map(({ data }): ProjectView =>
      data.secret
        ? { name: 'An unannounced project', status: 'upcoming', secret: true }
        : {
            name: data.name,
            tagline: data.tagline,
            status: data.status,
            href: data.post && `/writing/${data.post.id}/`,
            repo: data.repo,
            logo: data.logo,
          },
    )
    .sort((a, b) => rank(a) - rank(b));
}

/** Dates are UTC midnight from frontmatter, so format in UTC. */
export const formatDate = (date: Date) => date.toISOString().slice(0, 10); // YYYY-MM-DD
export const formatMonth = (date: Date) => date.toISOString().slice(0, 7); // YYYY-MM
