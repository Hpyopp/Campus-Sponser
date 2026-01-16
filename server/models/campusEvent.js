const mongoose = require('mongoose');

const sponsorSchema = mongoose.Schema({
  sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  email: { type: String },
  companyName: { type: String },
  amount: { type: Number, required: true },
  comment: { type: String },
  status: { type: String, default: 'pending' }, 
  paymentId: { type: String }, 
  date: { type: Date, default: Date.now }
});

const eventSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  budget: { type: Number, required: true },
  
  // 👇 NEW: CATEGORY ADDED
  category: { 
    type: String, 
    required: true, 
    enum: ['Tech', 'Cultural', 'Sports', 'Music', 'Workshop', 'Business', 'Other'],
    default: 'Other'
  },

  contactEmail: { type: String, required: true },
  instagramLink: { type: String }, 
  imageUrl: { type: String, required: true }, 
  permissionLetter: { type: String, required: true }, 
  isApproved: { type: Boolean, default: false },
  
  status: { type: String, enum: ['pending', 'funding', 'completed'], default: 'pending' },
  raisedAmount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  sponsors: [sponsorSchema],
  eventImages: [String],
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);