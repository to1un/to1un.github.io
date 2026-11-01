// Text drawn as SVG paths at build time (the link preview cards, the names on the project spines), from the
// @fontsource packages, so it looks the same on any machine and needs no webfont. Each weight comes
// as two files, latin and latin-ext (ğ, ş, ı, İ): a character takes its glyph from the first file
// that has it.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import opentype, { type Font, type PathCommand } from 'opentype.js';

export type Family = 'noto-sans' | 'noto-serif';

const require = createRequire(import.meta.url);
const faces = new Map<string, Font[]>();

/** The latin and latin-ext files of a family's upright `weight`. */
export function face(family: Family, weight: number): Font[] {
  const key = `${family}-${weight}`;
  let list = faces.get(key);
  if (!list) {
    list = ['latin', 'latin-ext'].map((subset) => {
      const file = require.resolve(`@fontsource/${family}/files/${family}-${subset}-${weight}-normal.woff`);
      const buf = readFileSync(file);
      return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    });
    faces.set(key, list);
  }
  return list;
}

/** Runs of text that share one font file. */
export function runs(text: string, list: Font[]) {
  const out: { font: Font; text: string }[] = [];
  for (const ch of text) {
    const font = list.find((f) => f.charToGlyphIndex(ch) > 0) ?? list[0];
    const last = out.at(-1);
    if (last?.font === font) last.text += ch;
    else out.push({ font, text: ch });
  }
  return out;
}

/** Glyph outlines as SVG path data, to two decimals. Written here, as opentype.js 2.0.0's own
 *  toPathData writes NaN for a coordinate a hair off a whole number (266.00000000000006). */
export function pathData(commands: PathCommand[]) {
  const num = (v: number) => String(Math.round(v * 100) / 100);
  return commands
    .map(({ type, x1, y1, x2, y2, x, y }) => type + [x1, y1, x2, y2, x, y].filter((v) => v !== undefined).map(num).join(' '))
    .join('');
}
