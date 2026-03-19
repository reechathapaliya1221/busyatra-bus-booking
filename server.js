const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/buses');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

const app = express();

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bus_booking';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGODB_URI }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// API Routes - make sure these are functions
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'search.html'));
});

app.get('/seat-selection', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'seat-selection.html'));
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'booking.html'));
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'payment.html'));
});

app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'confirmation.html'));
});

app.get('/my-bookings', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'my-bookings.html'));
});

app.get('/booking-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'booking-details.html'));
});

// Admin routes
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html'));
});

app.get('/admin/buses', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'buses.html'));
});

app.get('/admin/routes', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'routes.html'));
});

app.get('/admin/schedules', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'schedules.html'));
});

app.get('/admin/bookings', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'bookings.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});