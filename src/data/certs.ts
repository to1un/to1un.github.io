// Certifications, pinned on the scarecrow's shirt as enamel badges (HeroScarecrow), in this
// order: the ones earned, and the ones aimed for (goals, shown dimmed).

interface CertBase {
  code: string; // short code printed on the badge
  name: string;
  issuer: string;
  url?: string; // verification link; without one, the badge is not a link
  color: string; // enamel colour of the badge
}

export type Cert = CertBase &
  ({ status: 'earned'; earned: `${number}-${number}` /* YYYY-MM */ } | { status: 'goal'; earned?: never });

export const certs: Cert[] = [
  {
    code: 'S+',
    name: 'Security+',
    issuer: 'CompTIA',
    status: 'earned',
    earned: '2026-10',
    url: 'https://www.credly.com/badges/8aab1556-2002-43fb-84c9-77b546b6f052/public_url',
    color: '#b23a32',
  },
  { code: 'CySA+', name: 'CySA+', issuer: 'CompTIA', status: 'goal', color: '#2f5f8f' },
  { code: 'eJPT', name: 'eJPT', issuer: 'INE', status: 'goal', color: '#3d7550' },
  { code: 'OSCP', name: 'OSCP', issuer: 'OffSec', status: 'goal', color: '#5b3f86' },
];

/** "October 2026" for an earned cert, "Goal" for one aimed for. */
export const certStatus = (cert: Cert) => {
  if (cert.status === 'goal') return 'Goal';
  const [y, m] = cert.earned.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en', { month: 'long', year: 'numeric', timeZone: 'UTC' });
};
