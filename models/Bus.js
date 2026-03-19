const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: [true, 'Please provide bus number'],
        unique: true,
        uppercase: true,
        trim: true
    },
    busName: {
        type: String,
        required: [true, 'Please provide bus name'],
        trim: true
    },
    busType: {
        type: String,
        enum: ['AC', 'Non-AC', 'Sleeper', 'Seater', 'AC Sleeper', 'AC Seater'],
        required: true
    },
    totalSeats: {
        type: Number,
        required: true,
        min: 20,
        max: 60,
        default: 40
    },
    amenities: [{
        type: String,
        enum: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Movie', 'Snacks']
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bus', busSchema);