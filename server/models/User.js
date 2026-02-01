const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true }, 
  role: { type: String, enum: ['student', 'sponsor', 'admin'], default: 'student' },
  
  // 👇 Ye field verification document (ID Card / GST Certificate) ke liye hai
  verificationDoc: { type: String, default: "" }, 
  
  companyName: { type: String }, 
  collegeName: { type: String }, 

  // 👇 NEW FIELDS ADDED FOR SPONSOR VERIFICATION
  gstNumber: { type: String },     // GST Number save karega
  linkedinLink: { type: String },  // Trust ke liye LinkedIn URL

  isVerified: { type: Boolean, default: false },
  
  otp: { type: String },
  otpExpires: { type: Date }
}, { 
  timestamps: true, 
  strict: false // 👈 BRAHMASTRA: Ye DB ko bolega "Dimaag mat lagao, jo aya hai save karo"
});

module.exports = mongoose.model('User', userSchema);