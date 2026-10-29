// A link preview card (og:image), 1200 × 630: the title large on the left, a small muted line
// under it, and the about page's scene on the right, its window fading into the page colour.
// Day or night like the site; the text is paths and the renderer (resvg) loads no system fonts,
// so a card comes out the same on any build machine.
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { skyTokens, type Mood } from '../sky';
import { scene } from './scene';
import { metrics, textPath, wrap } from './text';

export const CARD = { width: 1200, height: 630 };

const PAD = 80; // left margin of the text
const TEXT_W = 560; // the text column, clear of the scene
const SIZES = [64, 56, 48]; // title sizes, largest first, to fit in at most three lines
const LEADING = 1.18;
const SCENE = { scale: 1, right: 24, top: 12 }; // the scene's place on the right

interface Options {
  title: string;
  line: string; // the small line under the title
  mood: Mood;
}

/** The title in lines: the largest size that fits in three, else the smallest, its last line cut. */
function fit(title: string) {
  for (const size of SIZES) {
    const lines = wrap(title, TEXT_W, size, 600);
    if (lines.length <= 3) return { size, lines };
  }
  const size = SIZES.at(-1)!;
  const lines = wrap(title, TEXT_W, size, 600).slice(0, 3);
  lines[2] = `${lines[2].replace(/[\s,.:;-]+$/, '')}…`;
  return { size, lines };
}

export async function card({ title, line, mood }: Options) {
  const { bg, fg, muted } = skyTokens(mood);
  const s = await scene(mood);
  const w = s.width * SCENE.scale;
  const sceneAt = `translate(${CARD.width - w - SCENE.right} ${SCENE.top}) scale(${SCENE.scale})`;

  // The text block, centred on the card's height.
  const { size, lines } = fit(title);
  const small = 30;
  const gap = 26; // between the title and the line
  const { ascent, descent } = metrics(600);
  const lineH = size * LEADING;
  const blockH = lineH * (lines.length - 1) + (ascent - descent) * size + gap + small;
  const top = (CARD.height - blockH) / 2;
  const titlePaths = lines.map((l, i) => textPath(l, PAD, top + ascent * size + i * lineH, size, 600)).join('');
  const linePath = textPath(line, PAD, top + blockH - small * 0.22, small, 400);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.width}" height="${CARD.height}" viewBox="0 0 ${CARD.width} ${CARD.height}">` +
    `<style>${s.css}</style>` +
    `<rect width="100%" height="100%" fill="${bg}"/>` +
    `<g transform="${sceneAt}">${s.content}</g>` +
    `<path fill="${fg}" d="${titlePaths}"/>` +
    `<path fill="${muted}" d="${linePath}"/>` +
    `</svg>`;

  const png = new Resvg(svg, { font: { loadSystemFonts: false }, fitTo: { mode: 'original' } }).render().asPng();
  // resvg writes the PNG with light compression and an alpha channel: the same pixels, opaque and
  // packed tighter, take far less room.
  return new Uint8Array(await sharp(png).removeAlpha().png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer());
}
