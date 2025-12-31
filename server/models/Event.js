const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },

    image: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
