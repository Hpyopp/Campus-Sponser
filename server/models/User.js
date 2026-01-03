const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true }, 
  role: { type: String, enum: ['student', 'sponsor', 'admin'], default: 'student' },
  
  // Ye field main hai
  verificationDoc: { type: String, default: "" }, 
  
  companyName: { type: String }, 
  collegeName: { type: String }, 
  isVerified: { type: Boolean, default: false },
  
  otp: { type: String },
  otpExpires: { type: Date }
}, { 
  timestamps: true, 
  strict: false // 👈 MAGIC FIX: Ye DB ko bolega "Jo data aa raha hai chupchap save kar lo"
});

module.exports = mongoose.model('User', userSchema);