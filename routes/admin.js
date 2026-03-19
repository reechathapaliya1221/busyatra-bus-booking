const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect, admin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Bus management
router.route('/buses')
    .get(adminController.getAllBuses)
    .post(adminController.createBus);

router.route('/buses/:id')
    .put(adminController.updateBus)
    .delete(adminController.deleteBus);

// Route management
router.route('/routes')
    .get(adminController.getAllRoutes)
    .post(adminController.createRoute);

router.route('/routes/:id')
    .put(adminController.updateRoute)
    .delete(adminController.deleteRoute);

// Schedule management
router.route('/schedules')
    .get(adminController.getAllSchedules)
    .post(adminController.createSchedule);

router.route('/schedules/:id')
    .put(adminController.updateSchedule)
    .delete(adminController.deleteSchedule);

// Bookings
router.get('/bookings', adminController.getAllBookings);

module.exports = router;  // This must be here!