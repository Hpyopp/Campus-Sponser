const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'pending' } // pending, resolved
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);