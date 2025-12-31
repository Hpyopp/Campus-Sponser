const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['student', 'sponsor', 'admin'], 
        default: 'student' 
    },
    isVerified: { type: Boolean, default: false },
    // 👇 YE SABSE ZAROORI HAI. Iske bina upload fail hi hoga.
    verificationDoc: { 
        type: String, 
        default: "" 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);