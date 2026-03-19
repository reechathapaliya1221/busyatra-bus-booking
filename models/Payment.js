const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Wallet'],
        required: true
    },
    transactionId: {
        type: String,
        unique: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Pending', 'Success', 'Failed', 'Refunded'],
        default: 'Pending'
    }
});

paymentSchema.pre('save', async function(next) {
    if (!this.transactionId) {
        const date = new Date();
        const timestamp = date.getTime().toString().slice(-8);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.transactionId = `TXN${timestamp}${random}`;
    }
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);