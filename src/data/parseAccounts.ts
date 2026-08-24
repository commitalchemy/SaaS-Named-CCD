import * as XLSX from 'xlsx';
import type { Account } from '../types';

/**
 * Collapses spelling/casing variants of the same vertical into one label.
 * This is display-only text normalization (not a business calculation).
 * Anything blank / "#N/A" / "N/A" is labelled "Unspecified" rather than
 * dropped, so the account is still counted everywhere.
 */
export function normalizeVertical(v: string): string {
  const t = v.trim().toLowerCase();
  if (t === '#n/a' || t === 'n/a' || t === '') return 'Unspecified';
  if (t === 'ed-tech' || t === 'edtech') return 'EdTech';
  if (t === 'k-12' || t === 'k-12 schools' || t === 'k12') return 'K-12 Schools';
  if (t === 'coaching & training institute' || t === 'coaching & training institutes')
    return 'Coaching & Training Institutes';
  if (t === 'companies' || t === 'company') return 'Companies';
  return v.trim();
}

/** Same "blank -> Unspecified" treatment, for Business Status / Business Outcome text. */
function cleanLabel(v: unknown): string {
  const s = v == null ? '' : String(v).trim();
  if (s === '' || s.toLowerCase() === '#n/a' || s.toLowerCase() === 'n/a') return 'Unspecified';
  return s;
}

function toNumber(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).trim();
  if (s === '') return null;
  const cleaned = s.replace(/[₹$,\s]/g, '');
  if (cleaned === '' || cleaned === '-') return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function normalizeHeader(h: unknown): string {
  return String(h ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

const HEADER_ALIASES = {
  name: ['saas name', 'name', 'account name', 'account'],
  vertical: ['vertical'],
  businessStatus: ['business status', 'status'],
  businessOutcome: ['business outcome', 'outcome'],
  totalExpense: ['total expense', 'expense'],
  totalBusiness: ['total business', 'business'],
} as const;

function findColumnIndex(headers: string[], aliases: readonly string[]): number {
  for (const alias of aliases) {
    const i = headers.indexOf(alias);
    if (i !== -1) return i;
  }
  return -1;
}

/** Prefer a sheet that looks like the "SaaS Name Mapping" tab; else use the first sheet. */
function pickSheetName(wb: XLSX.WorkBook): string {
  const named = wb.SheetNames.find((n) => {
    const t = n.toLowerCase();
    return t.includes('saas') && t.includes('map');
  });
  return named ?? wb.SheetNames[0];
}

export class SheetParseError extends Error {}

/**
 * Reads a parsed SheetJS workbook (from an uploaded CSV/XLSX file, or a
 * fetched Google Sheet CSV export) and maps it to Account[] using the same
 * columns as the "SaaS Name Mapping" tab: Saas Name, Vertical, Business
 * Status, Business Outcome, Total Expense, Total Business. Every account
 * row is kept — existing, new, churned, and blanks alike; nothing is
 * filtered out here.
 */
export function parseWorkbookToAccounts(wb: XLSX.WorkBook): Account[] {
  if (!wb.SheetNames.length) throw new SheetParseError('That file has no sheets.');
  const sheetName = pickSheetName(wb);
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null }) as unknown[][];
  if (!rows.length) throw new SheetParseError(`The "${sheetName}" sheet is empty.`);

  const headerRow = rows[0].map(normalizeHeader);
  const idx = {
    name: findColumnIndex(headerRow, HEADER_ALIASES.name),
    vertical: findColumnIndex(headerRow, HEADER_ALIASES.vertical),
    businessStatus: findColumnIndex(headerRow, HEADER_ALIASES.businessStatus),
    businessOutcome: findColumnIndex(headerRow, HEADER_ALIASES.businessOutcome),
    totalExpense: findColumnIndex(headerRow, HEADER_ALIASES.totalExpense),
    totalBusiness: findColumnIndex(headerRow, HEADER_ALIASES.totalBusiness),
  };

  if (idx.name === -1) {
    throw new SheetParseError(
      `Couldn't find a "Saas Name" column in "${sheetName}". Expected headers like Saas Name, Vertical, Business Status, Business Outcome, Total Expense, Total Business.`
    );
  }

  const accounts: Account[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;

    const rawName = row[idx.name];
    const rawVertical = idx.vertical !== -1 ? row[idx.vertical] : null;
    const rawStatus = idx.businessStatus !== -1 ? row[idx.businessStatus] : null;
    const rawOutcome = idx.businessOutcome !== -1 ? row[idx.businessOutcome] : null;
    const rawExpense = idx.totalExpense !== -1 ? row[idx.totalExpense] : null;
    const rawBusiness = idx.totalBusiness !== -1 ? row[idx.totalBusiness] : null;

    const isRowEmpty = [rawName, rawVertical, rawStatus, rawOutcome, rawExpense, rawBusiness].every(
      (v) => v == null || String(v).trim() === ''
    );
    if (isRowEmpty) continue;

    const name = rawName == null ? '' : String(rawName).trim();

    accounts.push({
      name: name === '' ? '(Unnamed account)' : name,
      vertical: normalizeVertical(rawVertical == null ? '' : String(rawVertical)),
      businessStatus: cleanLabel(rawStatus),
      businessOutcome: cleanLabel(rawOutcome),
      totalExpense: toNumber(rawExpense),
      totalBusiness: toNumber(rawBusiness),
    });
  }

  return accounts;
}

/**
 * Turns a Google Sheets link the user pastes in (normal share link, a link
 * with #gid=..., or a "Publish to web" link) into a CSV export URL we can
 * fetch client-side. The sheet must be viewable without login — either
 * shared as "Anyone with the link", or published to the web.
 */
export function buildGoogleSheetCsvUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new SheetParseError('Paste a Google Sheets link first.');

  if (/output=csv/.test(trimmed) || /\/export\?format=csv/.test(trimmed)) {
    return trimmed;
  }

  const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : null;

  // "Publish to web" links look like /d/e/<long-id>/pubhtml or /pub
  const pubMatch = trimmed.match(/\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (pubMatch) {
    return `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/pub?output=csv${gid ? `&gid=${gid}` : ''}`;
  }

  // Standard share/edit links look like /d/<id>/edit#gid=0
  const idMatch = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch) {
    return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv&gid=${gid ?? '0'}`;
  }

  throw new SheetParseError("That doesn't look like a Google Sheets link.");
}
