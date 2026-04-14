const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const { syncDatabase } = require('./models/index');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets',      require('./routes/budgetRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Finance API is running' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

syncDatabase().then(() => {
  app.listen(PORT, () => {
    console.log('Database synced - all tables ready');
    console.log('Server running at http://localhost:' + PORT);
  });
}).catch((err) => {
  console.error('Database sync failed:', err.message);
});