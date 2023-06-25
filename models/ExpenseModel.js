const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title:{
      type:String,
      required:true
    },
    user_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categories: {
      type: String,
      enum: ['Food', 'Transportation', 'Housing and Groceries', 'Health', 'Other Expense', 'Entertainment', 'Personal Care',
              'Salary','Freelance','Investment','Rental Income','Gifts','Other Income'],
      required: true,
    },
    typeof: {
      type: String,
      enum: ['Income', 'Expenditure'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    createdOn: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;