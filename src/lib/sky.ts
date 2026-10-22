// Site colours: a warm off-white day and a deep navy night. Unless the visitor picked one with
// the header toggle (stored in localStorage), the mood follows their system's colour scheme
// (prefers-color-scheme), live. `skyCss` computes every colour token of both moods at build time
// (each text/background pair at 4.5:1 or more) as CSS keyed off data-scheme on <html>, with
// prefers-color-scheme as the no-JS fallback. `runSky` runs as source text in the inline
// pre-paint script of every page (BaseLayout.astro) and sets data-scheme; it is serialised with
// Function#toString, so it must not use anything outside its own body.

export type Mood = 'day' | 'night';
export type Scheme = 'light' | 'dark'; // data-scheme: light by day, dark by night
type BaseKey = 'bg' | 'mark' | 'tip' | 'info' | 'warning' | 'danger';

declare global {
  interface Window {
    __sky?: { scheme: Scheme; set(scheme: Scheme): void };
  }
}

export const SKY = {
  key: 'theme', // localStorage key of the visitor's choice ('light' | 'dark')
  moods: {
    day: { bg: '#f5f2ea', mark: '#f7e6a4', tip: '#3e6c48', info: '#3b5f8e', warning: '#7f5a0e', danger: '#9c3a31' },
    night: { bg: '#12141f', mark: '#4d4220', tip: '#6fae7c', info: '#7a9fd4', warning: '#d4a548', danger: '#d9776e' },
  } satisfies Record<Mood, Record<BaseKey, string>>,
  /** Text colours: dark ink by day, light ink by night. */
  ink: { day: '#1c1c1a', night: '#ece6d8' } satisfies Record<Mood, string>,
};

export function skyTokens(mood: Mood): Record<string, string> {
  type C = number[];
  const hex = (s: string): C => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const css = (c: C) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  const mix = (x: C, y: C, t: number): C => x.map((v, j) => Math.round(v + (y[j] - v) * t));
  const lum = (c: C) => {
    const f = (v: number) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const contrast = (x: C, y: C) => {
    const p = lum(x) + 0.05;
    const q = lum(y) + 0.05;
    return p > q ? p / q : q / p;
  };
  // Moves c towards `to` (in twelfths, ending on `to`) until it reaches 4.5:1 against `on`.
  const push = (c: C, to: C, on: C) => {
    let r = c;
    for (let i = 1; i <= 12 && contrast(r, on) < 4.5; i++) r = mix(c, to, i / 12);
    return r;
  };

  const base = (k: BaseKey) => hex(SKY.moods[mood][k]);
  const bg = base('bg');
  const ink = hex(SKY.ink[mood]);
  const end = mood === 'day' ? [0, 0, 0] : [255, 255, 255];
  // Surfaces (callouts, inline code, table heads, hover) sit a little towards the ink; secondary
  // text and the callout accents must still read on them.
  const surface = push(mix(bg, ink, 0.05), bg, ink);
  const tokens: Record<string, C> = {
    bg,
    fg: ink,
    muted: push(mix(bg, ink, 0.7), ink, surface),
    faint: mix(bg, ink, 0.28), // link underlines
    surface,
    border: mix(bg, ink, 0.12),
    mark: push(base('mark'), bg, ink),
  };
  for (const k of ['tip', 'info', 'warning', 'danger'] as const) tokens[k] = push(base(k), end, surface);

  const out: Record<string, string> = {};
  for (const k in tokens) out[k] = css(tokens[k]);
  return out;
}

/** The tokens of both moods: day by default, night under data-scheme="dark", and without JS
 *  under prefers-color-scheme: dark. */
export function skyCss() {
  const vars = (mood: Mood) =>
    Object.entries(skyTokens(mood))
      .map(([k, v]) => `--${k}:${v}`)
      .join(';');
  return (
    `:root{${vars('day')}}:root[data-scheme=light]{color-scheme:light}` +
    `:root[data-scheme=dark]{color-scheme:dark;${vars('night')}}` +
    `@media (prefers-color-scheme:dark){:root:not([data-scheme]){${vars('night')}}}`
  );
}

/** Sets data-scheme on <html> before first paint: the visitor's stored choice, else the system's
 *  colour scheme (followed live while nothing is stored). Exposes window.__sky.set for the header
 *  toggle and fires `sky` on window whenever the scheme changes. */
export function runSky(key: string) {
  const root = document.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  // The click on this page, for when storage is unavailable.
  let chosen: Scheme | null = null;
  const stored = (): Scheme | null => {
    try {
      const v = localStorage.getItem(key);
      return v === 'light' || v === 'dark' ? v : null;
    } catch {
      return null;
    }
  };
  const sky = {
    scheme: 'light' as Scheme,
    set(scheme: Scheme) {
      chosen = scheme;
      try {
        localStorage.setItem(key, scheme);
      } catch {}
      update();
    },
  };
  const update = () => {
    const scheme = stored() ?? chosen ?? (system.matches ? 'dark' : 'light');
    if (root.dataset.scheme === scheme) return;
    root.dataset.scheme = sky.scheme = scheme; // tokens, scenes and Shiki follow it in CSS
    window.dispatchEvent(new Event('sky'));
  };
  window.__sky = sky;
  update();
  system.addEventListener('change', update);
  // Restored from the back/forward cache, or changed in another tab: follow the stored choice.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) update();
  });
  window.addEventListener('storage', (e) => {
    if (e.key === key || e.key === null) update();
  });
}
