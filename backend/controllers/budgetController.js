const { Budget } = require('../models/index');

const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const where = { UserId: req.user.id };
    if (month !== undefined) where.month = month;
    if (year  !== undefined) where.year  = year;

    const budgets = await Budget.findAll({ where });
    res.json({ success: true, budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch budgets' });
  }
};

const createOrUpdateBudget = async (req, res) => {
  try {
    const { category, limitAmount, month, year } = req.body;

    const [budget, created] = await Budget.upsert({
      category, limitAmount, month, year,
      UserId: req.user.id
    });

    res.status(created ? 201 : 200).json({ success: true, budget });

  } catch (error) {
    console.error('Budget error:', error);
    res.status(500).json({ success: false, message: 'Could not save budget' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const deleted = await Budget.destroy({
      where: { id: req.params.id, UserId: req.user.id }
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not delete budget' });
  }
};

module.exports = { getBudgets, createOrUpdateBudget, deleteBudget };