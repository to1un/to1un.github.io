import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/content';
import { site } from '../site';

export async function GET(context: APIContext) {
  if (!context.site) throw new Error('`site` must be set in astro.config.mjs');
  const posts = await getPosts();
  return rss({
    title: site.owner ?? 'Writing',
    description: site.description,
    site: context.site,
    // RSS 2.0 only has a channel-level <language>; per-item language uses Dublin Core.
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
    customData: '<language>en</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      categories: post.data.tags,
      link: `/writing/${post.id}/`,
      // The author by name (RSS 2.0's own <author> wants an email address).
      customData: `<dc:language>${post.data.lang}</dc:language>${site.owner ? `<dc:creator>${site.owner}</dc:creator>` : ''}`,
    })),
  });
}
