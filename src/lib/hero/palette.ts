// The scene's colours at the two moods of the site (src/lib/sky.ts, which also holds the
// background the sky fades into). The scarecrow keeps the flat greys of the approved sketch,
// tuned so that it reads on both the warm off-white and the deep navy; its cape and eyes take the
// owner's team colour (TEAMS, chosen in src/site.ts). The landscape around it (Landscape.astro)
// is a backlit field: warm pale gold by day, deep blue at night.
import type { Mood } from '../sky';
import { site } from '../../site';

/** The scarecrow's parts (HeroScarecrow: class sc-<key>). */
export const FIGURE_KEYS = [
  'post',
  'postShade',
  'shirt',
  'shirtShade',
  'sack',
  'sackShade',
  'seam',
  'eye',
  'rope',
  'straw',
  'hat',
  'hatShade',
  'cape',
  'pin', // the metal rim of the badges
] as const;

/** The landscape, back to front, and the scarecrow seen against the light. */
export const LAND_KEYS = [
  'skyLow', // the sky at the horizon (above, it fades into the page background)
  'sun', // the sun's disc (the moon at night)
  'glow', // around it
  'hills', // palest, furthest
  'trees',
  'fieldFar',
  'fieldNear',
  'wheat', // the wheat in front of the scarecrow
  'wheatNear', // the soft stalks at the bottom edge
  'silhouette', // the backlit scarecrow of the homepage
  'rim', // a faint edge of light on its sun side
] as const;

export const PALETTE_KEYS = [...FIGURE_KEYS, ...LAND_KEYS] as const;

export type PaletteKey = (typeof PALETTE_KEYS)[number];
export type Palette = Record<PaletteKey, string>;

/** The scarecrow's team colours: the cape by day and by night, the pupils, and their glow on the
 *  backlit homepage figure. The cape is one cloth in both: the same hue and saturation, a few
 *  points lighter at night (as red's pair), mid-dark enough to stand off both the gold field and
 *  the navy one. */
export type Team = 'blue' | 'purple' | 'red';

export interface TeamColours {
  cape: Record<Mood, string>;
  pupil: string;
  pupilGlow: string; // the glow's bright centre; it fades out through the pupil colour
}

export const TEAMS: Record<Team, TeamColours> = {
  blue: { cape: { day: '#2c4f7d', night: '#30578a' }, pupil: '#2fb8e8', pupilGlow: '#9eeeff' },
  purple: { cape: { day: '#563276', night: '#603882' }, pupil: '#a855f0', pupilGlow: '#dcaaff' },
  red: { cape: { day: '#791f1f', night: '#862428' }, pupil: '#e0261f', pupilGlow: '#ff4a33' },
};

/** A team's colours as CSS custom properties: --c-cape, --c-pupil, --c-pupilGlow. */
const teamVars = (team: Team, mood: Mood) =>
  `--c-cape:${TEAMS[team].cape[mood]};--c-pupil:${TEAMS[team].pupil};--c-pupilGlow:${TEAMS[team].pupilGlow}`;

const day: Omit<Palette, 'cape'> = {
  post: '#5f5e5a',
  postShade: '#4b4a47',
  shirt: '#888780',
  shirtShade: '#706f69',
  sack: '#cdc7b5',
  sackShade: '#b0a994',
  seam: '#7d7663',
  eye: '#2c2c2a',
  rope: '#8a6a3c',
  straw: '#ba7517',
  hat: '#444441',
  hatShade: '#333331',
  pin: '#c8a24a',
  skyLow: '#f5d48f',
  sun: '#e3a53c',
  glow: '#fff2cc',
  hills: '#e2cb9c',
  trees: '#8f7547',
  fieldFar: '#e8c47c',
  fieldNear: '#d09c4f',
  wheat: '#a8722f',
  wheatNear: '#5c3a17',
  silhouette: '#3a2a1e',
  rim: '#ffd98c',
};

const night: Omit<Palette, 'cape'> = {
  post: '#55545a',
  postShade: '#44434a',
  shirt: '#686870',
  shirtShade: '#55555d',
  sack: '#bdb7a6',
  sackShade: '#958f80',
  seam: '#6b6658',
  eye: '#0b0b10',
  rope: '#6f5638',
  straw: '#93672a',
  hat: '#2a2a31',
  hatShade: '#1d1d23',
  pin: '#8f7840',
  skyLow: '#2a3860',
  sun: '#e6e1cf',
  glow: '#56689a',
  hills: '#2d3a5e',
  trees: '#141a2c',
  fieldFar: '#2b3554',
  fieldNear: '#1b2238',
  wheat: '#151b2d',
  wheatNear: '#0b0e19',
  silhouette: '#0a0d17',
  rim: '#8ea2cf',
};

const PALETTES = { day, night };

/** One mood's palette with the team's colours, as plain values (for the link preview cards). */
export function paletteOf(mood: Mood, team: Team = site.team) {
  const { cape, pupil, pupilGlow } = TEAMS[team];
  return { ...PALETTES[mood], cape: cape[mood], pupil, pupilGlow };
}

/** The palette with the team's colours as --c-* on `sel`: day by default, night under
 *  data-scheme="dark", and without JS under prefers-color-scheme: dark. */
export function paletteCss(sel: string, team: Team = site.team) {
  const vars = (mood: Mood) =>
    PALETTE_KEYS.filter((k) => k !== 'cape')
      .map((k) => `--c-${k}:${PALETTES[mood][k as Exclude<PaletteKey, 'cape'>]}`)
      .concat(teamVars(team, mood))
      .join(';');
  return (
    `${sel}{${vars('day')}}:root[data-scheme=dark] ${sel}{${vars('night')}}` +
    `@media (prefers-color-scheme:dark){:root:not([data-scheme]) ${sel}{${vars('night')}}}`
  );
}
