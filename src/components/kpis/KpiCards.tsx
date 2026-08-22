import { useMemo } from 'react';
import type { Account } from '../../types';
import { OUTCOME_COLORS, NAVY } from '../../lib/theme';

const fmtInt = new Intl.NumberFormat('en-IN');

export default function KpiCards({ accounts }: { accounts: Account[] }) {
  const stats = useMemo(() => {
    const total = accounts.length;
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
    return { total, healthy, avgCostAvgRevenue, highCostLowRevenue, lossMaking };
  }, [accounts]);

  const cards = [
    { label: 'Total Accounts', value: fmtInt.format(stats.total), color: NAVY },
    {
      label: 'Healthy Accounts',
      sub: 'High Revenue, Low Cost',
      value: fmtInt.format(stats.healthy),
      color: OUTCOME_COLORS['High Revenue Low Cost Account'],
    },
    {
      label: 'Average Cost, Average Revenue',
      value: fmtInt.format(stats.avgCostAvgRevenue),
      color: OUTCOME_COLORS['Average Revenue Average Cost Account'],
    },
    {
      label: 'High Cost, Low Revenue',
      value: fmtInt.format(stats.highCostLowRevenue),
      color: OUTCOME_COLORS['Low Revenue High Cost Account'],
    },
    {
      label: 'Loss Making Accounts',
      value: fmtInt.format(stats.lossMaking),
      color: OUTCOME_COLORS['Loss Making Business Arrangement'],
    },
  ];

  return (
    <div className="kpi-row">
      {cards.map((c) => (
        <div className="kpi-card" key={c.label} style={{ borderTopColor: c.color }}>
          <div className="kpi-value" style={{ color: c.color }}>
            {c.value}
          </div>
          <div className="kpi-label">{c.label}</div>
          {c.sub ? <div className="kpi-sub">{c.sub}</div> : null}
        </div>
      ))}
    </div>
  );
}
