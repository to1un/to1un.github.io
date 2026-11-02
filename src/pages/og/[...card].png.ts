// Link preview cards (og:image, src/lib/og/card.ts): one per post, one for the rest of the site,
// in the mood chosen in src/site.ts.
import type { APIRoute, GetStaticPaths } from 'astro';
import { card } from '../../lib/og/card';
import { getPosts } from '../../lib/content';
import { site } from '../../site';

export const getStaticPaths = (async () => {
  const cards = [
    { card: 'site', title: site.owner ?? 'Home', line: 'Technical notes and writeups' },
    ...(await getPosts()).map((post) => ({
      card: `writing/${post.id}`,
      title: post.data.title,
      line: [site.owner, 'Writing'].filter(Boolean).join(' · '),
    })),
  ];
  return cards.map(({ card, ...props }) => ({ params: { card }, props: { ...props, mood: site.preview } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(await card(props as Parameters<typeof card>[0]), { headers: { 'Content-Type': 'image/png' } });
