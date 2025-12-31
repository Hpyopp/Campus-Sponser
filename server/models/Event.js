const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true }, // Date string rakha hai simplicity ke liye
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    description: { type: String },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, // 👈 Ye zaroori hai populate ke liye
        ref: 'User', // 👈 User model se link karega
        required: true
    },
    // Optional: Agar poster URL store karna hai
    poster: { type: String } 
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);