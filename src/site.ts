// Site identity.
import type { IconName } from './lib/icons';
import type { Team } from './lib/hero/palette';
import type { Mood } from './lib/sky';

/** Languages content can be written in. The site chrome itself is English. */
export type Lang = 'en' | 'tr';

interface SiteLink {
  label: string;
  url: string;
  icon: IconName; // from src/lib/icons.ts
}

const handle = 'to1un'; // for the domain and accounts
const github = `https://github.com/${handle}`;

/** Team colour of the scarecrow's cape and eyes: 'blue' | 'purple' | 'red'.
 *  Palettes: TEAMS in src/lib/hero/palette.ts. */
const team: Team = 'blue';

/** The link preview cards (og:image) show the scene by 'night' or by 'day'. */
const preview: Mood = 'night';

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
  preview,
  /** Contact and profiles on the about page, in this order; profiles get rel="me". */
  links: [
    { label: 'Email', url: 'mailto:contact@to1un.com', icon: 'email' },
    { label: 'GitHub', url: github, icon: 'github' },
    { label: 'TryHackMe', url: 'https://tryhackme.com/p/to1un', icon: 'tryhackme' },
    {
      label: 'Hack The Box',
      url: 'https://profile.hackthebox.com/profile/01a18368-f2ff-700a-9d3c-821502c18b26',
      icon: 'hackthebox',
    },
  ] satisfies SiteLink[],
};
