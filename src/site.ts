// Site identity.
import type { Team } from './lib/hero/palette';

/** Languages content can be written in. The site chrome itself is English. */
export type Lang = 'en' | 'tr';

const handle = 'to1un'; // for the domain and accounts

/** Team colour of the scarecrow's cape and eyes: 'blue' | 'purple' | 'red'.
 *  Palettes: TEAMS in src/lib/hero/palette.ts. */
const team: Team = 'blue';

/** The owner's name, shown quietly: in page titles ("Writing · Tolun", the homepage's alone), the
 *  footer, the feed and link previews, never in the header or on the page itself. Set it to
 *  undefined to take it off everywhere. */
const owner: string | undefined = 'Tolun';

export const site = {
  /** The header link home. */
  name: 'Home',
  owner,
  handle,
  description: owner ? `Personal website of ${owner}.` : 'A personal website: writing and projects.',
  team,
};
