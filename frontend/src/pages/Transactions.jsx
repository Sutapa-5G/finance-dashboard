import { useState, useEffect } from 'react';
import API from '../api/axios';
import TransactionForm from '../components/TransactionForm';
import { exportToCSV } from '../utils/exportCSV';

const CATEGORIES = ['All','Food','Travel','Bills','Entertainment','Shopping',
  'Healthcare','Education','Salary','Freelance','Investment','Other'];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [filters, setFilters]           = useState({
    type: '', category: 'All', startDate: '', endDate: ''
  });

  const setFilter = (key) => (e) => setFilters(p => ({ ...p, [key]: e.target.value }));

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate)   params.endDate   = filters.endDate;

      const { data } = await API.get('/transactions', { params });
      setTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await API.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch {
      alert('Could not delete');
    }
  };

  const handleEdit = (t) => { setEditTarget(t); setShowForm(true); };

  const selectClass = `border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2
    text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-primary`;

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(transactions)}
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
                       px-4 py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Export CSV
          </button>
          <button onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-xl
                       text-sm font-medium transition">
            + Add
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm
                      grid grid-cols-2 md:grid-cols-4 gap-3">
        <select value={filters.type} onChange={setFilter('type')} className={selectClass}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select value={filters.category} onChange={setFilter('category')} className={selectClass}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>

        <input type="date" value={filters.startDate} onChange={setFilter('startDate')}
          className={selectClass} />
        <input type="date" value={filters.endDate} onChange={setFilter('endDate')}
          className={selectClass} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['Date','Title','Category','Type','Amount','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold
                                         text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No transactions found
                  </td>
                </tr>
              ) : transactions.map(t => (
                <tr key={t.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {t.date}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                    {t.title}
                    {t.isRecurring && (
                      <span className="ml-1.5 text-xs text-indigo-400">recurring</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700
                                     dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${t.type === 'income'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-semibold
                    ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}Rs.{Number(t.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleEdit(t)}
                      className="text-indigo-500 hover:text-indigo-700 text-xs mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(t.id)}
                      className="text-red-400 hover:text-red-600 text-xs">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          existing={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSuccess={() => { setShowForm(false); setEditTarget(null); fetchTransactions(); }}
        />
      )}
    </div>
  );
}