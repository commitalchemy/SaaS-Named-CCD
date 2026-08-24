import Plot from 'react-plotly.js';
import { useMemo, useState } from 'react';
import type { Account } from '../../types';
import { OUTCOME_COLORS, NAVY_SOFT } from '../../lib/theme';
import { formatINRAxis } from '../../lib/format';
import { useUiStore } from '../../state/uiStore';

const TOP_N = 100;

/** "Nice" log-scale tick positions (powers of 10 and their halves), labelled in ₹K/₹L/₹Cr. */
function buildLogTicks(min: number, max: number) {
  const candidates = [
    1e2, 2.5e2, 5e2, 1e3, 2.5e3, 5e3, 1e4, 2.5e4, 5e4, 1e5, 2.5e5, 5e5, 1e6, 2.5e6, 5e6, 1e7, 2.5e7, 5e7, 1e8,
    2.5e8, 5e8, 1e9, 2.5e9, 5e9, 1e10,
  ];
  const lo = min / 2.5;
  const hi = max * 2.5;
  const tickvals = candidates.filter((v) => v >= lo && v <= hi);
  const ticktext = tickvals.map((v) => formatINRAxis(v));
  return { tickvals, ticktext };
}

/**
 * Cost vs Business, both raw sheet columns, log-log scale so the spread of
 * values across several orders of magnitude stays readable and outliers
 * don't flatten the rest of the chart. Two views: Top 100 by Total Expense
 * (the default) or All Accounts. Bubble size is normalized on a log scale
 * (not raw ₹ business value) so a handful of very large accounts don't
 * dwarf every other bubble on screen. The dashed diagonal marks
 * Total Business = Total Expense (break-even): accounts above it earn more
 * than they cost, accounts below it don't.
 */
export default function CostRevenueScatter({ accounts }: { accounts: Account[] }) {
  const selectAccount = useUiStore((s) => s.selectAccount);
  const [mode, setMode] = useState<'top100' | 'all'>('top100');

  const { traces, lineRange, xTicks, yTicks, shown } = useMemo(() => {
    const valid = accounts.filter(
      (a) => a.totalExpense != null && a.totalExpense > 0 && a.totalBusiness != null && a.totalBusiness > 0
    );
    const pool =
      mode === 'top100' ? [...valid].sort((a, b) => (b.totalExpense ?? 0) - (a.totalExpense ?? 0)).slice(0, TOP_N) : valid;

    const byOutcome = new Map<
      string,
      { x: number[]; y: number[]; text: string[]; size: number[]; accounts: Account[] }
    >();
    let minV = Infinity;
    let maxV = -Infinity;
    let maxLogSize = 0;

    pool.forEach((a) => {
      const key = a.businessOutcome;
      if (!byOutcome.has(key)) byOutcome.set(key, { x: [], y: [], text: [], size: [], accounts: [] });
      const t = byOutcome.get(key)!;
      const expense = a.totalExpense as number;
      const business = a.totalBusiness as number;
      const logSize = Math.log10(business + 1);
      t.x.push(expense);
      t.y.push(business);
      t.text.push(a.name);
      t.size.push(logSize);
      t.accounts.push(a);
      minV = Math.min(minV, expense, business);
      maxV = Math.max(maxV, expense, business);
      maxLogSize = Math.max(maxLogSize, logSize);
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
        opacity: mode === 'all' ? 0.55 : 0.78,
        size: t.size,
        sizemode: 'area' as const,
        sizeref: (2 * Math.max(maxLogSize, 1)) / (mode === 'all' ? 30 : 46) ** 2,
        sizemin: 4,
        line: { width: 1, color: '#ffffff' },
      },
      hovertemplate:
        '%{text}<br>Total Expense: ₹%{x:,.0f}<br>Total Business: ₹%{y:,.0f}<extra></extra>',
      customdata: t.accounts,
    }));

    const range: [number, number] = [minV, maxV];
    return {
      traces,
      lineRange: range,
      xTicks: buildLogTicks(minV, maxV),
      yTicks: buildLogTicks(minV, maxV),
      shown: pool.length,
    };
  }, [accounts, mode]);

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
      <div className="chart-title scatter-title-row">
        <span>
          Total Expense vs Total Business{' '}
          <span className="row-count">({shown} accounts shown)</span>
        </span>
        <span className="scatter-toggle">
          <button className={mode === 'top100' ? 'active' : ''} onClick={() => setMode('top100')}>
            Top 100 by Expense
          </button>
          <button className={mode === 'all' ? 'active' : ''} onClick={() => setMode('all')}>
            All Accounts
          </button>
        </span>
      </div>
      <Plot
        data={[diagonal, ...traces]}
        layout={{
          margin: { l: 60, r: 20, t: 6, b: 50 },
          height: 420,
          font: { family: 'Segoe UI, system-ui, sans-serif', size: 12, color: '#152238' },
          xaxis: {
            title: { text: 'Total Expense (log scale)' },
            type: 'log',
            automargin: true,
            tickvals: xTicks.tickvals,
            ticktext: xTicks.ticktext,
          },
          yaxis: {
            title: { text: 'Total Business (log scale)' },
            type: 'log',
            automargin: true,
            tickvals: yTicks.tickvals,
            ticktext: yTicks.ticktext,
          },
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
