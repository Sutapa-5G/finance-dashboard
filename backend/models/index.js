const sequelize = require('../config/database');
const User = require('./User');
const Transaction = require('./Transaction');
const Budget = require('./Budget');

User.hasMany(Transaction, { onDelete: 'CASCADE' });
Transaction.belongsTo(User);

User.hasMany(Budget, { onDelete: 'CASCADE' });
Budget.belongsTo(User);

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('✅ Database synced — all tables ready');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, syncDatabase, User, Transaction, Budget };