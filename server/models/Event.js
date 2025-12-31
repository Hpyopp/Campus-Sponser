const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    description: { type: String },
    // 👇 Ye line crash rokegi: Hamesha ObjectId hona chahiye
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    poster: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);