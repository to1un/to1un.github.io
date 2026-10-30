// Text for the link preview cards, set in Noto Sans (@fontsource, the face the site's system sans
// shows on the owner's machine) and turned into SVG paths (src/lib/font.ts), so a card renders the
// same on any build machine, without system fonts.
import { face, pathData, runs } from '../font';

export type Weight = 400 | 600 | 700;

const fonts = (weight: Weight) => face('noto-sans', weight);

/** Pieces to set one at a time: whole runs (kerned), or single characters when tracked
 *  (opentype.js 2.0.0 gives NaN coordinates with its letterSpacing option). */
function pieces(text: string, weight: Weight, tracking: number) {
  const list = runs(text, fonts(weight));
  return tracking ? list.flatMap((r) => [...r.text].map((ch) => ({ font: r.font, text: ch }))) : list;
}

/** Width of `text` at `size` px; `tracking` is extra space after each letter, in em. */
export function measure(text: string, size: number, weight: Weight, tracking = 0) {
  return pieces(text, weight, tracking).reduce((w, p) => w + p.font.getAdvanceWidth(p.text, size) + tracking * size, 0);
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
