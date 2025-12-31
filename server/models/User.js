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
    verificationDoc: { type: String, default: "" } // Ye field zaroori hai
}, {
    timestamps: true,
    strict: false  // 👈 YE HAI JAADU. Ye naye fields ko reject hone se rokega.
});

module.exports = mongoose.model('User', userSchema);