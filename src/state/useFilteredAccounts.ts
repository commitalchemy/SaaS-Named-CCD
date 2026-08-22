import { useMemo } from 'react';
import { useFilterStore } from './filterStore';
import { ACCOUNTS } from '../data/loadAccounts';

export function useFilteredAccounts() {
  const vertical = useFilterStore((s) => s.vertical);
  const businessStatus = useFilterStore((s) => s.businessStatus);
  const businessOutcome = useFilterStore((s) => s.businessOutcome);
  const search = useFilterStore((s) => s.search);

  return useMemo(() => {
    const q = search.trim().toLowerCase();
    return ACCOUNTS.filter((a) => {
      if (vertical !== 'All' && a.vertical !== vertical) return false;
      if (businessStatus !== 'All' && a.businessStatus !== businessStatus) return false;
      if (businessOutcome !== 'All' && a.businessOutcome !== businessOutcome) return false;
      if (q && !a.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [vertical, businessStatus, businessOutcome, search]);
}
