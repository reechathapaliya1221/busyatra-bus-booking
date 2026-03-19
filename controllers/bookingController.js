const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const Payment = require('../models/Payment');

// Create booking
const createBooking = async (req, res) => {
    try {
        const { scheduleId, passengers, journeyDate } = req.body;
        const userId = req.user._id;

        // Validation
        if (!scheduleId || !passengers || !passengers.length || !journeyDate) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Get schedule details
        const schedule = await Schedule.findById(scheduleId)
            .populate('bus')
            .populate('route');

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        // Check if schedule is still available
        if (schedule.status !== 'Scheduled') {
            return res.status(400).json({ message: 'This bus is no longer available for booking' });
        }

        // Check seat availability
        const selectedSeats = passengers.map(p => p.seatNumber);
        const unavailableSeats = [];

        for (const seatNum of selectedSeats) {
            const seat = schedule.availableSeats.find(s => s.seatNumber === seatNum);
            if (!seat || !seat.isAvailable) {
                unavailableSeats.push(seatNum);
            }
        }

        if (unavailableSeats.length > 0) {
            return res.status(400).json({
                message: 'Some seats are no longer available',
                unavailableSeats
            });
        }

        // Calculate total fare
        const totalFare = schedule.fare * passengers.length;

        // Create booking
        const booking = await Booking.create({
            user: userId,
            schedule: scheduleId,
            passengers,
            totalFare,
            journeyDate: new Date(journeyDate),
            status: 'Pending',
            paymentStatus: 'Pending'
        });

        // Mark seats as unavailable
        for (const seatNum of selectedSeats) {
            const seatIndex = schedule.availableSeats.findIndex(
                s => s.seatNumber === seatNum
            );
            if (seatIndex !== -1) {
                schedule.availableSeats[seatIndex].isAvailable = false;
            }
        }
        await schedule.save();

        res.status(201).json({
            message: 'Booking created successfully',
            bookingId: booking.bookingId,
            booking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get user bookings
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate({
                path: 'schedule',
                populate: [
                    { path: 'bus', select: 'busName busNumber busType' },
                    { path: 'route', select: 'source destination' }
                ]
            })
            .sort({ bookingDate: -1 });

        res.json(bookings);
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get booking details
const getBookingDetails = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            bookingId: req.params.bookingId
        })
            .populate('user', 'name email phone')
            .populate({
                path: 'schedule',
                populate: [
                    { path: 'bus' },
                    { path: 'route' }
                ]
            });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user owns this booking or is admin
        if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Get booking details error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            bookingId: req.params.bookingId
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user owns this booking
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        // Check if booking can be cancelled
        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Booking already cancelled' });
        }

        if (booking.status === 'Completed') {
            return res.status(400).json({ message: 'Completed bookings cannot be cancelled' });
        }

        // Check if journey date is in future
        if (new Date(booking.journeyDate) < new Date()) {
            return res.status(400).json({ message: 'Cannot cancel past journey bookings' });
        }

        // Update booking status
        booking.status = 'Cancelled';
        if (booking.paymentStatus === 'Completed') {
            booking.paymentStatus = 'Refunded';
        }
        await booking.save();

        // Make seats available again
        const schedule = await Schedule.findById(booking.schedule);
        if (schedule) {
            for (const passenger of booking.passengers) {
                const seatIndex = schedule.availableSeats.findIndex(
                    s => s.seatNumber === passenger.seatNumber
                );
                if (seatIndex !== -1) {
                    schedule.availableSeats[seatIndex].isAvailable = true;
                }
            }
            await schedule.save();
        }

        res.json({ 
            message: 'Booking cancelled successfully',
            bookingId: booking.bookingId
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getBookingDetails,
    cancelBooking
};