// DEV ONLY: sample projects for the edge cases of the shelf, shown under the real one in dev
// (src/pages/projects/index.astro imports this under import.meta.env.DEV, so the build holds none
// of it).
import type { ProjectView } from './content';

export const samples: ProjectView[] = [
  {
    name: 'Short',
    tagline: 'One line of tagline.',
    status: 'active',
    year: 2026,
    logo: { mono: 'Sh', bg: '#7a4b8c' },
    href: '/writing/writing-guide/',
    repo: 'https://github.com/to1un/short',
  },
  { name: 'Bare', status: 'active', year: 2025, logo: { mono: 'Ba', bg: '#8a5a2b' }, repo: 'https://codeberg.org/to1un/bare' },
  {
    name: 'A Rather Long Project Name',
    tagline:
      'A tagline long enough to need a second line on every shelf: it says what the project does, for whom, and why it exists at all, in one breath.',
    status: 'active',
    year: 2025,
    logo: { mono: 'Lo', bg: '#4b6a8c' },
  },
  {
    name: 'Relic',
    tagline: 'Done and put away. Still works.',
    status: 'archived',
    year: 2023,
    logo: { mono: 'Re', bg: '#6b4f3f' },
    repo: 'https://github.com/to1un/relic',
  },
  {
    name: 'Forge',
    tagline: 'Its repo on a forge of its own.',
    status: 'upcoming',
    year: 2026,
    logo: { mono: 'Fo', bg: '#5b6b2f' },
    repo: 'https://git.example.org/to1un/forge',
  },
  { name: 'An unannounced project', status: 'upcoming', secret: true },
];
