const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  budget: {
    type: Number,
    required: [true, 'Please add a budget'],
  },
  contactEmail: {
    type: String,
    required: [true, 'Please add contact email'],
  },
  instagramLink: {
    type: String,
    default: ''
  },

  // 👇 NEW CROWDFUNDING LOGIC
  raisedAmount: {
    type: Number,
    default: 0
  },
  
  // List of Multiple Sponsors
  sponsors: [{
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    amount: Number,
    date: { type: Date, default: Date.now }
  }]

}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);