const DriverPost = require('../models/DriverPost');

const getDrivers = async (req, res) => {
  try {
    const { region } = req.query;
    const filter = { isActive: true };
    if (region && ['north', 'central', 'south'].includes(region)) {
      filter.region = region;
    }

    const drivers = await DriverPost.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({ drivers });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createDriver = async (req, res) => {
  try {
    const { name, phone, route, avatar, region } = req.body;
    
    const driver = new DriverPost({
      name,
      phone,
      route,
      avatar: avatar || '',
      region: ['north', 'central', 'south'].includes(region) ? region : 'north'
    });
    
    await driver.save();
    
    res.status(201).json({
      message: 'Driver post created successfully',
      driver
    });
  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.region && !['north', 'central', 'south'].includes(updateData.region)) {
      delete updateData.region;
    }
    
    const driver = await DriverPost.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver post not found' });
    }
    
    res.json({
      message: 'Driver post updated successfully',
      driver
    });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    
    const driver = await DriverPost.findByIdAndDelete(id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver post not found' });
    }
    
    res.json({ message: 'Driver post deleted successfully' });
  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver
};



