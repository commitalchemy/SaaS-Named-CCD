import { useRef, useState } from 'react';
import { useDataStore } from '../../state/dataStore';

export default function DataSourceScreen() {
  const loading = useDataStore((s) => s.loading);
  const error = useDataStore((s) => s.error);
  const loadFromFile = useDataStore((s) => s.loadFromFile);
  const loadFromGSheet = useDataStore((s) => s.loadFromGSheet);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [gsheetUrl, setGsheetUrl] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void loadFromFile(file);
    e.target.value = '';
  }

  function handleGSheetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (gsheetUrl.trim()) void loadFromGSheet(gsheetUrl);
  }

  return (
    <div className="datasource-screen">
      <div className="datasource-card">
        <h2>Connect your data</h2>
        <p className="intro">
          Load the "SaaS Name Mapping" sheet to populate the dashboard. Nothing loads until you provide it.
        </p>

        <div className="datasource-section">
          <h3>Upload a file</h3>
          <label className="datasource-file-label">
            {loading ? 'Loading…' : 'Click to choose a .csv or .xlsx file'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>
        </div>

        <div className="datasource-section">
          <h3>Or connect a Google Sheet</h3>
          <form className="datasource-row" onSubmit={handleGSheetSubmit}>
            <input
              type="text"
              placeholder="Paste Google Sheets link…"
              value={gsheetUrl}
              onChange={(e) => setGsheetUrl(e.target.value)}
              disabled={loading}
            />
            <button className="datasource-btn" type="submit" disabled={loading || !gsheetUrl.trim()}>
              {loading ? 'Loading…' : 'Load sheet'}
            </button>
          </form>
          <p className="datasource-hint">
            The sheet must be viewable without logging in — share it as "Anyone with the link — Viewer", or use
            File → Share → Publish to web → CSV. You can refresh it from the dashboard any time.
          </p>
        </div>

        {error ? <div className="datasource-error">{error}</div> : null}

        <div className="datasource-columns">
          Expected columns: Saas Name, Vertical, Business Status, Business Outcome, Total Expense, Total Business.
        </div>
      </div>
    </div>
  );
}
