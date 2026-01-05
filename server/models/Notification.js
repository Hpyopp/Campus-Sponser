const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kisko bhejna hai
  message: { type: String, required: true }, // Kya msg hai
  type: { type: String, default: 'info' }, // 'success' (Payment), 'info' (Msg), 'warning' (Alert)
  link: { type: String }, // Click karne pe kahan jaye (optional)
  isRead: { type: Boolean, default: false }, // Padha ya nahi
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);