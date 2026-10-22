/**
 * The source of a function for an inline <script>, without its comment lines and indentation.
 * Only for self-contained functions without multi-line strings.
 */
export const inlineSource = (fn: (...args: never[]) => unknown) =>
  fn
    .toString()
    .replace(/^\s*\/\/.*\n/gm, '')
    .replace(/\n\s+/g, '\n');
