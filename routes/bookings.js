const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    getUserBookings, 
    getBookingDetails, 
    cancelBooking 
} = require('../controllers/bookingController');
const { processPayment, getPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// All booking routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/:bookingId', getBookingDetails);
router.put('/:bookingId/cancel', cancelBooking);
router.post('/:bookingId/payment', processPayment);
router.get('/payment/:paymentId', getPaymentStatus);

module.exports = router;