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
    const sequelize = require('../config/database');

    // Monthly totals - income and expense
    const monthlyTotals = await Transaction.findAll({
      attributes: [
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: {
        UserId: req.user.id,
        [Op.and]: [
          sequelize.where(
            sequelize.fn('EXTRACT', sequelize.literal(`MONTH FROM "date"`)),
            Number(month) + 1
          ),
          sequelize.where(
            sequelize.fn('EXTRACT', sequelize.literal(`YEAR FROM "date"`)),
            Number(year)
          )
        ]
      },
      group: ['type'],
      raw: true
    });

    // Expenses by category for pie chart
    const byCategory = await Transaction.findAll({
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: {
        UserId: req.user.id,
        type: 'expense',
        [Op.and]: [
          sequelize.where(
            sequelize.fn('EXTRACT', sequelize.literal(`MONTH FROM "date"`)),
            Number(month) + 1
          ),
          sequelize.where(
            sequelize.fn('EXTRACT', sequelize.literal(`YEAR FROM "date"`)),
            Number(year)
          )
        ]
      },
      group: ['category'],
      order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
      raw: true
    });

    // Monthly trend for bar and line charts
    const trend = await Transaction.findAll({
      attributes: [
        [sequelize.fn('TO_CHAR', sequelize.col('date'), 'YYYY-MM'), 'month'],
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: { UserId: req.user.id },
      group: [
        sequelize.fn('TO_CHAR', sequelize.col('date'), 'YYYY-MM'),
        'type'
      ],
      order: [
        [sequelize.fn('TO_CHAR', sequelize.col('date'), 'YYYY-MM'), 'ASC']
      ],
      raw: true
    });

    res.json({ success: true, monthlyTotals, byCategory, trend });

  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch summary' });
  }
};