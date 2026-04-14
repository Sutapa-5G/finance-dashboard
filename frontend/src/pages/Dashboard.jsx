import { useState, useEffect } from 'react';
import API from '../api/axios';
import PieChartCard from '../components/charts/PieChartCard';
import BarChartCard from '../components/charts/BarChartCard';
import LineChartCard from '../components/charts/LineChartCard';
import TransactionForm from '../components/TransactionForm';
import BudgetAlert from '../components/BudgetAlert';

const StatCard = ({ label, value, borderColor }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border-l-4 ${borderColor} shadow-sm`}>
    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">
      Rs.{Number(value || 0).toLocaleString('en-IN')}
    </p>
  </div>
);

export default function Dashboard() {
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [byCategory, setByCategory]       = useState([]);
  const [trend, setTrend]                 = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [loading, setLoading]             = useState(true);

  const now = new Date();

  const fetchDashboard = async () => {
    try {
      const { data } = await API.get('/transactions/summary', {
        params: { month: now.getMonth(), year: now.getFullYear() }
      });
      setMonthlyTotals(data.monthlyTotals);
      setByCategory(data.byCategory.map(d => ({
        name: d.category,
        value: Number(d.total)
      })));
      setTrend(data.trend);
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const totals = monthlyTotals.reduce((acc, row) => {
    acc[row.type] = Number(row.total);
    return acc;
  }, { income: 0, expense: 0 });

  const balance = totals.income - totals.expense;

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-indigo-600 text-white text-sm font-medium
                     px-4 py-2.5 rounded-xl transition shadow-sm">
          + Add Transaction
        </button>
      </div>

      <BudgetAlert byCategory={byCategory} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Income"   value={totals.income}  borderColor="border-green-500" />
        <StatCard label="Expenses" value={totals.expense} borderColor="border-red-500" />
        <StatCard label="Balance"  value={balance}
          borderColor={balance >= 0 ? 'border-indigo-500' : 'border-orange-500'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartCard data={byCategory} />
        <BarChartCard data={trend} />
      </div>

      <LineChartCard data={trend} />

      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchDashboard(); }}
        />
      )}
    </div>
  );
}