import Plot from 'react-plotly.js';
import { useMemo, useState } from 'react';
import type { Account } from '../../types';
import { formatINRCompact } from '../../lib/format';
import { useUiStore } from '../../state/uiStore';

const TOP_N = 20;
const ROW_HEIGHT = 26;

type ColumnDef = {
  label: string;
  get: (a: Account) => number | null;
  format: (v: number | null) => string;
};

const COLUMNS: ColumnDef[] = [
  { label: 'Total Business', get: (a) => a.totalBusiness, format: formatINRCompact },
  { label: 'Total Expense', get: (a) => a.totalExpense, format: formatINRCompact },
  { label: 'Platform Cost', get: (a) => a.platformCost, format: formatINRCompact },
  { label: 'Operations Cost', get: (a) => a.operationsCost, format: formatINRCompact },
  { label: 'CS Cost', get: (a) => a.csCost, format: formatINRCompact },
  {
    label: 'Business − Expense',
    get: (a) => (a.totalBusiness != null && a.totalExpense != null ? a.totalBusiness - a.totalExpense : null),
    format: formatINRCompact,
  },
  {
    label: 'Business / Expense',
    get: (a) => (a.totalExpense ? (a.totalBusiness ?? 0) / a.totalExpense : null),
    format: (v) => (v == null ? '—' : `${v.toFixed(2)}×`),
  },
];

const GREEN_SCALE: [number, string][] = [
  [0, '#5FB187'],
  [1, '#0F5C3A'],
];
const RED_SCALE: [number, string][] = [
  [0, '#CC7A7A'],
  [1, '#5A1620'],
];

/**
 * Top 20 accounts by Business − Expense, either the biggest contributors or
 * the biggest losses, laid out as a heat table. Each column's color
 * intensity is normalized against that column's own min/max across the 20
 * rows shown, so every metric reads on its own scale rather than being
 * washed out by ₹-value magnitude differences between columns.
 */
export default function NetContributionHeatmap({ accounts }: { accounts: Account[] }) {
  const selectAccount = useUiStore((s) => s.selectAccount);
  const [mode, setMode] = useState<'top' | 'bottom'>('top');

  const { z, text, customdata, yLabels, height } = useMemo(() => {
    const valid = accounts.filter(
      (a) => a.totalExpense != null && a.totalBusiness != null && !(a.totalExpense === 0 && a.totalBusiness === 0)
    );
    const withNet = valid.map((a) => ({
      account: a,
      net: (a.totalBusiness as number) - (a.totalExpense as number),
    }));
    const sorted =
      mode === 'top'
        ? [...withNet].sort((a, b) => b.net - a.net).slice(0, TOP_N)
        : [...withNet].sort((a, b) => a.net - b.net).slice(0, TOP_N);
    const rows = sorted.map((r) => r.account);

    // Per-column min-max normalization (0-1) for heat intensity.
    const colValues = COLUMNS.map((c) => rows.map((a) => c.get(a)));
    const colZ = colValues.map((vals) => {
      const nums = vals.filter((v): v is number => v != null && Number.isFinite(v));
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const span = max - min || 1;
      return vals.map((v) => (v == null || !Number.isFinite(v) ? null : (v - min) / span));
    });

    const z = rows.map((_, ri) => colZ.map((col) => col[ri]));
    const text = rows.map((a) => COLUMNS.map((c) => c.format(c.get(a))));
    const customdata = rows.map((a) => COLUMNS.map(() => a));

    return {
      z,
      text,
      customdata,
      yLabels: rows.map((a) => a.name),
      height: Math.max(rows.length, 1) * ROW_HEIGHT + 90,
    };
  }, [accounts, mode]);

  return (
    <div className="chart-card wide">
      <div className="chart-title scatter-title-row">
        <span>
          {mode === 'top' ? 'Top 20 Contributors' : 'Top 20 Losses'}{' '}
          <span className="row-count">(by Business − Expense, {yLabels.length} accounts)</span>
        </span>
        <span className="scatter-toggle">
          <button className={mode === 'top' ? 'active' : ''} onClick={() => setMode('top')}>
            Top 20 Contributors
          </button>
          <button className={mode === 'bottom' ? 'active' : ''} onClick={() => setMode('bottom')}>
            Top 20 Losses
          </button>
        </span>
      </div>
      <Plot
        data={[
          {
            type: 'heatmap',
            x: COLUMNS.map((c) => c.label),
            y: yLabels,
            z,
            text,
            texttemplate: '%{text}',
            textfont: { size: 10.5, color: '#ffffff', family: 'Segoe UI, system-ui, sans-serif' },
            colorscale: mode === 'top' ? GREEN_SCALE : RED_SCALE,
            showscale: false,
            xgap: 3,
            ygap: 3,
            hovertemplate: '%{y}<br>%{x}: %{text}<extra></extra>',
            customdata,
          },
        ]}
        layout={{
          margin: { l: 190, r: 10, t: 30, b: 10 },
          height,
          font: { family: 'Segoe UI, system-ui, sans-serif', size: 11.5, color: '#152238' },
          xaxis: { side: 'top', automargin: true, tickangle: -18 },
          yaxis: { automargin: true, autorange: 'reversed' },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
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
