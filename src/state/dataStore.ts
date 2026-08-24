import { create } from 'zustand';
import * as XLSX from 'xlsx';
import type { Account } from '../types';
import { buildGoogleSheetCsvUrl, parseWorkbookToAccounts } from '../data/parseAccounts';

export type DataStatus = 'empty' | 'ready';
export type SourceType = 'file' | 'gsheet' | null;

interface DataStore {
  accounts: Account[];
  status: DataStatus;
  loading: boolean;
  error: string | null;
  sourceType: SourceType;
  sourceLabel: string | null;
  gsheetCsvUrl: string | null;
  lastUpdated: Date | null;
  loadFromFile: (file: File) => Promise<void>;
  loadFromGSheet: (url: string) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export const useDataStore = create<DataStore>((set, get) => ({
  accounts: [],
  status: 'empty',
  loading: false,
  error: null,
  sourceType: null,
  sourceLabel: null,
  gsheetCsvUrl: null,
  lastUpdated: null,

  loadFromFile: async (file) => {
    set({ loading: true, error: null });
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
      const accounts = parseWorkbookToAccounts(wb);
      set({
        accounts,
        status: 'ready',
        loading: false,
        error: null,
        sourceType: 'file',
        sourceLabel: file.name,
        gsheetCsvUrl: null,
        lastUpdated: new Date(),
      });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Could not read that file.' });
    }
  },

  loadFromGSheet: async (url) => {
    set({ loading: true, error: null });
    try {
      const csvUrl = buildGoogleSheetCsvUrl(url);
      const res = await fetch(csvUrl, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(
          `Google Sheets returned an error (${res.status}). Make sure the sheet is shared as "Anyone with the link — Viewer", or published to the web as CSV.`
        );
      }
      const text = await res.text();
      const wb = XLSX.read(text, { type: 'string' });
      const accounts = parseWorkbookToAccounts(wb);
      set({
        accounts,
        status: 'ready',
        loading: false,
        error: null,
        sourceType: 'gsheet',
        sourceLabel: url,
        gsheetCsvUrl: csvUrl,
        lastUpdated: new Date(),
      });
    } catch (e) {
      set({
        loading: false,
        error:
          e instanceof Error
            ? e.message
            : 'Could not load that Google Sheet. Make sure it is shared as "Anyone with the link — Viewer", or upload a file instead.',
      });
    }
  },

  refresh: async () => {
    const { sourceType, gsheetCsvUrl } = get();
    if (sourceType !== 'gsheet' || !gsheetCsvUrl) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch(gsheetCsvUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Refresh failed (${res.status}). Try again in a moment.`);
      const text = await res.text();
      const wb = XLSX.read(text, { type: 'string' });
      const accounts = parseWorkbookToAccounts(wb);
      set({ accounts, loading: false, error: null, lastUpdated: new Date() });
    } catch (e) {
      // Keep the last good data visible; surface the failure without wiping the dashboard.
      set({ loading: false, error: e instanceof Error ? e.message : 'Refresh failed.' });
    }
  },

  reset: () =>
    set({
      accounts: [],
      status: 'empty',
      loading: false,
      error: null,
      sourceType: null,
      sourceLabel: null,
      gsheetCsvUrl: null,
      lastUpdated: null,
    }),
}));
