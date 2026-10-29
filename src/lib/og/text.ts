// Text for the link preview cards, set in Noto Sans (@fontsource, the face the site's system sans
// shows on the owner's machine) and turned into SVG paths, so a card renders the same on any build
// machine, without system fonts. Each weight comes as two files, latin and latin-ext (ğ, ş, ı, İ):
// a character takes its glyph from the first file that has it.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import opentype, { type Font, type PathCommand } from 'opentype.js';

export type Weight = 400 | 600 | 700;

const require = createRequire(import.meta.url);
const faces = new Map<Weight, Font[]>();

function fonts(weight: Weight): Font[] {
  let list = faces.get(weight);
  if (!list) {
    list = ['latin', 'latin-ext'].map((subset) => {
      const file = require.resolve(`@fontsource/noto-sans/files/noto-sans-${subset}-${weight}-normal.woff`);
      const buf = readFileSync(file);
      return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    });
    faces.set(weight, list);
  }
  return list;
}

/** Runs of text that share one font file. */
function runs(text: string, weight: Weight) {
  const list = fonts(weight);
  const out: { font: Font; text: string }[] = [];
  for (const ch of text) {
    const font = list.find((f) => f.charToGlyphIndex(ch) > 0) ?? list[0];
    const last = out.at(-1);
    if (last?.font === font) last.text += ch;
    else out.push({ font, text: ch });
  }
  return out;
}

/** Pieces to set one at a time: whole runs (kerned), or single characters when tracked
 *  (opentype.js 2.0.0 gives NaN coordinates with its letterSpacing option). */
function pieces(text: string, weight: Weight, tracking: number) {
  const list = runs(text, weight);
  return tracking ? list.flatMap((r) => [...r.text].map((ch) => ({ font: r.font, text: ch }))) : list;
}

/** Width of `text` at `size` px; `tracking` is extra space after each letter, in em. */
export function measure(text: string, size: number, weight: Weight, tracking = 0) {
  return pieces(text, weight, tracking).reduce((w, p) => w + p.font.getAdvanceWidth(p.text, size) + tracking * size, 0);
}

/** Glyph outlines as SVG path data, to two decimals. Written here, as opentype.js 2.0.0's own
 *  toPathData writes NaN for a coordinate a hair off a whole number (266.00000000000006). */
function pathData(commands: PathCommand[]) {
  const num = (v: number) => String(Math.round(v * 100) / 100);
  return commands
    .map(({ type, x1, y1, x2, y2, x, y }) => type + [x1, y1, x2, y2, x, y].filter((v) => v !== undefined).map(num).join(' '))
    .join('');
}

/** `text` as SVG path data, its baseline starting at (x, y). */
export function textPath(text: string, x: number, y: number, size: number, weight: Weight, tracking = 0) {
  let d = '';
  for (const p of pieces(text, weight, tracking)) {
    d += pathData(p.font.getPath(p.text, x, y, size).commands);
    x += p.font.getAdvanceWidth(p.text, size) + tracking * size;
  }
  return d;
}

/** Splits `text` into lines no wider than `width`, breaking at spaces (a single word longer than
 *  the line stays whole). */
export function wrap(text: string, width: number, size: number, weight: Weight) {
  const lines: string[] = [];
  for (const word of text.split(/\s+/)) {
    const last = lines.at(-1);
    if (last !== undefined && measure(`${last} ${word}`, size, weight) <= width) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

/** The font's ascender and descender (negative), as shares of the size. */
export function metrics(weight: Weight) {
  const f = fonts(weight)[0];
  return { ascent: f.ascender / f.unitsPerEm, descent: f.descender / f.unitsPerEm };
}
