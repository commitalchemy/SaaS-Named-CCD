# Cost Correction Dashboard

A Revenue Operations dashboard for identifying SaaS/customer accounts whose
commercial value is disproportionate to the product and operational
resources they consume.

## Data source

The **only** dashboard-facing dataset is the `SaaS Name Mapping` sheet in
the workbook (CSV/XLSX upload in-app). The parser targets that sheet by
name and falls back to the first sheet — with the loaded sheet name
reported in the header — if it isn't found. Falcon-level detail is not
required by the app.

## Metric model

- **PUUC** (value / commercial efficiency) = `Core Collection FY'26 / Utility Count`
- **Platform Cost / Utility** = `Total Platform Cost / Utility Count`
- **Operations Cost / Utility** = `Total Operations Cost / Utility Count`
- **Deviation** = `(value − vertical median) / vertical median`, using the median (not average)
- Higher cost-per-utility than the vertical median = worse.

### Benchmark population

Vertical medians (for all three metrics, and for the separate stable
benchmark used in Correction Opportunity) are computed **only** from
accounts with `Business Status = Existing` and `Utility Count > 0`.
Churned and New accounts do not influence any benchmark, but still get
their own metrics/deviations computed and remain visible everywhere for
historical comparison.

Leadership-facing action numbers — portfolio KPI totals, Cost Correction
Accounts, Financial Exposure, and the Top 10 ranking — are restricted to
Existing accounts only, since Churned/New accounts aren't correctable.
Charts and the full account table show all statuses.

## Classification

Six-way, computed only from `platformDeviation` / `opsDeviation` (never
from the sheet's own Business Outcome/Rank columns): `no-utility`,
`both-high`, `platform-only`, `ops-only`, `healthy`, `undetermined`, using
a ±20% threshold.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint      # oxlint
```
