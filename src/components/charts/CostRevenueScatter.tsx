import Plot from 'react-plotly.js';
import { useMemo } from 'react';
import type { Account } from '../../types';
import { OUTCOME_COLORS, NAVY_SOFT } from '../../lib/theme';

/**
 * Plots the sheet's own "Total Expense" vs "Total Business" columns,
 * verbatim, for every account that has both values. No ratio, deviation,
 * or benchmark is computed — this is a direct plot of two raw columns.
 */
export default function CostRevenueScatter({ accounts }: { accounts: Account[] }) {
  const traces = useMemo(() => {
    const byOutcome = new Map<string, { x: number[]; y: number[]; text: string[] }>();
    accounts.forEach((a) => {
      if (a.totalExpense == null || a.totalBusiness == null) return;
      const key = a.businessOutcome;
      if (!byOutcome.has(key)) byOutcome.set(key, { x: [], y: [], text: [] });
      const t = byOutcome.get(key)!;
      t.x.push(a.totalExpense);
      t.y.push(a.totalBusiness);
      t.text.push(a.name);
    });
    return [...byOutcome.entries()].map(([outcome, t]) => ({
      type: 'scattergl' as const,
      mode: 'markers' as const,
      name: outcome,
      x: t.x,
      y: t.y,
      text: t.text,
      marker: { color: OUTCOME_COLORS[outcome] ?? NAVY_SOFT, size: 6, opacity: 0.75 },
      hovertemplate: '%{text}<br>Total Expense: ₹%{x:,.0f}<br>Total Business: ₹%{y:,.0f}<extra></extra>',
    }));
  }, [accounts]);

  return (
    <div className="chart-card wide">
      <div className="chart-title">Total Expense vs Total Business (raw sheet values)</div>
      <Plot
        data={traces}
        layout={{
          margin: { l: 60, r: 20, t: 6, b: 50 },
          height: 320,
          font: { family: 'Segoe UI, system-ui, sans-serif', size: 12, color: '#152238' },
          xaxis: { title: { text: 'Total Expense (₹)' }, automargin: true },
          yaxis: { title: { text: 'Total Business (₹)' }, automargin: true },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          legend: { orientation: 'h', y: -0.25 },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%' }}
      />
    </div>
  );
}
