import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['service_request', 'request_accepted', 'request_completed', 'feedback_received', 'subscription_expiring', 'subscription_expired'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  metadata: {
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    daysUntilExpiry: { type: Number },
    expiryDate: { type: Date }
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;
