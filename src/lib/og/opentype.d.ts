// The little of opentype.js 2 that the link preview cards use (the package ships no types).
declare module 'opentype.js' {
  export interface Font {
    unitsPerEm: number;
    ascender: number;
    descender: number;
    charToGlyphIndex(char: string): number;
    getAdvanceWidth(text: string, fontSize: number): number;
    getPath(text: string, x: number, y: number, fontSize: number): { commands: PathCommand[] };
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
