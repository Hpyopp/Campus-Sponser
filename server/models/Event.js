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

  // 👇 YE FIELDS MISSING THE - INKO ADD KARNA ZAROORI HAI
  contactEmail: {
    type: String,
    required: [true, 'Please add contact email'],
  },
  instagramLink: {
    type: String,
    default: ''
  },

  // Sponsorship Logic
  isSponsored: {
    type: Boolean,
    default: false,
  },
  sponsorBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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