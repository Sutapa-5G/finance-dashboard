const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getBudgets, createOrUpdateBudget, deleteBudget } = require('../controllers/budgetController');

router.use(protect);

router.get('/',       getBudgets);
router.post('/',      createOrUpdateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;