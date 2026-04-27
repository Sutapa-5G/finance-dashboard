const { Op } = require('sequelize');
const { Transaction } = require('../models/index');

const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 20 } = req.query;

    const where = { UserId: req.user.id };
    if (type) where.type = type;
    if (category && category !== 'All') where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate)   where.date[Op.lte] = endDate;
    }

    const offset = (page - 1) * limit;

    const { rows: transactions, count: total } = await Transaction.findAndCountAll({
      where,
      order: [['date', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    });

    res.json({
      success: true,
      transactions,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch transactions' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, note, isRecurring, recurringInterval } = req.body;

    const transaction = await Transaction.create({
      title, amount, type, category, date, note, isRecurring, recurringInterval,
      UserId: req.user.id
    });

    res.status(201).json({ success: true, transaction });

  } catch (error) {
    console.error('Create transaction error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({ success: false, message: 'Could not create transaction' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, UserId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await transaction.update(req.body);
    res.json({ success: true, transaction });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ success: false, message: 'Could not update transaction' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.destroy({
      where: { id: req.params.id, UserId: req.user.id }
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction deleted successfully' });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ success: false, message: 'Could not delete transaction' });
  }
};

const getSummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Get ALL transactions for this user
    const allTransactions = await Transaction.findAll({
      where: { UserId: req.user.id },
      raw: true
    });

    // Filter by month and year in JavaScript
    const filtered = allTransactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === Number(month) &&
             d.getFullYear() === Number(year);
    });

    // Calculate monthly totals
    const totals = { income: 0, expense: 0 };
    filtered.forEach(t => {
      totals[t.type] = (totals[t.type] || 0) + Number(t.amount);
    });

    const monthlyTotals = Object.entries(totals).map(([type, total]) => ({
      type, total
    }));

    // Expenses by category for pie chart
    const categoryMap = {};
    filtered
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
      });

    const byCategory = Object.entries(categoryMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    // Monthly trend for charts
    const trendMap = {};
    allTransactions.forEach(t => {
      const d = new Date(t.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const key = `${monthKey}_${t.type}`;
      if (!trendMap[key]) {
        trendMap[key] = { month: monthKey, type: t.type, total: 0 };
      }
      trendMap[key].total += Number(t.amount);
    });

    const trend = Object.values(trendMap)
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({ success: true, monthlyTotals, byCategory, trend });

  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch summary' });
  }
};

module.exports = {
  getTransactions, createTransaction,
  updateTransaction, deleteTransaction, getSummary
};