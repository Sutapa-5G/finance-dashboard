import { useState } from 'react';
import API from '../api/axios';

const CATEGORIES = ['Food','Travel','Bills','Entertainment','Shopping',
  'Healthcare','Education','Salary','Freelance','Investment','Other'];

export default function TransactionForm({ onClose, onSuccess, existing }) {
  const [form, setForm] = useState({
    title:             existing?.title            || '',
    amount:            existing?.amount           || '',
    type:              existing?.type             || 'expense',
    category:          existing?.category         || 'Food',
    date:              existing?.date             || new Date().toISOString().split('T')[0],
    note:              existing?.note             || '',
    isRecurring:       existing?.isRecurring      || false,
    recurringInterval: existing?.recurringInterval || 'monthly',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (existing?.id) {
        await API.put(`/transactions/${existing.id}`, form);
      } else {
        await API.post('/transactions', form);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save transaction');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {existing ? 'Edit transaction' : 'Add transaction'}
          </h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">
            x
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
            {['expense', 'income'].map(t => (
              <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                className={`flex-1 py-2 text-sm font-medium capitalize transition
                  ${form.type === t
                    ? t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                {t}
              </button>
            ))}
          </div>

          <input required placeholder="Title e.g. Grocery shopping"
            value={form.title} onChange={set('title')} className={inputClass} />

          <input required type="number" min="0.01" step="0.01" placeholder="Amount (Rs.)"
            value={form.amount} onChange={set('amount')} className={inputClass} />

          <select value={form.category} onChange={set('category')} className={inputClass}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          <input type="date" value={form.date} onChange={set('date')} className={inputClass} />

          <textarea placeholder="Note (optional)" value={form.note} onChange={set('note')}
            rows={2} className={`${inputClass} resize-none`} />

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={form.isRecurring} onChange={set('isRecurring')}
              className="accent-primary" />
            Recurring transaction
          </label>

          {form.isRecurring && (
            <select value={form.recurringInterval} onChange={set('recurringInterval')} className={inputClass}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-indigo-600 text-white font-semibold
                       rounded-xl transition disabled:opacity-60 text-sm mt-1">
            {loading ? 'Saving...' : existing ? 'Update' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}