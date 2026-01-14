const mongoose = require('mongoose');

const sponsorSchema = mongoose.Schema({
  sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  email: { type: String },
  companyName: { type: String },
  amount: { type: Number, required: true },
  comment: { type: String },
  status: { type: String, default: 'pending' }, // 'pending' | 'verified' | 'refund_requested' | 'refunded'
  paymentId: { type: String }, 
  date: { type: Date, default: Date.now }
});

const eventSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  
  // Basic Info
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  budget: { type: Number, required: true },
  
  // 👇 New Fields Added
  contactEmail: { type: String, required: true },
  instagramLink: { type: String }, // Optional
  imageUrl: { type: String, required: true }, // Main Cover Image
  
  permissionLetter: { type: String, required: true }, 
  isApproved: { type: Boolean, default: false },
  
  // Timeline Status
  status: { 
    type: String, 
    enum: ['pending', 'funding', 'completed'], 
    default: 'pending' 
  },
  
  raisedAmount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },

  sponsors: [sponsorSchema],
  eventImages: [String], // Extra images ke liye (Future Use)
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);