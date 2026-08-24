import FilterBar from './components/filters/FilterBar';
import KpiCards from './components/kpis/KpiCards';
import OutcomeChart from './components/charts/OutcomeChart';
import VerticalChart from './components/charts/VerticalChart';
import NetContributionHeatmap from './components/charts/NetContributionHeatmap';
import AccountsTable from './components/table/AccountsTable';
import AccountDrawer from './components/drawer/AccountDrawer';
import DataSourceScreen from './components/datasource/DataSourceScreen';
import DataSourceBar from './components/datasource/DataSourceBar';
import { useFilteredAccounts } from './state/useFilteredAccounts';
import { useDataStore } from './state/dataStore';

export default function App() {
  const status = useDataStore((s) => s.status);
  const accounts = useFilteredAccounts();

  return (
    <main className="app">
      <header className="top-bar">
        <h1>Cost Correction Intelligence</h1>
      </header>

      {status === 'empty' ? (
        <DataSourceScreen />
      ) : (
        <>
          <DataSourceBar />
          <FilterBar />
          <KpiCards accounts={accounts} />

          <div className="chart-grid">
            <OutcomeChart accounts={accounts} />
            <VerticalChart accounts={accounts} />
          </div>

          <NetContributionHeatmap accounts={accounts} />

          <AccountsTable accounts={accounts} />

          <AccountDrawer />
        </>
      )}
    </main>
  );
}
