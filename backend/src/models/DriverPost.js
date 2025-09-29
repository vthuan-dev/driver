const mongoose = require('mongoose');

const driverPostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  route: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  region: {
    type: String,
    enum: ['north', 'central', 'south'],
    default: 'north'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DriverPost', driverPostSchema);

