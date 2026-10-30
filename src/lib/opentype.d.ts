// The little of opentype.js 2 that the site uses (the package ships no types).
declare module 'opentype.js' {
  export interface Font {
    unitsPerEm: number;
    ascender: number;
    descender: number;
    tables: { os2: { sCapHeight: number } };
    charToGlyphIndex(char: string): number;
    getAdvanceWidth(text: string, fontSize: number): number;
    getPath(text: string, x: number, y: number, fontSize: number): Path;
  }
  export interface Path {
    commands: PathCommand[];
    getBoundingBox(): { x1: number; y1: number; x2: number; y2: number };
  }
  export interface PathCommand {
    type: 'M' | 'L' | 'Q' | 'C' | 'Z';
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    x?: number;
    y?: number;
  }
  const opentype: { parse(buffer: ArrayBuffer): Font };
  export default opentype;
}
