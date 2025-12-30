const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    role: {
        type: String,
        enum: ['student', 'sponsor', 'admin'], 
        default: 'student',
    },
    // 👇 KYC Fields
    isVerified: {
        type: Boolean,
        default: false, 
    },
    verificationDoc: {
        type: String, 
        default: ''
    },
    companyWebsite: { type: String, default: '' },
    industry: { type: String, default: '' }
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);