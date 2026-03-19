const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    source: {
        type: String,
        required: [true, 'Please provide source city'],
        trim: true
    },
    destination: {
        type: String,
        required: [true, 'Please provide destination city'],
        trim: true
    },
    distance: {
        type: Number,
        required: [true, 'Please provide distance in km'],
        min: 1
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Please provide duration in minutes'],
        min: 1
    },
    baseFare: {
        type: Number,
        required: [true, 'Please provide base fare'],
        min: 1
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);