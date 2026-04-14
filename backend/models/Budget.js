const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define('Budget', {
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  limitAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Budget must be at least 1' }
    }
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['UserId', 'category', 'month', 'year']
    }
  ]
});

module.exports = Budget;