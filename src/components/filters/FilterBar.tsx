import { useMemo } from 'react';
import { useFilterStore } from '../../state/filterStore';
import { useDataStore } from '../../state/dataStore';

export default function FilterBar() {
  const accounts = useDataStore((s) => s.accounts);
  const vertical = useFilterStore((s) => s.vertical);
  const businessStatus = useFilterStore((s) => s.businessStatus);
  const businessOutcome = useFilterStore((s) => s.businessOutcome);
  const search = useFilterStore((s) => s.search);
  const setVertical = useFilterStore((s) => s.setVertical);
  const setBusinessStatus = useFilterStore((s) => s.setBusinessStatus);
  const setBusinessOutcome = useFilterStore((s) => s.setBusinessOutcome);
  const setSearch = useFilterStore((s) => s.setSearch);
  const clearAll = useFilterStore((s) => s.clearAll);

  const verticals = useMemo(() => [...new Set(accounts.map((a) => a.vertical))].sort(), [accounts]);
  const statuses = useMemo(() => [...new Set(accounts.map((a) => a.businessStatus))].sort(), [accounts]);
  const outcomes = useMemo(() => [...new Set(accounts.map((a) => a.businessOutcome))].sort(), [accounts]);

  const dirty =
    vertical !== 'All' || businessStatus !== 'All' || businessOutcome !== 'All' || search.trim() !== '';

  return (
    <div className="filter-bar">
      <div className="slicer">
        <label>Vertical</label>
        <select value={vertical} onChange={(e) => setVertical(e.target.value)}>
          <option value="All">All</option>
          {verticals.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="slicer">
        <label>Business Status</label>
        <select value={businessStatus} onChange={(e) => setBusinessStatus(e.target.value)}>
          <option value="All">All</option>
          {statuses.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="slicer">
        <label>Business Outcome</label>
        <select value={businessOutcome} onChange={(e) => setBusinessOutcome(e.target.value)}>
          <option value="All">All</option>
          {outcomes.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="slicer search-slicer">
        <label>Search Account</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SaaS name…" />
      </div>
      <button className="clear-btn" onClick={clearAll} disabled={!dirty}>
        Clear Filters
      </button>
    </div>
  );
}
