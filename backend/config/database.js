const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: require('better-sqlite3'),
  storage: process.env.NODE_ENV === 'production'
    ? '/tmp/finance.db'
    : path.join(__dirname, '..', 'finance.db'),
  logging: false,
});

module.exports = sequelize;