const express = require('express');
const router = express.Router();
const { searchBuses, getBusDetails, getSeatLayout } = require('../controllers/busController');

// Public routes
router.get('/search', searchBuses);
router.get('/:scheduleId', getBusDetails);
router.get('/:scheduleId/seats', getSeatLayout);

module.exports = router;