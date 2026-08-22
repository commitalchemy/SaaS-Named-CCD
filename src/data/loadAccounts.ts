import raw from './accounts.json';
import type { Account } from '../types';

/**
 * Collapses spelling/casing variants of the same vertical into one label.
 * This is display-only text normalization (not a business calculation).
 */
function normalizeVertical(v: string): string {
  const t = v.trim().toLowerCase();
  if (t === '#n/a' || t === 'n/a' || t === '') return 'Unspecified';
  if (t === 'ed-tech' || t === 'edtech') return 'EdTech';
  if (t === 'k-12' || t === 'k-12 schools' || t === 'k12') return 'K-12 Schools';
  if (t === 'companies' || t === 'company') return 'Companies';
  return v.trim();
}

/**
 * All accounts from the "SaaS Name Mapping" sheet, EXCLUDING:
 *  - Business Status = "Churned"
 *  - Business Outcome = "Data Not Available"
 * per leadership sign-off: these are not actionable accounts and should
 * not count toward Total Accounts or any average on this dashboard.
 * Aside from vertical-label normalization above, no other transformation
 * or calculation is applied — every field is the sheet's own value.
 */
export const ACCOUNTS: Account[] = (raw as Account[])
  .filter((a) => a.businessStatus !== 'Churned' && a.businessOutcome !== 'Data Not Available')
  .map((a) => ({ ...a, vertical: normalizeVertical(a.vertical) }));
