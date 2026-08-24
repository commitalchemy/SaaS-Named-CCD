import { useDataStore } from '../../state/dataStore';

const fmtTime = (d: Date) =>
  d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function DataSourceBar() {
  const sourceType = useDataStore((s) => s.sourceType);
  const sourceLabel = useDataStore((s) => s.sourceLabel);
  const lastUpdated = useDataStore((s) => s.lastUpdated);
  const loading = useDataStore((s) => s.loading);
  const error = useDataStore((s) => s.error);
  const refresh = useDataStore((s) => s.refresh);
  const reset = useDataStore((s) => s.reset);

  return (
    <div className="datasource-bar">
      <span>
        Source: <strong>{sourceType === 'gsheet' ? 'Google Sheet' : sourceLabel}</strong>
        {lastUpdated ? <> · Updated {fmtTime(lastUpdated)}</> : null}
      </span>
      {error ? <span className="datasource-bar-error">{error}</span> : null}
      {sourceType === 'gsheet' ? (
        <button className="datasource-bar-btn" onClick={() => void refresh()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      ) : null}
      <button className="datasource-bar-btn" onClick={reset} disabled={loading}>
        Change source
      </button>
    </div>
  );
}
