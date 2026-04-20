const mongoose = require('mongoose');

const fakeNotificationSchema = new mongoose.Schema({
  region: {
    type: String,
    required: [true, 'Vùng miền là bắt buộc'],
    enum: {
      values: ['north', 'central', 'south'],
      message: 'Vùng miền phải là north, central hoặc south'
    }
  },
  startPoint: {
    type: String,
    required: [true, 'Điểm đi là bắt buộc'],
    minlength: [2, 'Điểm đi phải có ít nhất 2 ký tự'],
    trim: true
  },
  endPoint: {
    type: String,
    required: [true, 'Điểm đến là bắt buộc'],
    minlength: [2, 'Điểm đến phải có ít nhất 2 ký tự'],
    trim: true
  },
  displayTime: {
    type: String,
    required: [true, 'Giờ hiển thị là bắt buộc'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Giờ hiển thị không hợp lệ (HH:MM)']
  },
  carType: {
    type: String,
    required: [true, 'Loại xe là bắt buộc'],
    enum: {
      values: ['4', '7', '16'],
      message: 'Loại xe phải là 4, 7 hoặc 16 chỗ'
    }
  },
  price: {
    type: Number,
    required: [true, 'Giá tiền là bắt buộc'],
    min: [0, 'Giá tiền phải lớn hơn 0']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
fakeNotificationSchema.index({ region: 1 });
fakeNotificationSchema.index({ isActive: 1 });
fakeNotificationSchema.index({ region: 1, isActive: 1 });

module.exports = mongoose.model('FakeNotification', fakeNotificationSchema);
