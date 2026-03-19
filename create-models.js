const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir);
}

// User model
const userModel = `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);`;

// Bus model
const busModel = `const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busNumber: { type: String, required: true, unique: true, uppercase: true },
    busName: { type: String, required: true },
    busType: { type: String, enum: ['AC', 'Non-AC', 'Sleeper', 'Seater', 'AC Sleeper', 'AC Seater'], required: true },
    totalSeats: { type: Number, required: true, min: 20, max: 60, default: 40 },
    amenities: [{ type: String, enum: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Movie', 'Snacks'] }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);`;

// Route model
const routeModel = `const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    source: { type: String, required: true },
    destination: { type: String, required: true },
    distance: { type: Number, required: true, min: 1 },
    duration: { type: Number, required: true, min: 1 },
    baseFare: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);`;

// Schedule model
const scheduleModel = `const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    availableSeats: [{
        seatNumber: Number,
        isAvailable: { type: Boolean, default: true }
    }],
    fare: { type: Number, required: true },
    status: { type: String, enum: ['Scheduled', 'Departed', 'Arrived', 'Cancelled'], default: 'Scheduled' }
}, { timestamps: true });

scheduleSchema.pre('save', async function(next) {
    if (this.isNew) {
        const Bus = mongoose.model('Bus');
        const bus = await Bus.findById(this.bus);
        if (bus) {
            this.availableSeats = [];
            for (let i = 1; i <= bus.totalSeats; i++) {
                this.availableSeats.push({ seatNumber: i, isAvailable: true });
            }
        }
    }
    next();
});

module.exports = mongoose.model('Schedule', scheduleSchema);`;

// Booking model
const bookingModel = `const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
    passengers: [{
        name: String, age: Number, gender: String, seatNumber: Number
    }],
    totalFare: { type: Number, required: true },
    bookingDate: { type: Date, default: Date.now },
    journeyDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' },
    paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' }
}, { timestamps: true });

bookingSchema.pre('save', function(next) {
    if (!this.bookingId) {
        const date = new Date();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.bookingId = \`BK\${date.getFullYear().toString().slice(-2)}\${(date.getMonth()+1).toString().padStart(2,'0')}\${date.getDate().toString().padStart(2,'0')}\${random}\`;
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);`;

// Payment model
const paymentModel = `const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Wallet'], required: true },
    transactionId: { type: String, unique: true },
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Success', 'Failed', 'Refunded'], default: 'Pending' }
});

paymentSchema.pre('save', function(next) {
    if (!this.transactionId) {
        this.transactionId = \`TXN\${Date.now().toString().slice(-8)}\${Math.floor(Math.random()*10000).toString().padStart(4,'0')}\`;
    }
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);`;

// Write files
fs.writeFileSync(path.join(modelsDir, 'User.js'), userModel);
fs.writeFileSync(path.join(modelsDir, 'Bus.js'), busModel);
fs.writeFileSync(path.join(modelsDir, 'Route.js'), routeModel);
fs.writeFileSync(path.join(modelsDir, 'Schedule.js'), scheduleModel);
fs.writeFileSync(path.join(modelsDir, 'Booking.js'), bookingModel);
fs.writeFileSync(path.join(modelsDir, 'Payment.js'), paymentModel);

console.log('✅ All model files created successfully!');