// The cape of the homepage scarecrow (HeroScarecrow), in its SVG user units (the approved
// sketch's 0 0 160 240 frame: x right, y down, z towards the viewer). Shared by the
// build-time still (no-JS) and the client cloth solver, so both start from the same shape.

export type Pt = [number, number];
export type V3 = [number, number, number];

export const CAPE = {
  cols: 11,
  rows: 15,
  top: 93, // shoulder line: the cape is pinned along it, behind the body
  slope: 6, // how much lower the shoulder ends sit
  x0: 58, // shoulder ends
  x1: 98,
  hemX0: 46, // hanging hem ends (the cape flares a little)
  hemX1: 110,
  length: 96, // mean hanging length
  /** Per-column length offset: long and short strips make the torn hem. */
  jag: [-9, 5, -3, 11, -1, 13, -6, 8, -2, 6, -12],
  /** Per hem segment: how far a tear notch reaches up (share of the two lowest rows) … */
  notch: [0.55, 0.2, 0.7, 0.3, 0.6, 0.15, 0.65, 0.35, 0.5, 0.25],
  /** … and where along the segment it sits. */
  notchAt: [0.4, 0.6, 0.45, 0.55, 0.35, 0.6, 0.5, 0.4, 0.6, 0.45],
  fold: 2.4, // depth of the hanging folds at the hem
  ground: 225,
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Hanging (rest) position of grid point column c, row r. */
export function restPoint(c: number, r: number): V3 {
  const u = c / (CAPE.cols - 1);
  const v = r / (CAPE.rows - 1);
  const x = lerp(lerp(CAPE.x0, CAPE.x1, u), lerp(CAPE.hemX0, CAPE.hemX1, u), v);
  // Sloping shoulders: the pin line dips towards the ends.
  const y = CAPE.top + CAPE.slope * (2 * u - 1) ** 2 * (1 - v) + v * (CAPE.length + CAPE.jag[c]);
  // A slight curve round the back, and soft vertical folds that open towards the hem.
  const z = -1.5 * (1 - (2 * u - 1) ** 2) * (1 - 0.6 * v) + CAPE.fold * v * Math.sin(u * Math.PI * 4);
  return [x, y, z];
}

/** Tear notch in hem segment k, from its bottom corners and the points two rows up. */
export function notchPoint(k: number, bl: Pt, br: Pt, ul: Pt, ur: Pt): Pt {
  const s = CAPE.notchAt[k];
  const t = CAPE.notch[k];
  const bx = lerp(bl[0], br[0], s);
  const by = lerp(bl[1], br[1], s);
  return [lerp(bx, lerp(ul[0], ur[0], s), t), lerp(by, lerp(ul[1], ur[1], s), t)];
}

/** Outline of the hanging cape (for the still shown before the script runs, or without it). */
export function restOutline(): string {
  const { cols, rows } = CAPE;
  const p = (c: number, r: number): Pt => {
    const q = restPoint(c, r);
    return [q[0], q[1]];
  };
  const out: Pt[] = [];
  for (let c = 0; c < cols; c++) out.push(p(c, 0));
  for (let r = 1; r < rows; r++) out.push(p(cols - 1, r));
  for (let c = cols - 2; c >= 0; c--) {
    out.push(notchPoint(c, p(c, rows - 1), p(c + 1, rows - 1), p(c, rows - 3), p(c + 1, rows - 3)));
    out.push(p(c, rows - 1));
  }
  for (let r = rows - 2; r > 0; r--) out.push(p(0, r));
  return out.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
}
