import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1','#f59e0b','#22c55e','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316'];

export default function PieChartCard({ data }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Expenses by category
      </h3>
      {data.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-16">No expenses this month</p>
      ) : (
        <ResponsiveContainer width="100%" height={270}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name"
              cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip
              formatter={(v) => [`Rs.${Number(v).toLocaleString('en-IN')}`, 'Amount']}
              contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}