const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    category: { type: String, required: true },
    // 👇 Ye NAYA hai: List of sponsors
    sponsors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);