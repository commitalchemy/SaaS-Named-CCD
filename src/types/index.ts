/**
 * A single account row, taken verbatim from the "SaaS Name Mapping" sheet.
 * No derived/computed business metrics — every field here is a direct
 * column value from the sheet (or a blank-fallback label).
 */
export interface Account {
  name: string;
  vertical: string;
  businessStatus: string;
  /** Verbatim "Business Outcome" text from the sheet. */
  businessOutcome: string;
  /** Verbatim "Total Expense" column value. */
  totalExpense: number | null;
  /** Verbatim "Total Business" column value. */
  totalBusiness: number | null;
}

export interface FilterState {
  vertical: string;
  businessStatus: string;
  businessOutcome: string;
  search: string;
}
