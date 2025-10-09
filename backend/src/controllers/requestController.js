const WaitingRequest = require('../models/WaitingRequest');

const createRequest = async (req, res) => {
  try {
    const { name, phone, startPoint, endPoint, price, note, region } = req.body;
    const userId = req.user ? req.user.id : null;
    
    console.log('Creating request with data:', { name, phone, startPoint, endPoint, price, note, region, userId });
    
    const request = new WaitingRequest({
      userId,
      name,
      phone,
      startPoint,
      endPoint,
      price: parseInt(price),
      note: note || '',
      region: ['north', 'central', 'south'].includes(region) ? region : 'north'
    });
    
    console.log('Request object before save:', request);
    
    await request.save();
    
    console.log('Request saved successfully:', request);
    
    res.status(201).json({
      message: 'Request created successfully',
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
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
    const { status, limit } = req.query;

    const filter = {};
    if (status && ['waiting', 'matched', 'completed'].includes(String(status))) {
      filter.status = status;
    }

    const query = WaitingRequest.find(filter)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 });

    const max = Math.min(parseInt(limit || '0', 10) || 0, 100);
    if (max > 0) {
      query.limit(max);
    }

    const requests = await query.exec();
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
