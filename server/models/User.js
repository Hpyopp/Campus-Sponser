const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true }, 
  role: { type: String, enum: ['student', 'sponsor', 'admin'], default: 'student' },
  
  // 👇 Ye field clear define kiya hai
  verificationDoc: { type: String, default: "" }, 
  
  companyName: { type: String }, 
  collegeName: { type: String }, 
  isVerified: { type: Boolean, default: false },
  
  otp: { type: String },
  otpExpires: { type: Date }
}, { 
  timestamps: true, 
  strict: false // 👈 BRAHMASTRA: Ye DB ko bolega "Dimaag mat lagao, jo aya hai save karo"
});

module.exports = mongoose.model('User', userSchema);