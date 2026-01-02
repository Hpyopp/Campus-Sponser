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
  
  // 👇 CHANGED: Views ab ek Array hai jo User IDs store karega
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 

  sponsors: [{
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    companyName: { type: String, default: '' }, 
    amount: Number,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'confirmed' },
    comment: { type: String, default: '' } 
  }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);