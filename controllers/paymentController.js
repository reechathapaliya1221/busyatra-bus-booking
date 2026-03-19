const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// Process payment
const processPayment = async (req, res) => {
    try {
        const { bookingId, paymentMethod } = req.body;

        if (!bookingId || !paymentMethod) {
            return res.status(400).json({ message: 'Please provide booking ID and payment method' });
        }

        const booking = await Booking.findOne({ bookingId });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if booking belongs to user
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if already paid
        if (booking.paymentStatus === 'Completed') {
            return res.status(400).json({ message: 'Payment already completed for this booking' });
        }

        // Create payment record
        const payment = await Payment.create({
            booking: booking._id,
            user: req.user._id,
            amount: booking.totalFare,
            paymentMethod,
            status: 'Success' // For demo, we'll mark as success immediately
        });

        // Update booking status
        booking.paymentStatus = 'Completed';
        booking.status = 'Confirmed';
        await booking.save();

        res.json({
            message: 'Payment processed successfully',
            paymentId: payment.transactionId,
            bookingId: booking.bookingId,
            amount: payment.amount,
            status: payment.status
        });
    } catch (error) {
        console.error('Process payment error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findOne({
            transactionId: req.params.paymentId
        }).populate('booking', 'bookingId');

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.json({
            transactionId: payment.transactionId,
            amount: payment.amount,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            paymentDate: payment.paymentDate,
            bookingId: payment.booking.bookingId
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    processPayment,
    getPaymentStatus
};