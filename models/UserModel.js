const mongoose = require('mongoose');
const PaymentRequest = require('./PaymentRequest');
const ExpenseModel = require('./ExpenseModel');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre('remove', async function (next) {
  const userId = this._id;

  try {
    await PaymentRequest.deleteMany({
      $or: [{ payUser: userId }, { requestUser: userId }],
    });

    await ExpenseModel.deleteMany({ user_ref: userId });

    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;