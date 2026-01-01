const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['student', 'sponsor', 'admin'], default: 'student' },
  
  // 👇 NEW FIELDS
  companyName: { type: String, default: '' }, // Sponsor ke liye
  collegeName: { type: String, default: '' }, // Student ke liye
  
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  verificationDoc: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);