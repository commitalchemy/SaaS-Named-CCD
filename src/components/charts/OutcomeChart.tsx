import Plot from 'react-plotly.js';
import { useMemo } from 'react';
import type { Account } from '../../types';
import { OUTCOME_COLORS, NAVY_SOFT } from '../../lib/theme';

export default function OutcomeChart({ accounts }: { accounts: Account[] }) {
  const { labels, values, colors } = useMemo(() => {
    const counts = new Map<string, number>();
    accounts
      .filter(
        (a) =>
          a.vertical !== 'Accounts' &&
          a.businessStatus !== 'Internal Account' &&
          a.businessStatus !== 'Internal Accounts'
      )
      .forEach((a) => counts.set(a.businessOutcome, (counts.get(a.businessOutcome) ?? 0) + 1));
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return {
      labels: entries.map((e) => e[0]),
      values: entries.map((e) => e[1]),
      colors: entries.map((e) => OUTCOME_COLORS[e[0]] ?? NAVY_SOFT),
    };
  }, [accounts]);

  return (
    <div className="chart-card">
      <div className="chart-title">Accounts by Business Outcome</div>
      <Plot
        data={[
          {
            type: 'bar',
            x: values,
            y: labels,
            orientation: 'h',
            marker: { color: colors },
            text: values.map(String),
            textposition: 'outside',
            hovertemplate: '%{y}: %{x} accounts<extra></extra>',
          },
        ]}
        layout={{
          margin: { l: 10, r: 30, t: 6, b: 30 },
          height: 260,
          font: { family: 'Segoe UI, system-ui, sans-serif', size: 12, color: '#152238' },
          xaxis: { title: { text: 'Accounts' }, automargin: true },
          yaxis: { automargin: true, autorange: 'reversed' },
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
