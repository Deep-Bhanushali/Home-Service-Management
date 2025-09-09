import mongoose from 'mongoose';

const serviceProviderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skills: [{ type: String }],
  availability: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  subscriptionStatus: { type: String, enum: ['active', 'inactive', 'expired'], default: 'inactive' },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
});

const ServiceProvider = mongoose.models.ServiceProvider || mongoose.model('ServiceProvider', serviceProviderSchema);

export default ServiceProvider;
