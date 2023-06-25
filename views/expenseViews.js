const Expense = require('../models/ExpenseModel');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');

const authenticateAndRetrieveUser = (req) => {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
        throw new Error('No credentials found');
    }
    const tokenWithoutBearer = token.split(' ')[1];
    try {
        const decodedToken = jwt.verify(tokenWithoutBearer, process.env.SECRET);
        return { _id: decodedToken.userId };
    } catch (error) {
        throw new Error('Invalid token');
    }
};


const createExpense = async (req, res) => {
    try {
        const { title,categories, amount, expenseType } = req.body;
        const userId = authenticateAndRetrieveUser(req);
        const expense = new Expense({
            title,
            user_ref: userId,
            categories,
            amount,
            typeof: expenseType
        });
        await expense.save();
        res.status(200).json({ message: 'Transaction Added' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const getBalance = async (req, res) => {
    try {
        const user = authenticateAndRetrieveUser(req);
        const income = await Expense.find({ user_ref: user._id, typeof: 'Income' })
            .select('amount')
            .then(expenses => expenses.reduce((total, expense) => total + expense.amount, 0));
        const expenditure = await Expense.find({ user_ref: user._id, typeof: 'Expenditure' })
            .select('amount')
            .then(expenses => expenses.reduce((total, expense) => total + expense.amount, 0));
        const total = income - expenditure;
        res.status(200).json({ total });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getTotalIncomeAndExpense = async (req, res) => {
    try {
        const user = authenticateAndRetrieveUser(req);

        const incomeExpenses = await Expense.find({ user_ref: user._id, typeof: 'Income' }).select('amount');
        const totalIncome = incomeExpenses.reduce((total, expense) => total + expense.amount, 0);

        const expenditureExpenses = await Expense.find({ user_ref: user._id, typeof: 'Expenditure' }).select('amount');
        const totalExpense = expenditureExpenses.reduce((total, expense) => total + expense.amount, 0);

        res.status(200).json({ income: totalIncome, expense: totalExpense });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const getUserProfile = async (req, res) => {
    try {
        const user = authenticateAndRetrieveUser(req);
        const userProfile = await User.findById(user._id);
        res.status(200).json({ data: userProfile });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getTransactionHistory = async (req, res) => {
    try {
        const user = authenticateAndRetrieveUser(req);
        const history = await Expense.find({ user_ref: user._id }).sort('-createdOn');
        res.status(200).json(history);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const user = authenticateAndRetrieveUser(req);
        const { id } = req.params;
        await Expense.findOneAndDelete({ _id: id, user_ref: user._id });
        res.status(200).json({ message: 'Transaction Deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const getIncomeGroupWise = async (req, res) => {
    try {
        const user = authenticateAndRetrieveUser(req);
        const categories = ['Salary', 'Investment', 'Rental Income', 'Freelance', 'Other Income', 'Gifts'];
        const incomes = await Expense.find({ user_ref: user._id, typeof: 'Income' }).select('categories amount');
        const income_data = { categories: [], amount: [] };
        let max_income = 0;
        let max_category = null;

        for (const category of categories) {
            let total = 0;

            for (const income of incomes) {
                if (income.categories === category) {
                    total += income.amount;
                }
            }

            income_data.categories.push(category);
            income_data.amount.push(total);

            if (total > max_income) {
                max_income = total;
                max_category = category;
            }
        }

        const message = max_category ? `Maximum income is coming from the category ${max_category}` : "No fixed category from which you get maximum income";
        res.status(200).json({ data: income_data, message });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getExpenseGroupWise = async (req, res) => {
    try {
        const user = authenticateAndRetrieveUser(req);
        const categories = ['Food', 'Transportation', 'Housing and Groceries', 'Health', 'Other Expense', 'Entertainment', 'Personal Care'];
        const expenses = await Expense.find({ user_ref: user._id, typeof: 'Expenditure' }).select('categories amount');
        const expense_data = { categories: [], amount: [] };
        let max_expense = 0;
        let max_category = null;

        for (const category of categories) {
            let total = 0;

            for (const expense of expenses) {
                if (expense.categories === category) {
                    total += expense.amount;
                }
            }

            expense_data.categories.push(category);
            expense_data.amount.push(total);

            if (total > max_expense) {
                max_expense = total;
                max_category = category;
            }
        }

        const message = max_category ? `Maximum expenditure is from the category ${max_category}` : "No fixed category from which there is maximum expense";
        res.status(200).json({ data: expense_data, message });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createExpense,
    getBalance,
    getTotalIncomeAndExpense,
    getUserProfile,
    getTransactionHistory,
    deleteTransaction,
    getIncomeGroupWise,
    getExpenseGroupWise,
};
