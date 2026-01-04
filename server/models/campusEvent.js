const mongoose = require('mongoose');

const sponsorSchema = mongoose.Schema({
  sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  email: { type: String },
  companyName: { type: String },
  amount: { type: Number, required: true },
  comment: { type: String },
  status: { type: String, default: 'pending' }, // 'pending' ya 'verified'
  date: { type: Date, default: Date.now }
});

const eventSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  budget: { type: Number, required: true },
  permissionLetter: { type: String }, // File path
  isApproved: { type: Boolean, default: false },
  raisedAmount: { type: Number, default: 0 },
  sponsors: [sponsorSchema], // 👈 Ye zaroori hai sponsorship ke liye
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);