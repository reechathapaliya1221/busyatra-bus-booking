const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true
    },
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    departureTime: {
        type: Date,
        required: true
    },
    arrivalTime: {
        type: Date,
        required: true
    },
    availableSeats: [{
        seatNumber: Number,
        isAvailable: {
            type: Boolean,
            default: true
        }
    }],
    fare: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Departed', 'Arrived', 'Cancelled'],
        default: 'Scheduled'
    }
}, {
    timestamps: true
});

// Initialize available seats before saving
scheduleSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const Bus = mongoose.model('Bus');
            const bus = await Bus.findById(this.bus);
            
            if (!bus) {
                return next(new Error('Bus not found'));
            }
            
            this.availableSeats = [];
            for (let i = 1; i <= bus.totalSeats; i++) {
                this.availableSeats.push({
                    seatNumber: i,
                    isAvailable: true
                });
            }
        } catch (error) {
            return next(error);
        }
    }
    next();
});

module.exports = mongoose.model('Schedule', scheduleSchema);