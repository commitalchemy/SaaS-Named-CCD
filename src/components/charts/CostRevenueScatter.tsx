import Plot from 'react-plotly.js';
import { useMemo } from 'react';
import type { Account } from '../../types';
import { OUTCOME_COLORS, NAVY_SOFT } from '../../lib/theme';
import { useUiStore } from '../../state/uiStore';

const TOP_N = 100;

/**
 * Top 100 accounts by Total Expense: Total Expense vs Total Business, both
 * raw sheet columns. Log-log axes so the spread of values across two
 * orders of magnitude stays readable. Bubble size = Total Business.
 * The dashed diagonal marks Total Business = Total Expense (break-even):
 * accounts above it earn more than they cost, accounts below it don't.
 * Limiting to the top 100 (rather than plotting all ~2000 accounts) is
 * what keeps the bubbles from piling into an unreadable blob.
 */
export default function CostRevenueScatter({ accounts }: { accounts: Account[] }) {
  const selectAccount = useUiStore((s) => s.selectAccount);

  const { traces, lineRange, shown } = useMemo(() => {
    const valid = accounts.filter(
      (a) => a.totalExpense != null && a.totalExpense > 0 && a.totalBusiness != null && a.totalBusiness > 0
    );
    const top = [...valid].sort((a, b) => (b.totalExpense ?? 0) - (a.totalExpense ?? 0)).slice(0, TOP_N);

    const byOutcome = new Map<
      string,
      { x: number[]; y: number[]; text: string[]; size: number[]; accounts: Account[] }
    >();
    let minV = Infinity;
    let maxV = -Infinity;
    let maxSize = 0;

    top.forEach((a) => {
      const key = a.businessOutcome;
      if (!byOutcome.has(key)) byOutcome.set(key, { x: [], y: [], text: [], size: [], accounts: [] });
      const t = byOutcome.get(key)!;
      const expense = a.totalExpense as number;
      const business = a.totalBusiness as number;
      t.x.push(expense);
      t.y.push(business);
      t.text.push(a.name);
      t.size.push(business);
      t.accounts.push(a);
      minV = Math.min(minV, expense, business);
      maxV = Math.max(maxV, expense, business);
      maxSize = Math.max(maxSize, business);
    });

    const traces = [...byOutcome.entries()].map(([outcome, t]) => ({
      type: 'scatter' as const,
      mode: 'markers' as const,
      name: outcome,
      x: t.x,
      y: t.y,
      text: t.text,
      marker: {
        color: OUTCOME_COLORS[outcome] ?? NAVY_SOFT,
        opacity: 0.78,
        size: t.size,
        sizemode: 'area' as const,
        sizeref: (2 * Math.max(maxSize, 1)) / 46 ** 2,
        sizemin: 7,
        line: { width: 1, color: '#ffffff' },
      },
      hovertemplate: '%{text}<br>Total Expense: ₹%{x:,.0f}<br>Total Business: ₹%{y:,.0f}<extra></extra>',
      customdata: t.accounts,
    }));

    return { traces, lineRange: [minV, maxV] as [number, number], shown: top.length };
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
      <div className="chart-title">
        Total Expense vs Total Business <span className="row-count">(Top {shown} by Total Expense)</span>
      </div>
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
