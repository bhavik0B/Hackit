import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  name: String,
  email: String,
  avatar: String
});

const User = mongoose.model('User', userSchema);
export default User;
