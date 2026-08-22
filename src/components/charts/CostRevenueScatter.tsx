import Plot from 'react-plotly.js';
import { useMemo } from 'react';
import type { Account } from '../../types';
import { OUTCOME_COLORS, NAVY_SOFT } from '../../lib/theme';
import { useUiStore } from '../../state/uiStore';

/**
 * Account-level Total Expense vs Total Business, both raw sheet columns.
 * Log-log axes so the many low-value accounts aren't crushed into one
 * corner by the handful of very large ones. Bubble size = Total Business.
 * The dashed diagonal marks Total Business = Total Expense (break-even):
 * accounts above it earn more than they cost, accounts below it don't.
 */
export default function CostRevenueScatter({ accounts }: { accounts: Account[] }) {
  const selectAccount = useUiStore((s) => s.selectAccount);

  const { traces, lineRange } = useMemo(() => {
    const byOutcome = new Map<
      string,
      { x: number[]; y: number[]; text: string[]; size: number[]; accounts: Account[] }
    >();
    let minV = Infinity;
    let maxV = -Infinity;

    accounts.forEach((a) => {
      if (!a.totalExpense || a.totalExpense <= 0 || !a.totalBusiness || a.totalBusiness <= 0) return;
      const key = a.businessOutcome;
      if (!byOutcome.has(key)) byOutcome.set(key, { x: [], y: [], text: [], size: [], accounts: [] });
      const t = byOutcome.get(key)!;
      t.x.push(a.totalExpense);
      t.y.push(a.totalBusiness);
      t.text.push(a.name);
      t.size.push(a.totalBusiness);
      t.accounts.push(a);
      minV = Math.min(minV, a.totalExpense, a.totalBusiness);
      maxV = Math.max(maxV, a.totalExpense, a.totalBusiness);
    });

    const traces = [...byOutcome.entries()].map(([outcome, t]) => ({
      type: 'scattergl' as const,
      mode: 'markers' as const,
      name: outcome,
      x: t.x,
      y: t.y,
      text: t.text,
      marker: {
        color: OUTCOME_COLORS[outcome] ?? NAVY_SOFT,
        opacity: 0.7,
        size: t.size,
        sizemode: 'area' as const,
        sizeref: (2 * Math.max(...t.size, 1)) / 40 ** 2,
        sizemin: 4,
        line: { width: 0.5, color: '#ffffff' },
      },
      hovertemplate: '%{text}<br>Total Expense: ₹%{x:,.0f}<br>Total Business: ₹%{y:,.0f}<extra></extra>',
      customdata: t.accounts,
    }));

    return { traces, lineRange: [minV, maxV] as [number, number] };
  }, [accounts]);

  const diagonal = {
    type: 'scatter' as const,
    mode: 'lines' as const,
    x: lineRange,
    y: lineRange,
    line: { color: '#8A94A6', width: 1.5, dash: 'dash' as const },
    hoverinfo: 'skip' as const,
    name: 'Break-even (Business = Expense)',
    showlegend: true,
  };

  return (
    <div className="chart-card wide">
      <div className="chart-title">Total Expense vs Total Business</div>
      <Plot
        data={[diagonal, ...traces]}
        layout={{
          margin: { l: 60, r: 20, t: 6, b: 50 },
          height: 420,
          font: { family: 'Segoe UI, system-ui, sans-serif', size: 12, color: '#152238' },
          xaxis: { title: { text: 'Total Expense (₹, log scale)' }, type: 'log', automargin: true },
          yaxis: { title: { text: 'Total Business (₹, log scale)' }, type: 'log', automargin: true },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          legend: { orientation: 'h', y: -0.22 },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%' }}
        onClick={(e) => {
          const pt = e.points?.[0] as unknown as { customdata?: Account } | undefined;
          if (pt?.customdata) selectAccount(pt.customdata);
        }}
      />
    </div>
  );
}
