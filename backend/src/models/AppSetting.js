const mongoose = require('mongoose');

const appSettingSchema = new mongoose.Schema({
  minFakeCount: {
    type: Number,
    default: 3,
    min: [1, 'Số lượng thông báo ảo tối thiểu phải lớn hơn 0']
  },
  maxFakeCount: {
    type: Number,
    default: 4,
    min: [1, 'Số lượng thông báo ảo tối đa phải lớn hơn 0']
  },
  minFakeInterval: {
    type: Number,
    default: 15,
    min: [1, 'Khoảng thời gian tối thiểu phải lớn hơn 0']
  },
  maxFakeInterval: {
    type: Number,
    default: 30,
    min: [1, 'Khoảng thời gian tối đa phải lớn hơn 0']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AppSetting', appSettingSchema);
