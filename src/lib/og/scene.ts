// The about page's scene (Landscape `close`) as one standalone SVG, for the link preview cards:
// the real artwork, rendered by Astro (the container API) and put together the way the page's
// CSS lays it out, its window mask included, with the cape in its still pose. The page colours
// its parts through CSS custom properties; a renderer without a browser cannot, so the rules
// below give the same colours as plain values. They mirror the styles of Landscape, SkyBody and
// HeroScarecrow: a change of colour there wants one here too.
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Landscape from '../../components/Landscape.astro';
import { FIGURE_KEYS, paletteOf } from '../hero/palette';
import type { Mood } from '../sky';
import { measure, metrics, textPath } from './text';

let markup: Promise<string> | undefined;

/** The scene in the page's markup (the same for both moods; colours come from CSS). */
function render() {
  markup ??= AstroContainer.create().then((c) => c.renderToString(Landscape, { props: { close: true } }));
  return markup;
}

const hex = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
/** color-mix(in srgb, a p, b). */
const mix = (a: string, b: string, p: number) =>
  '#' +
  hex(a)
    .map((v, i) => Math.round(v * p + hex(b)[i] * (1 - p)).toString(16).padStart(2, '0'))
    .join('');

function styles(mood: Mood) {
  const c = paletteOf(mood);
  const roof = mix(c.trees, '#000000', 0.85);
  const night = mood === 'night';
  return [
    // HeroScarecrow (its generated colour rules, the pupils, the badges)
    ...FIGURE_KEYS.map((k) => `.sc-${k}{fill:${c[k]}}.sc-${k}-s{fill:none;stroke:${c[k]}}`),
    `.sc-pupil{fill:${c.pupil}}`,
    `.badge-enamel{stroke:${c.pin};stroke-width:0.9;stroke-linejoin:round}`,
    `.badge-shine{fill:#fff;opacity:0.22}`,
    `.goal{opacity:0.45;filter:url(#og-goal)}`,
    // SkyBody
    `.disc{fill:${c.sun}}.sky-glow-stop{stop-color:${c.glow}}`,
    `.rays{opacity:${night ? 0 : 1};stroke:${c.sun};stroke-width:5;stroke-linecap:round}`,
    // Landscape
    `.l-wheat-near{stop-color:${c.wheatNear}}.l-sky-low{stop-color:${c.skyLow}}`,
    `.l-field-far{stop-color:${c.fieldFar}}.l-field-near{stop-color:${c.fieldNear}}.l-wheat{stop-color:${c.wheat}}`,
    `.l-hills{fill:${c.hills}}.l-hills-near{fill:${mix(c.hills, c.trees, 0.75)}}.l-trees{fill:${c.trees}}`,
    `.l-row{fill:none;stroke:${c.fieldNear};opacity:0.45}`,
    `.l-texture{fill:none;stroke:${c.wheat};stroke-linecap:round;opacity:0.35}`,
    `.l-stem{fill:none;stroke:${c.wheat};stroke-linecap:round}.l-head{fill:${c.wheat}}`,
    `.l-near{fill:url(#land-stalk)}.l-near-stem{fill:none;stroke:url(#land-stalk);stroke-linecap:round}`,
    `.v-wall{fill:${mix(c.trees, c.hills, 0.6)}}.v-roof{fill:${roof}}`,
    `.v-window{fill:${night ? '#e3b85a' : roof};opacity:${night ? 0.9 : 0.35}}`,
    `.v-smoke{fill:none;stroke:${roof};stroke-width:1.4;stroke-linecap:round;opacity:0.7}`,
  ].join('');
}

/** An <svg> element's content, without its own tag. */
const inner = (svg: string) => svg.replace(/^<svg\b[^>]*>/, '').replace(/<\/svg>$/, '');

/** The badges' codes, from <text> to paths (bold, centred on x, its middle on y). */
function badgeText(svg: string) {
  const { ascent, descent } = metrics(700);
  // dominant-baseline: central, the middle of the em box, as a shift of the baseline (in em).
  const central = (ascent + descent) / (ascent - descent) / 2;
  return svg.replace(/<text\b([^>]*)>\s*([^<]*?)\s*<\/text>/g, (_, attrs: string, code: string) => {
    const num = (name: string) => Number(new RegExp(`\\b${name}="([\\d.]+)"`).exec(attrs)?.[1]);
    const [x, y, size, fit] = [num('x'), num('y'), num('font-size'), num('textLength')];
    const width = measure(code, size, 700, -0.02);
    const d = textPath(code, x - width / 2, y + central * size, size, 700, -0.02);
    const squeeze = fit ? `transform="translate(${x} 0) scale(${(fit / width).toFixed(4)} 1) translate(${-x} 0)" ` : '';
    return `<path ${squeeze}fill="#f7f1e3" d="${d}"/>`;
  });
}

