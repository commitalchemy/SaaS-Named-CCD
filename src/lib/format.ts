/**
 * Formats a rupee amount using Indian units (K / L / Cr), e.g.
 * ₹1,73,37,52,113 -> ₹173.38 Cr
 * ₹45,20,000      -> ₹45.20 L
 * ₹8,500          -> ₹8.50 K
 * ₹850            -> ₹850
 */
const THOUSAND = 1_000;
const LAKH = 1_00_000;
const CRORE = 1_00_00_000;

export function formatINRCompact(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= CRORE) return `${sign}₹${(abs / CRORE).toFixed(2)} Cr`;
  if (abs >= LAKH) return `${sign}₹${(abs / LAKH).toFixed(2)} L`;
  if (abs >= THOUSAND) return `${sign}₹${(abs / THOUSAND).toFixed(2)} K`;
  return `${sign}₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(abs)}`;
}

/** Same compact formatting, without the ₹ symbol — for axis tick labels. */
export function formatINRAxis(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= CRORE) return `${sign}₹${trimZeros(abs / CRORE)} Cr`;
  if (abs >= LAKH) return `${sign}₹${trimZeros(abs / LAKH)} L`;
  if (abs >= THOUSAND) return `${sign}₹${trimZeros(abs / THOUSAND)} K`;
  return `${sign}₹${Math.round(abs)}`;
}

function trimZeros(n: number): string {
  return n.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}
