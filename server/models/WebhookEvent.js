const mongoose = require('mongoose');

const WebhookEventSchema = new mongoose.Schema({
  provider: { type: String, default: 'razorpay' },
  event: { type: String },
  payload: { type: Object },
  processed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WebhookEvent', WebhookEventSchema);
