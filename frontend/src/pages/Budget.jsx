import { useState, useEffect } from 'react';
import API from '../api/axios';

const CATEGORIES = ['Food','Travel','Bills','Entertainment','Shopping',
  'Healthcare','Education','Other'];

export default function Budget() {
  const [budgets, setBudgets]   = useState([]);
  const [category, setCategory] = useState('Food');
  const [limit, setLimit]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const now = new Date();

  const fetchBudgets = async () => {
    try {
      const { data } = await API.get('/budgets', {
        params: { month: now.getMonth(), year: now.getFullYear() }
      });
      setBudgets(data.budgets);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await API.post('/budgets', {
        category,
        limitAmount: Number(limit),
        month: now.getMonth(),
        year: now.getFullYear()
      });
      setLimit('');
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await API.delete(`/budgets/${id}`);
    fetchBudgets();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Budget limits</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Set monthly spending limits per category. You will get a warning at 80%.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Set budget for {now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
        </h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSave} className="flex gap-3 flex-wrap">
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-primary flex-1 min-w-[140px]">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          <input type="number" required min="1" step="1" placeholder="Limit (Rs.)"
            value={limit} onChange={e => setLimit(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-primary flex-1 min-w-[120px]" />

          <button type="submit" disabled={saving}
            className="bg-primary hover:bg-indigo-600 text-white px-5 py-2 rounded-xl
                       text-sm font-medium transition disabled:opacity-60 shrink-0">
            {saving ? 'Saving...' : 'Set budget'}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {budgets.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            No budgets set for this month yet
          </p>
        ) : budgets.map(b => (
          <div key={b.id}
            className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 shadow-sm
                       flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.category}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Limit: Rs.{Number(b.limitAmount).toLocaleString('en-IN')}
              </p>
            </div>
            <button onClick={() => handleDelete(b.id)}
              className="text-xs text-red-400 hover:text-red-600">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}