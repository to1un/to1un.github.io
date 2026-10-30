// Project marks, on a 48 grid: a rounded tile in the project's colour with one or two letters in
// Noto Serif, an element symbol of the project ("Ul", "Pa"), or the project's own icon instead.
// The letters are drawn as paths at build time (src/lib/font.ts), so the mark is the same on every
// machine, without a webfont. At favicon size only the first letter shows, larger.
import { face, pathData, runs } from './font';

/** An app-icon square with continuous corners (a superellipse, n = 5) in the 48 box, inset by `i`. */
export function tile(i = 0) {
  const r = 24 - i;
  const n = 5;
  const pts: string[] = [];
  for (let k = 0; k < 72; k++) {
    const t = (k / 72) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = 24 + r * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = 24 + r * Math.sign(s) * Math.abs(s) ** (2 / n);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

/** Below this size in px a mark is drawn for favicon size. */
const SMALL = 32;

/** The letters of a mark at `px`, or its "?" (unannounced), as path data in the 48 box. */
export function markLetters(text: string, px: number) {
  if (text === '?') return letters('?', px < SMALL ? 40 : 32);
  if (px < SMALL) return letters([...text][0], 40);
  return letters(text, [...text].length > 1 ? 25 : 30);
}

/** `text` in Noto Serif at `size`, centred by eye: its ink across, its cap height down. */
function letters(text: string, size: number) {
  const list = face('noto-serif', 400);
  for (const ch of text) {
    if (!list.some((f) => f.charToGlyphIndex(ch) > 0)) throw new Error(`Noto Serif has no glyph for "${ch}" (mark "${text}")`);
  }
  const draw = (x: number, y: number) =>
    runs(text, list).map((r) => {
      const path = r.font.getPath(r.text, x, y, size);
      x += r.font.getAdvanceWidth(r.text, size);
      return path;
    });
  const boxes = draw(0, 0).map((p) => p.getBoundingBox());
  const left = Math.min(...boxes.map((b) => b.x1));
  const right = Math.max(...boxes.map((b) => b.x2));
  const cap = (list[0].tables.os2.sCapHeight / list[0].unitsPerEm) * size;
  return draw(24 - (left + right) / 2, 24 + cap / 2)
    .map((p) => pathData(p.commands))
    .join('');
}
