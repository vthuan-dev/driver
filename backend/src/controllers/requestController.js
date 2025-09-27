const WaitingRequest = require('../models/WaitingRequest');

const createRequest = async (req, res) => {
  try {
    const { name, phone, startPoint, endPoint, price, note } = req.body;
    const userId = req.user.id;
    
    const request = new WaitingRequest({
      userId,
      name,
      phone,
      startPoint,
      endPoint,
      price: parseInt(price),
      note: note || ''
    });
    
    await request.save();
    
    res.status(201).json({
      message: 'Request created successfully',
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const requests = await WaitingRequest.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json({ requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await WaitingRequest.find()
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });
    
    res.json({ requests });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const request = await WaitingRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId', 'name phone');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json({
      message: 'Request updated successfully',
      request
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequest
};
