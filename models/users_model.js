const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  gender: {
    type: String,
    required: true,
    trim: true,
    enum: ['Male', 'Female', 'Other'],
  },
  cart: {
    type: Array,
    default: [],
  },
  no_of_orders: {
    type: Number,
    default: 0,
  },
}, {
  versionKey: false,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
