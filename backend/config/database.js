const { Sequelize } = require('sequelize');
const path = require('path');

// Use PostgreSQL in production, SQLite locally
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '..', 'finance.db'),
      logging: false
    });

module.exports = sequelize;