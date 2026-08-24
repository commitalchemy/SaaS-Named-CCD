import { useMemo } from 'react';
import { useFilterStore } from '../../state/filterStore';
import { useDataStore } from '../../state/dataStore';

export default function FilterBar() {
  const accounts = useDataStore((s) => s.accounts);
  const vertical = useFilterStore((s) => s.vertical);
  const businessStatus = useFilterStore((s) => s.businessStatus);
  const businessOutcome = useFilterStore((s) => s.businessOutcome);
  const csSpoc = useFilterStore((s) => s.csSpoc);
  const csManager = useFilterStore((s) => s.csManager);
  const csHead = useFilterStore((s) => s.csHead);
  const search = useFilterStore((s) => s.search);
  const setVertical = useFilterStore((s) => s.setVertical);
  const setBusinessStatus = useFilterStore((s) => s.setBusinessStatus);
  const setBusinessOutcome = useFilterStore((s) => s.setBusinessOutcome);
  const setCsSpoc = useFilterStore((s) => s.setCsSpoc);
  const setCsManager = useFilterStore((s) => s.setCsManager);
  const setCsHead = useFilterStore((s) => s.setCsHead);
  const setSearch = useFilterStore((s) => s.setSearch);
  const clearAll = useFilterStore((s) => s.clearAll);

  const verticals = useMemo(() => [...new Set(accounts.map((a) => a.vertical))].sort(), [accounts]);
  const statuses = useMemo(() => [...new Set(accounts.map((a) => a.businessStatus))].sort(), [accounts]);
  const outcomes = useMemo(() => [...new Set(accounts.map((a) => a.businessOutcome))].sort(), [accounts]);
  const spocs = useMemo(() => [...new Set(accounts.map((a) => a.csSpoc))].sort(), [accounts]);
  const managers = useMemo(() => [...new Set(accounts.map((a) => a.csManager))].sort(), [accounts]);
  const heads = useMemo(() => [...new Set(accounts.map((a) => a.csHead))].sort(), [accounts]);

  const dirty =
    vertical !== 'All' ||
    businessStatus !== 'All' ||
    businessOutcome !== 'All' ||
    csSpoc !== 'All' ||
    csManager !== 'All' ||
    csHead !== 'All' ||
    search.trim() !== '';

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
      <div className="slicer">
        <label>CS SPOC</label>
        <select value={csSpoc} onChange={(e) => setCsSpoc(e.target.value)}>
          <option value="All">All</option>
          {spocs.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="slicer">
        <label>CS Manager</label>
        <select value={csManager} onChange={(e) => setCsManager(e.target.value)}>
          <option value="All">All</option>
          {managers.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="slicer">
        <label>CS Head</label>
        <select value={csHead} onChange={(e) => setCsHead(e.target.value)}>
          <option value="All">All</option>
          {heads.map((v) => (
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
