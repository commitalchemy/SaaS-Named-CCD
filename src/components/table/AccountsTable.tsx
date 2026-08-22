import { useMemo, useState } from 'react';
import type { Account } from '../../types';
import { OUTCOME_COLORS } from '../../lib/theme';

type SortKey = 'name' | 'vertical' | 'businessStatus' | 'businessOutcome' | 'totalExpense' | 'totalBusiness';

const fmtMoney = (n: number | null) =>
  n == null ? '—' : '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'SaaS Name' },
  { key: 'vertical', label: 'Vertical' },
  { key: 'businessStatus', label: 'Business Status' },
  { key: 'businessOutcome', label: 'Business Outcome' },
  { key: 'totalExpense', label: 'Total Expense' },
  { key: 'totalBusiness', label: 'Total Business' },
];

export default function AccountsTable({ accounts }: { accounts: Account[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [asc, setAsc] = useState(true);

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
      <div className="table-scroll">
        <table>
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
              <tr key={a.name + i}>
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
