const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true }, 

  role: { type: String, enum: ['student', 'sponsor', 'admin'], default: 'student' },
  companyName: { type: String }, 
  collegeName: { type: String }, 
  
  // 👇 YE LINE NAHI HOGI TOH DATA SAVE NAHI HOGA
  verificationDoc: { type: String, default: "" }, 
  
  isVerified: { type: Boolean, default: false },
  
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);