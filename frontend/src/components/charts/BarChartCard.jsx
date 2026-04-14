import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const processData = (trend) => {
  const map = {};
  trend.forEach(row => {
    if (!map[row.month]) map[row.month] = { month: row.month, income: 0, expense: 0 };
    map[row.month][row.type] = Number(row.total);
  });
  return Object.values(map).slice(-6);
};

export default function BarChartCard({ data }) {
  const chartData = processData(data);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Monthly income vs expenses
      </h3>
      <ResponsiveContainer width="100%" height={270}>
        <BarChart data={chartData} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
          <Tooltip
            formatter={v => [`Rs.${Number(v).toLocaleString('en-IN')}`]}
            contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="income"  name="Income"  fill="#22c55e" radius={[4,4,0,0]} />
          <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}