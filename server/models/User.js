const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true }, // 👈 Phone Number Zaroori Hai
    role: { 
        type: String, 
        enum: ['student', 'sponsor', 'admin'], 
        default: 'student' 
    },
    isVerified: { type: Boolean, default: false },
    verificationDoc: { type: String, default: "" }
}, {
    timestamps: true,
    strict: false 
});

module.exports = mongoose.model('User', userSchema);