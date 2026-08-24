import { useUiStore } from '../../state/uiStore';
import { OUTCOME_COLORS } from '../../lib/theme';
import { formatINRCompact } from '../../lib/format';

const fmtInt = (n: number | null) => (n == null ? '—' : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n));

export default function AccountDrawer() {
  const account = useUiStore((s) => s.selectedAccount);
  const selectAccount = useUiStore((s) => s.selectAccount);

  const open = account !== null;

  const fields = account
    ? [
        { label: 'Utility Count', value: fmtInt(account.utilityCount) },
        { label: 'Platform Cost', value: formatINRCompact(account.platformCost) },
        { label: 'Operations Cost', value: formatINRCompact(account.operationsCost) },
        { label: 'CS Cost', value: formatINRCompact(account.csCost) },
        { label: 'Expense', value: formatINRCompact(account.totalExpense) },
        { label: 'Business', value: formatINRCompact(account.totalBusiness) },
        { label: "Core Collection FY'26", value: formatINRCompact(account.coreCollectionFY26) },
        { label: 'Non-Core Margins', value: formatINRCompact(account.nonCoreMargins) },
        { label: 'Business − Expense', value: formatINRCompact(account.businessMinusExpense) },
        { label: 'CS SPOC', value: account.csSpoc },
        { label: 'CS Manager', value: account.csManager },
      ]
    : [];

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={() => selectAccount(null)} />
      <aside className={`drawer ${open ? 'open' : ''}`}>
        {account ? (
          <>
            <div className="drawer-header">
              <span>Account Detail</span>
              <button className="drawer-close" onClick={() => selectAccount(null)}>
                ✕
              </button>
            </div>
            <div className="drawer-body">
              <h2>{account.name}</h2>
              <span
                className="outcome-pill drawer-pill"
                style={{
                  backgroundColor: (OUTCOME_COLORS[account.businessOutcome] ?? '#5B6472') + '22',
                  color: OUTCOME_COLORS[account.businessOutcome] ?? '#5B6472',
                }}
              >
                {account.businessOutcome}
              </span>

              <div className="drawer-field">
                <label>Vertical</label>
                <span>{account.vertical}</span>
              </div>
              <div className="drawer-field">
                <label>Business Status</label>
                <span>{account.businessStatus}</span>
              </div>
              {fields.map((f) => (
                <div className="drawer-field" key={f.label}>
                  <label>{f.label}</label>
                  <span>{f.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}
