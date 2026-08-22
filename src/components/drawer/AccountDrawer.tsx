import { useUiStore } from '../../state/uiStore';
import { OUTCOME_COLORS } from '../../lib/theme';

const fmtMoney = (n: number | null) =>
  n == null ? '—' : '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

export default function AccountDrawer() {
  const account = useUiStore((s) => s.selectedAccount);
  const selectAccount = useUiStore((s) => s.selectAccount);

  const open = account !== null;

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
              <div className="drawer-field">
                <label>Total Expense</label>
                <span>{fmtMoney(account.totalExpense)}</span>
              </div>
              <div className="drawer-field">
                <label>Total Business</label>
                <span>{fmtMoney(account.totalBusiness)}</span>
              </div>
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}
