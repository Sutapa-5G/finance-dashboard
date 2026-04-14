const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required' }
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [0.01], msg: 'Amount must be greater than 0' }
    }
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'Food', 'Travel', 'Bills', 'Entertainment',
      'Shopping', 'Healthcare', 'Education',
      'Salary', 'Freelance', 'Investment', 'Other'
    ),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  note: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurringInterval: {
    type: DataTypes.ENUM('weekly', 'monthly', 'yearly'),
    allowNull: true
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, { timestamps: true });

module.exports = Transaction;