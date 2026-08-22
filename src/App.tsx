import FilterBar from './components/filters/FilterBar';
import KpiCards from './components/kpis/KpiCards';
import OutcomeChart from './components/charts/OutcomeChart';
import VerticalChart from './components/charts/VerticalChart';
import CostRevenueScatter from './components/charts/CostRevenueScatter';
import AccountsTable from './components/table/AccountsTable';
import AccountDrawer from './components/drawer/AccountDrawer';
import { useFilteredAccounts } from './state/useFilteredAccounts';

export default function App() {
  const accounts = useFilteredAccounts();

  return (
    <main className="app">
      <header className="top-bar">
        <h1>Cost Correction Intelligence</h1>
      </header>

      <FilterBar />
      <KpiCards accounts={accounts} />

      <div className="chart-grid">
        <OutcomeChart accounts={accounts} />
        <VerticalChart accounts={accounts} />
      </div>

      <CostRevenueScatter accounts={accounts} />

      <AccountsTable accounts={accounts} />

      <AccountDrawer />
    </main>
  );
}
