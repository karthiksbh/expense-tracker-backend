const express = require('express');
const router = express.Router();
const expenseViews = require('../views/expenseViews');

router.post('/create', expenseViews.createExpense);
router.get('/balance', expenseViews.getBalance);
router.get('/total', expenseViews.getTotalIncomeAndExpense);
router.get('/profile', expenseViews.getUserProfile);
router.get('/history', expenseViews.getTransactionHistory);
router.delete('/transactions/:id', expenseViews.deleteTransaction);
router.get('/income-group-wise', expenseViews.getIncomeGroupWise);
router.get('/expense-group-wise', expenseViews.getExpenseGroupWise);

module.exports = router;