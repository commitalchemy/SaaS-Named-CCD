import raw from './accounts.json';
import type { Account } from '../types';

/**
 * All accounts from the "SaaS Name Mapping" sheet, EXCLUDING:
 *  - Business Status = "Churned"
 *  - Business Outcome = "Data Not Available"
 * per leadership sign-off: these are not actionable accounts and should
 * not count toward Total Accounts or any average on this dashboard.
 * No other transformation, calculation, or bucketing is applied — every
 * field is the sheet's own value, verbatim.
 */
export const ACCOUNTS: Account[] = (raw as Account[]).filter(
  (a) => a.businessStatus !== 'Churned' && a.businessOutcome !== 'Data Not Available'
);
