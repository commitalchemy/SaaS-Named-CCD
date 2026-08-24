import { useMemo } from 'react';
import { useFilterStore } from './filterStore';
import { useDataStore } from './dataStore';

export function useFilteredAccounts() {
  const accounts = useDataStore((s) => s.accounts);
  const vertical = useFilterStore((s) => s.vertical);
  const businessStatus = useFilterStore((s) => s.businessStatus);
  const businessOutcome = useFilterStore((s) => s.businessOutcome);
  const search = useFilterStore((s) => s.search);

  return useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((a) => {
      if (vertical !== 'All' && a.vertical !== vertical) return false;
      if (businessStatus !== 'All' && a.businessStatus !== businessStatus) return false;
      if (businessOutcome !== 'All' && a.businessOutcome !== businessOutcome) return false;
      if (q && !a.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [accounts, vertical, businessStatus, businessOutcome, search]);
}
