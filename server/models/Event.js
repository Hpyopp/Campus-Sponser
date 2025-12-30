const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true, // e.g., 'Technical', 'Cultural', 'Sports'
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    sponsors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // 👇 Naya Field: Approval Status
    status: {
        type: String,
        default: 'pending', 
        enum: ['pending', 'approved', 'rejected']
    }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;