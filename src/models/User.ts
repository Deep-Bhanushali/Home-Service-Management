import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'provider'], required: true },
  address: String,
  contact: String,
  createdAt: { type: Date, default: Date.now },
});

// Method to check password
userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
