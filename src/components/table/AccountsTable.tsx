import { useMemo, useState } from 'react';
import type { Account } from '../../types';
import { OUTCOME_COLORS } from '../../lib/theme';
import { formatINRCompact } from '../../lib/format';
import { useFilterStore } from '../../state/filterStore';
import { useUiStore } from '../../state/uiStore';
import { useDataStore } from '../../state/dataStore';

type SortKey = 'name' | 'vertical' | 'businessStatus' | 'businessOutcome' | 'totalExpense' | 'totalBusiness';

const fmtMoney = formatINRCompact;

const COLUMNS: { key: SortKey; label: string; width: string }[] = [
  { key: 'name', label: 'SaaS Name', width: '24%' },
  { key: 'vertical', label: 'Vertical', width: '15%' },
  { key: 'businessStatus', label: 'Business Status', width: '13%' },
  { key: 'businessOutcome', label: 'Business Outcome', width: '20%' },
  { key: 'totalExpense', label: 'Total Expense', width: '14%' },
  { key: 'totalBusiness', label: 'Total Business', width: '14%' },
];

export default function AccountsTable({ accounts }: { accounts: Account[] }) {
  // Account Detail defaults to Total Business ascending.
  const [sortKey, setSortKey] = useState<SortKey>('totalBusiness');
  const [asc, setAsc] = useState(true);
  const selectAccount = useUiStore((s) => s.selectAccount);
  const allAccounts = useDataStore((s) => s.accounts);

  const vertical = useFilterStore((s) => s.vertical);
  const businessStatus = useFilterStore((s) => s.businessStatus);
  const businessOutcome = useFilterStore((s) => s.businessOutcome);
  const setVertical = useFilterStore((s) => s.setVertical);
  const setBusinessStatus = useFilterStore((s) => s.setBusinessStatus);
  const setBusinessOutcome = useFilterStore((s) => s.setBusinessOutcome);

  const verticals = useMemo(() => [...new Set(allAccounts.map((a) => a.vertical))].sort(), [allAccounts]);
  const statuses = useMemo(() => [...new Set(allAccounts.map((a) => a.businessStatus))].sort(), [allAccounts]);
  const outcomes = useMemo(() => [...new Set(allAccounts.map((a) => a.businessOutcome))].sort(), [allAccounts]);

  const sorted = useMemo(() => {
    const copy = [...accounts];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return asc ? av - bv : bv - av;
      return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [accounts, sortKey, asc]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setAsc(!asc);
    else {
      setSortKey(key);
      setAsc(true);
    }
  }

  return (
    <div className="table-card">
      <div className="chart-title">
        Account Detail <span className="row-count">({accounts.length} accounts)</span>
      </div>

      <div className="table-filter-row">
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
      </div>

      <div className="table-scroll">
        <table>
          <colgroup>
            {COLUMNS.map((c) => (
              <col key={c.key} style={{ width: c.width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} onClick={() => toggleSort(c.key)}>
                  {c.label}
                  {sortKey === c.key ? (asc ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => (
              <tr key={a.name + i} onClick={() => selectAccount(a)} className="clickable-row">
                <td>{a.name}</td>
                <td>{a.vertical}</td>
                <td>{a.businessStatus}</td>
                <td>
                  <span
                    className="outcome-pill"
                    style={{ backgroundColor: (OUTCOME_COLORS[a.businessOutcome] ?? '#5B6472') + '22', color: OUTCOME_COLORS[a.businessOutcome] ?? '#5B6472' }}
                  >
                    {a.businessOutcome}
                  </span>
                </td>
                <td>{fmtMoney(a.totalExpense)}</td>
                <td>{fmtMoney(a.totalBusiness)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
