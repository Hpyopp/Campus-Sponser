const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum: ['student', 'sponsor', 'admin'],
        default: 'student'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // 👇 YE MISSING THA! Iske bina URL save nahi hoga
    verificationDoc: {
        type: String, 
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);