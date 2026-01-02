const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  budget: { type: Number, required: true },
  contactEmail: { type: String, required: true },
  instagramLink: { type: String, default: '' },
  
  permissionLetter: { type: String, required: true },
  isApproved: { type: Boolean, default: false },

  raisedAmount: { type: Number, default: 0 },
  
  sponsors: [{
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    amount: Number,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'confirmed' },
    // 👇 NEW FIELD: Sponsor ka Note/Comment
    comment: { type: String, default: '' } 
  }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);