const mongoose = require('mongoose');

const PaymentRequestSchema = new mongoose.Schema({
    payUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    title:{
        type:String,
        required: false,
    },
    payStatus: {
        type: Boolean,
        default: false
    },
    createdOn: {
        type: Date,
        default: Date.now,
    },
},
    { timestamps: true });

const Request = mongoose.model('PaymentRequest', PaymentRequestSchema);

module.exports = Request;
