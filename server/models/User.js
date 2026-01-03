const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // 👇 PHONE FIELD ZAROORI HAI
  phone: { type: String, required: true }, 

  role: { type: String, enum: ['student', 'sponsor', 'admin'], default: 'student' },
  companyName: { type: String }, 
  collegeName: { type: String }, 
  
  verificationDoc: { type: String }, 
  isVerified: { type: Boolean, default: false }, // 👈 By default FALSE rahega
  
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);