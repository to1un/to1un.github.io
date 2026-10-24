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

export const certs: Cert[] = [];

/** "June 2025" for an earned cert, "Goal" for one aimed for. */
export const certStatus = (cert: Cert) => {
  if (cert.status === 'goal') return 'Goal';
  const [y, m] = cert.earned.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en', { month: 'long', year: 'numeric', timeZone: 'UTC' });
};
