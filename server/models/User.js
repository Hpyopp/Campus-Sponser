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
  // 👇 NEW FIELD: COMPANY NAME
  companyName: {
    type: String,
    default: '', // Student ke liye empty rahega
  },
  // OTP Fields
  otp: { type: String },
  otpExpires: { type: Date },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationDoc: {
    type: String, // URL/Path to document
    default: null
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);