const { WaitingRequest, User } = require('../models');

const createRequest = async (req, res) => {
  try {
    const { name, phone, startPoint, endPoint, price, note, region } = req.body;
    const userId = req.user ? req.user.id : null;
    
    console.log('Creating request with data:', { name, phone, startPoint, endPoint, price, note, region, userId });
    
    const request = await WaitingRequest.create({
      userId,
      name,
      phone,
      startPoint,
      endPoint,
      price: parseInt(price),
      note: note || '',
      region: ['north', 'central', 'south'].includes(region) ? region : 'north'
    });
    
    console.log('Request saved successfully:', request.toJSON());
    
    const data = request.toJSON();
    data._id = data.id;

    res.status(201).json({
      message: 'Request created successfully',
      request: data
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const allRequests = await WaitingRequest.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    const requests = allRequests.map(r => {
      const data = r.toJSON();
      data._id = data.id;
      return data;
    });

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

    const queryOptions = {
      where: filter,
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'phone']
      }],
      order: [['createdAt', 'DESC']]
    };

    const max = Math.min(parseInt(limit || '0', 10) || 0, 100);
    if (max > 0) {
      queryOptions.limit = max;
    }

    const allRequests = await WaitingRequest.findAll(queryOptions);
    
    const requests = allRequests.map(r => {
      const data = r.toJSON();
      data._id = data.id;
      if (data.user) {
        data.userId = data.user; // To mimic Mongoose populate
      }
      return data;
    });

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
    
    const request = await WaitingRequest.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    await request.update({ status });
    
    // Fetch updated request with user
    const updatedRequest = await WaitingRequest.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['name', 'phone'] }]
    });

    const data = updatedRequest.toJSON();
    data._id = data.id;
    if (data.user) {
      data.userId = data.user;
    }

    res.json({
      message: 'Request updated successfully',
      request: data
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await WaitingRequest.findByPk(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    await request.destroy();
    
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequest,
  deleteRequest
};