/** The CSS gradient stops of the window mask, as SVG stops (alpha into a luminance mask). */
const stops = (css: string) =>
  [...css.matchAll(/rgb\(0 0 0\/([\d.]+)\) ([\d.]+)%/g)]
    .map(([, a, at]) => `<stop offset="${at}%" stop-color="#fff" stop-opacity="${a}"/>`)
    .join('');

/** The scene, `width` × `height` in its own units, as SVG elements to place in a card. */
export async function scene(mood: Mood) {
  const html = await render();
  // The window's layout, from its inline style (aspect-ratio, --sun-x, --fig-w, --mask, …).
  const style = /class="landscape" style="([^"]*)"/.exec(html)![1];
  const vars = Object.fromEntries(style.split(';').map((d) => [d.slice(0, d.indexOf(':')), d.slice(d.indexOf(':') + 1)]));
  const [W, H] = vars['aspect-ratio'].split('/').map(Number);
  const pct = (name: string, of: number) => (parseFloat(vars[`--${name}`]) / 100) * of;

  const svgs = [...html.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map((m) =>
    m[0]
      .replace(/\s(data-astro-[\w-]+|aria-[\w-]+|role|data-[\w-]+)(="[^"]*")?/g, '')
      .replace(/<a\b[^>]*>/g, '<g>')
      .replace(/<\/a>/g, '</g>'),
  );
  const [back, sky, hero, front] = ['class="layer"', 'class="sky-body"', 'class="hero-scarecrow"', ''].map((cls, i) =>
    cls ? svgs.find((s) => s.startsWith(`<svg ${cls}`))! : svgs[i],
  );

  // The window: two fades multiplied (the page's mask-composite: intersect).
  const mask = vars['--mask'];
  const [radial, linear] = [mask.slice(0, mask.indexOf('),linear-gradient(')), mask.slice(mask.indexOf('linear-gradient('))];
  const [rx, ry, cx, cy] = /radial-gradient\(([\d.]+)% ([\d.]+)% at ([\d.]+)% ([\d.]+)%/.exec(radial)!.slice(1).map(Number);
  const [ex, ey, ox, oy] = [(rx / 100) * W, (ry / 100) * H, (cx / 100) * W, (cy / 100) * H];
  const windowDefs =
    `<radialGradient id="og-win-r" gradientUnits="userSpaceOnUse" cx="${ox}" cy="${oy}" r="${ex}" ` +
    `gradientTransform="translate(${ox} ${oy}) scale(1 ${ey / ex}) translate(${-ox} ${-oy})">${stops(radial)}</radialGradient>` +
    `<linearGradient id="og-win-l" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${H}">${stops(linear)}</linearGradient>` +
    `<mask id="og-win-lm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#og-win-l)"/></mask>` +
    `<mask id="og-win" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#og-win-r)" mask="url(#og-win-lm)"/></mask>` +
    `<filter id="og-goal"><feColorMatrix type="saturate" values="0.15"/></filter>`;

  // The sun's box (rays included) and the figure, placed as the page's CSS does.
  const sunW = pct('sun-w', W);
  const sun = { x: pct('sun-x', W) - sunW / 2, y: pct('sun-y', H) - sunW / 2, w: sunW };
  const figW = pct('fig-w', W);
  const fig = { x: pct('fig-x', W) - figW / 2, y: pct('fig-y', H), w: figW, h: (figW * 204) / 120 };
  const cutAt = parseFloat(/200% ([\d.]+)%/.exec(hero)![1]);
  const cut = 28 + (cutAt / 100) * 204;

  const skyInner = inner(sky).replace(/<stop\b/g, '<stop class="sky-glow-stop"');
  const content =
    `<defs>${windowDefs}</defs>` +
    `<g mask="url(#og-win)"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner(back)}</svg></g>` +
    `<svg x="${sun.x}" y="${sun.y}" width="${sun.w}" height="${sun.w}" viewBox="0 0 140 140" overflow="visible">${skyInner}</svg>` +
    `<svg x="${fig.x}" y="${fig.y}" width="${fig.w}" height="${fig.h}" viewBox="20 28 120 204" overflow="visible">` +
    `<clipPath id="og-cut"><rect x="-1000" y="-1000" width="3000" height="${1000 + cut}"/></clipPath>` +
    `<g clip-path="url(#og-cut)">${badgeText(inner(hero))}</g></svg>` +
    `<g mask="url(#og-win)"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner(front)}</svg></g>`;

  return { width: W, height: H, css: styles(mood), content };
}
