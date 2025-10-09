const mongoose = require('mongoose');

const waitingRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  startPoint: {
    type: String,
    required: true,
    trim: true
  },
  endPoint: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  note: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['waiting', 'matched', 'completed'],
    default: 'waiting'
  },
  region: {
    type: String,
    enum: ['north', 'central', 'south'],
    default: 'north'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WaitingRequest', waitingRequestSchema);
