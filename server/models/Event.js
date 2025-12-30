const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80'
    },
    // 👇 Social Media Links Object
    socialLinks: {
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' }
    },
    organizer: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    sponsors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;