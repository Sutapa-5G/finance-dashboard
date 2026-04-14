export const exportToCSV = (transactions) => {
  if (!transactions.length) return alert('No transactions to export');

  const headers = ['Date', 'Title', 'Category', 'Type', 'Amount (INR)', 'Note', 'Recurring'];

  const rows = transactions.map(t => [
    t.date,
    `"${t.title}"`,
    t.category,
    t.type,
    t.amount,
    `"${t.note || ''}"`,
    t.isRecurring ? `Yes (${t.recurringInterval})` : 'No'
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};