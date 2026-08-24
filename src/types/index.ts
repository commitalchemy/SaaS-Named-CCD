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
  /** Verbatim "Utility Count" column value. */
  utilityCount: number | null;
  /** Verbatim "Total Platform Cost" column value. */
  platformCost: number | null;
  /** Verbatim "Total Operations Cost" column value. */
  operationsCost: number | null;
  /** Verbatim "Total CS Cost" column value. */
  csCost: number | null;
  /** Verbatim "Core Collection FY'26" column value. */
  coreCollectionFY26: number | null;
  /** Verbatim "Non-Core Margins" column value. */
  nonCoreMargins: number | null;
  /** Verbatim "Business - Expense" column value. */
  businessMinusExpense: number | null;
  /** Verbatim "CS SPOC" column value. */
  csSpoc: string;
  /** Verbatim "CS Manager" column value. */
  csManager: string;
}

export interface FilterState {
  vertical: string;
  businessStatus: string;
  businessOutcome: string;
  search: string;
}
