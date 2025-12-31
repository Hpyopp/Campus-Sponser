const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Ye Student hai jisne event banaya
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

  // 👇 BUSINESS LOGIC (NEW FIELDS)
  isSponsored: {
    type: Boolean,
    default: false, // Shuru mein koi sponsor nahi
  },
  sponsorBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Ye wo Sponsor hai jisne deal lock ki
    default: null
  },
  sponsorName: {
    type: String,
    default: '' 
  },
  sponsorEmail: {
    type: String,
    default: ''
  },
  sponsoredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);