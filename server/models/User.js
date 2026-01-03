const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true }, 
  role: { type: String, enum: ['student', 'sponsor', 'admin'], default: 'student' },
  
  // 👇 Isko 'String' rakha hai aur default empty
  verificationDoc: { type: String, default: "" }, 
  
  companyName: { type: String }, 
  collegeName: { type: String }, 
  isVerified: { type: Boolean, default: false },
  
  otp: { type: String },
  otpExpires: { type: Date }
}, { 
  timestamps: true, 
  strict: false // 👈 YE MAGIC KEY HAI (Isse data zabardasti save hoga)
});

module.exports = mongoose.model('User', userSchema);