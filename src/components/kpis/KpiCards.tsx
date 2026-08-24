import { useMemo } from 'react';
import type { Account } from '../../types';
import { OUTCOME_COLORS, NAVY } from '../../lib/theme';
import { formatINRCompact } from '../../lib/format';
import { useFilterStore } from '../../state/filterStore';

const fmtInt = new Intl.NumberFormat('en-IN');

const CONTRIBUTION_GREEN = '#1E7B52';
const CONTRIBUTION_RED = '#7A2331';

export default function KpiCards({ accounts }: { accounts: Account[] }) {
  const businessOutcome = useFilterStore((s) => s.businessOutcome);
  const setBusinessOutcome = useFilterStore((s) => s.setBusinessOutcome);

  const stats = useMemo(() => {
    const total = accounts.length;
    const active = accounts.filter((a) =>
      ['Existing', 'New', 'Internal Accounts'].includes(a.businessStatus)
    ).length;
    const healthy = accounts.filter((a) => a.businessOutcome === 'High Revenue Low Cost Account').length;
    const avgCostAvgRevenue = accounts.filter(
      (a) => a.businessOutcome === 'Average Revenue Average Cost Account'
    ).length;
    const highCostLowRevenue = accounts.filter(
      (a) => a.businessOutcome === 'Low Revenue High Cost Account'
    ).length;
    const lossMaking = accounts.filter(
      (a) => a.businessOutcome === 'Loss Making Business Arrangement'
    ).length;
    // Sums are over every account passed in (no outcome filtering), same as Total Accounts.
    const totalBusiness = accounts.reduce((sum, a) => sum + (a.totalBusiness ?? 0), 0);
    const totalExpense = accounts.reduce((sum, a) => sum + (a.totalExpense ?? 0), 0);
    const netContribution = totalBusiness - totalExpense;
    return {
      total,
      active,
      healthy,
      avgCostAvgRevenue,
      highCostLowRevenue,
      lossMaking,
      totalBusiness,
      totalExpense,
      netContribution,
    };
  }, [accounts]);

  function toggleOutcome(outcome: string) {
    setBusinessOutcome(businessOutcome === outcome ? 'All' : outcome);
  }

  const cards = [
    {
      label: 'Total Accounts',
      value: fmtInt.format(stats.total),
      color: NAVY,
      active: businessOutcome === 'All',
      onClick: () => setBusinessOutcome('All'),
    },
    {
      label: 'Active Accounts',
      sub: 'Existing + New + Internal',
      value: fmtInt.format(stats.active),
      color: NAVY,
    },
    {
      label: 'Healthy Accounts',
      sub: 'High Revenue, Low Cost',
      value: fmtInt.format(stats.healthy),
      color: OUTCOME_COLORS['High Revenue Low Cost Account'],
      active: businessOutcome === 'High Revenue Low Cost Account',
      onClick: () => toggleOutcome('High Revenue Low Cost Account'),
    },
    {
      label: 'Average Cost, Average Revenue',
      value: fmtInt.format(stats.avgCostAvgRevenue),
      color: OUTCOME_COLORS['Average Revenue Average Cost Account'],
      active: businessOutcome === 'Average Revenue Average Cost Account',
      onClick: () => toggleOutcome('Average Revenue Average Cost Account'),
    },
    {
      label: 'High Cost, Low Revenue',
      value: fmtInt.format(stats.highCostLowRevenue),
      color: OUTCOME_COLORS['Low Revenue High Cost Account'],
      active: businessOutcome === 'Low Revenue High Cost Account',
      onClick: () => toggleOutcome('Low Revenue High Cost Account'),
    },
    {
      label: 'Loss Making Accounts',
      value: fmtInt.format(stats.lossMaking),
      color: OUTCOME_COLORS['Loss Making Business Arrangement'],
      active: businessOutcome === 'Loss Making Business Arrangement',
      onClick: () => toggleOutcome('Loss Making Business Arrangement'),
    },
    {
      label: 'Total Business',
      sub: 'Sum, all accounts',
      value: formatINRCompact(stats.totalBusiness),
      color: NAVY,
      money: true,
    },
    {
      label: 'Total Expense',
      sub: 'Sum, all accounts',
      value: formatINRCompact(stats.totalExpense),
      color: NAVY,
      money: true,
    },
    {
      label: 'Net Contribution',
      sub: 'Business − Expense',
      value: formatINRCompact(stats.netContribution),
      color: stats.netContribution >= 0 ? CONTRIBUTION_GREEN : CONTRIBUTION_RED,
      money: true,
    },
  ];

  return (
    <div className="kpi-row">
      {cards.map((c) => (
        <div
          className={`kpi-card${c.onClick ? ' kpi-card-clickable' : ''}${c.active ? ' kpi-card-active' : ''}`}
          key={c.label}
          style={{ borderTopColor: c.color }}
          onClick={c.onClick}
          role={c.onClick ? 'button' : undefined}
          tabIndex={c.onClick ? 0 : undefined}
        >
          <div className={c.money ? 'kpi-value kpi-value-money' : 'kpi-value'} style={{ color: c.color }}>
            {c.value}
          </div>
          <div className="kpi-label">{c.label}</div>
          {c.sub ? <div className="kpi-sub">{c.sub}</div> : null}
        </div>
      ))}
    </div>
  );
}
