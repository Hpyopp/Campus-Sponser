const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kisko dikhana hai
  type: { type: String, enum: ['payment', 'approval', 'message', 'alert'], default: 'alert' },
  message: { type: String, required: true },
  relatedId: { type: String }, // Event ID ya Chat ID (Link ke liye)
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);