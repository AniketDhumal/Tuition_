const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: String,
  email: String,
  age: Number,
  location: String,
  about: String,
  image: {
    type: String,
    default: '/uploads/default-avatar.png'
  },
  skills: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', profileSchema);