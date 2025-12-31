const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Password optional kar diya (OTP login ke liye)
    phone: { type: String },
    role: { 
        type: String, 
        enum: ['student', 'sponsor', 'admin'], 
        default: 'student' 
    },
    isVerified: { type: Boolean, default: false },
    verificationDoc: { type: String, default: "" },
    
    // 👇 OTP Fields Add Kiye
    otp: { type: String },
    otpExpires: { type: Date }
}, {
    timestamps: true,
    strict: false 
});

module.exports = mongoose.model('User', userSchema);