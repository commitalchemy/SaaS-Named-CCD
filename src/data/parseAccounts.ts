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

/** Same "blank -> Unspecified" treatment, for Business Status / Business Outcome / CS text. */
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
  utilityCount: ['utility count'],
  platformCost: ['total platform cost', 'platform cost'],
  operationsCost: ['total operations cost', 'operations cost'],
  csCost: ['total cs cost', 'cs cost'],
  coreCollectionFY26: ["core collection fy'26", 'core collection fy26', 'core collection'],
  nonCoreMargins: ['non-core margins', 'non core margins'],
  businessMinusExpense: ['business - expense', 'business – expense', 'business-expense'],
  csSpoc: ['cs spoc'],
  csManager: ['cs manager'],
  csHead: ['cs head'],
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
 * columns as the "SaaS Name Mapping" tab. Rows with a blank Saas Name are
 * dropped entirely — they never enter calculations or display anywhere in
 * the app, since this is the single point all account data flows through.
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
    utilityCount: findColumnIndex(headerRow, HEADER_ALIASES.utilityCount),
    platformCost: findColumnIndex(headerRow, HEADER_ALIASES.platformCost),
    operationsCost: findColumnIndex(headerRow, HEADER_ALIASES.operationsCost),
    csCost: findColumnIndex(headerRow, HEADER_ALIASES.csCost),
    coreCollectionFY26: findColumnIndex(headerRow, HEADER_ALIASES.coreCollectionFY26),
    nonCoreMargins: findColumnIndex(headerRow, HEADER_ALIASES.nonCoreMargins),
    businessMinusExpense: findColumnIndex(headerRow, HEADER_ALIASES.businessMinusExpense),
    csSpoc: findColumnIndex(headerRow, HEADER_ALIASES.csSpoc),
    csManager: findColumnIndex(headerRow, HEADER_ALIASES.csManager),
    csHead: findColumnIndex(headerRow, HEADER_ALIASES.csHead),
  };

  if (idx.name === -1) {
    throw new SheetParseError(
      `Couldn't find a "Saas Name" column in "${sheetName}". Expected headers like Saas Name, Vertical, Business Status, Business Outcome, Total Expense, Total Business.`
    );
  }

  const get = (row: unknown[], i: number) => (i !== -1 ? row[i] : null);

  const accounts: Account[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;

    const rawName = get(row, idx.name);
    const name = rawName == null ? '' : String(rawName).trim();
    // Blank SaaS Name -> exclude the row entirely (not just hide it downstream).
    if (name === '') continue;

    accounts.push({
      name,
      vertical: normalizeVertical(get(row, idx.vertical) == null ? '' : String(get(row, idx.vertical))),
      businessStatus: cleanLabel(get(row, idx.businessStatus)),
      businessOutcome: cleanLabel(get(row, idx.businessOutcome)),
      totalExpense: toNumber(get(row, idx.totalExpense)),
      totalBusiness: toNumber(get(row, idx.totalBusiness)),
      utilityCount: toNumber(get(row, idx.utilityCount)),
      platformCost: toNumber(get(row, idx.platformCost)),
      operationsCost: toNumber(get(row, idx.operationsCost)),
      csCost: toNumber(get(row, idx.csCost)),
      coreCollectionFY26: toNumber(get(row, idx.coreCollectionFY26)),
      nonCoreMargins: toNumber(get(row, idx.nonCoreMargins)),
      businessMinusExpense: toNumber(get(row, idx.businessMinusExpense)),
      csSpoc: cleanLabel(get(row, idx.csSpoc)),
      csManager: cleanLabel(get(row, idx.csManager)),
      csHead: cleanLabel(get(row, idx.csHead)),
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
