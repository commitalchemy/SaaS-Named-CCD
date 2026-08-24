import Plot from 'react-plotly.js';
import { useMemo } from 'react';
import type { Account } from '../../types';
import { VERTICAL_PALETTE } from '../../lib/theme';

export default function VerticalChart({ accounts }: { accounts: Account[] }) {
  // Straight read from the sheet: raw counts per Vertical value, only the
  // blank ("Unspecified") bucket excluded. No other business-rule filtering.
  const { labels, values, colors } = useMemo(() => {
    const counts = new Map<string, number>();
    accounts
      .filter((a) => a.vertical !== 'Unspecified')
      .forEach((a) => counts.set(a.vertical, (counts.get(a.vertical) ?? 0) + 1));
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return {
      labels: entries.map((e) => e[0]),
      values: entries.map((e) => e[1]),
      colors: entries.map((_, i) => VERTICAL_PALETTE[i % VERTICAL_PALETTE.length]),
    };
  }, [accounts]);

  return (
    <div className="chart-card">
      <div className="chart-title">Accounts by Vertical</div>
      <Plot
        data={[
          {
            type: 'bar',
            x: labels,
            y: values,
            marker: { color: colors },
            text: values.map(String),
            textposition: 'outside',
            hovertemplate: '%{x}: %{y} accounts<extra></extra>',
          },
        ]}
        layout={{
          margin: { l: 40, r: 10, t: 6, b: 70 },
          height: 260,
          font: { family: 'Segoe UI, system-ui, sans-serif', size: 12, color: '#152238' },
          xaxis: { automargin: true, tickangle: -30 },
          yaxis: { title: { text: 'Accounts' }, automargin: true },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          showlegend: false,
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%' }}
      />
    </div>
  );
}
