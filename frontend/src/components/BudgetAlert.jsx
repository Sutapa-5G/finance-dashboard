import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function BudgetAlert({ byCategory }) {
  const [budgets, setBudgets] = useState([]);
  const now = new Date();

  useEffect(() => {
    API.get('/budgets', {
      params: { month: now.getMonth(), year: now.getFullYear() }
    })
    .then(res => setBudgets(res.data.budgets))
    .catch(() => {});
  }, []);

  const alerts = budgets.reduce((acc, budget) => {
    const spent = byCategory.find(c => c.name === budget.category)?.value || 0;
    const pct = (spent / budget.limitAmount) * 100;
    if (pct >= 80) acc.push({ ...budget, spent, pct });
    return acc;
  }, []);

  if (!alerts.length) return null;

  return (
    <div className="space-y-2">
      {alerts.map(a => (
        <div key={a.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm border
            ${a.pct >= 100
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
            }`}>
          <span>{a.pct >= 100 ? 'OVER BUDGET' : 'WARNING'}</span>
          <span className="flex-1">
            <strong>{a.category}</strong>
            {a.pct >= 100
              ? ` - Budget exceeded! Rs.${a.spent.toLocaleString('en-IN')} / Rs.${a.limitAmount.toLocaleString('en-IN')}`
              : ` - ${Math.round(a.pct)}% used (Rs.${a.spent.toLocaleString('en-IN')} of Rs.${a.limitAmount.toLocaleString('en-IN')})`
            }
          </span>
          <div className="w-20 bg-white/50 rounded-full h-1.5 shrink-0">
            <div
              className={`h-1.5 rounded-full ${a.pct >= 100 ? 'bg-red-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(a.pct, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}