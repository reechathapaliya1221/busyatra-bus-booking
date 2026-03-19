const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const totalBuses = await Bus.countDocuments();
        const totalRoutes = await Route.countDocuments({ isActive: true });
        const totalBookings = await Booking.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'user' });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayBookings = await Booking.countDocuments({
            bookingDate: { $gte: today }
        });

        const revenue = await Booking.aggregate([
            { $match: { status: 'Confirmed', paymentStatus: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$totalFare' } } }
        ]);

        // Recent bookings
        const recentBookings = await Booking.find()
            .populate('user', 'name')
            .populate({
                path: 'schedule',
                populate: [
                    { path: 'bus', select: 'busName busNumber' },
                    { path: 'route', select: 'source destination' }
                ]
            })
            .sort({ bookingDate: -1 })
            .limit(5);

        res.json({
            totalBuses,
            totalRoutes,
            totalBookings,
            totalUsers,
            todayBookings,
            totalRevenue: revenue[0]?.total || 0,
            recentBookings
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Bus management
const createBus = async (req, res) => {
    try {
        const bus = await Bus.create(req.body);
        res.status(201).json(bus);
    } catch (error) {
        console.error('Create bus error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateBus = async (req, res) => {
    try {
        const bus = await Bus.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        res.json(bus);
    } catch (error) {
        console.error('Update bus error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteBus = async (req, res) => {
    try {
        const bus = await Bus.findByIdAndDelete(req.params.id);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        res.json({ message: 'Bus deleted successfully' });
    } catch (error) {
        console.error('Delete bus error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAllBuses = async (req, res) => {
    try {
        const buses = await Bus.find().sort({ createdAt: -1 });
        res.json(buses);
    } catch (error) {
        console.error('Get all buses error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Route management
const createRoute = async (req, res) => {
    try {
        const route = await Route.create(req.body);
        res.status(201).json(route);
    } catch (error) {
        console.error('Create route error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.json(route);
    } catch (error) {
        console.error('Update route error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndDelete(req.params.id);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.json({ message: 'Route deleted successfully' });
    } catch (error) {
        console.error('Delete route error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAllRoutes = async (req, res) => {
    try {
        const routes = await Route.find().sort({ createdAt: -1 });
        res.json(routes);
    } catch (error) {
        console.error('Get all routes error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Schedule management
const createSchedule = async (req, res) => {
    try {
        const { busId, routeId, departureTime, arrivalTime, fare } = req.body;

        // Validate bus and route
        const bus = await Bus.findById(busId);
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }

        const route = await Route.findById(routeId);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }

        const schedule = await Schedule.create({
            bus: busId,
            route: routeId,
            departureTime,
            arrivalTime,
            fare: fare || route.baseFare
        });

        const populatedSchedule = await Schedule.findById(schedule._id)
            .populate('bus')
            .populate('route');

        res.status(201).json(populatedSchedule);
    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('bus').populate('route');
        
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.json(schedule);
    } catch (error) {
        console.error('Update schedule error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByIdAndDelete(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Delete schedule error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAllSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find()
            .populate('bus')
            .populate('route')
            .sort({ departureTime: 1 });
        res.json(schedules);
    } catch (error) {
        console.error('Get all schedules error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all bookings
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email phone')
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
        console.error('Get all bookings error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    createBus,
    updateBus,
    deleteBus,
    getAllBuses,
    createRoute,
    updateRoute,
    deleteRoute,
    getAllRoutes,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getAllSchedules,
    getAllBookings
};