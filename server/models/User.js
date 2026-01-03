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
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
  },
  role: {
    type: String,
    enum: ['student', 'sponsor', 'admin'],
    default: 'student',
  },
  phone: { type: String, required: true },
  // Specific Fields
  companyName: { type: String, default: '' },
  collegeName: { type: String, default: '' },

  // OTP & Verification
  otp: { type: String },
  otpExpires: { type: Date },
  
  // 👇 YE SABSE ZAROORI HAI: Default FALSE hi hona chahiye
  isVerified: { 
    type: Boolean, 
    default: false 
  },

  verificationDoc: { type: String, default: null }
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);