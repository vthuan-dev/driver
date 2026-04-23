const { DriverPost } = require('../models');

const getDrivers = async (req, res) => {
  try {
    const { region } = req.query;
    const filter = { isActive: true };
    if (region && ['north', 'central', 'south'].includes(region)) {
      filter.region = region;
    }

    const totalDrivers = await DriverPost.count();
    const activeDrivers = await DriverPost.count({ where: { isActive: true } });

    const allDrivers = await DriverPost.findAll({
      where: filter,
      order: [['createdAt', 'DESC']]
    });
    
    const drivers = allDrivers.map(d => {
      const data = d.toJSON();
      data._id = data.id; // For frontend compatibility
      return data;
    });
    
    res.json({ 
      drivers,
      debug: {
        filter,
        totalCount: totalDrivers,
        activeCount: activeDrivers,
        resultCount: drivers.length
      }
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createDriver = async (req, res) => {
  try {
    const { name, phone, route, avatar, region } = req.body;
    
    const driver = await DriverPost.create({
      name,
      phone,
      route,
      avatar: avatar || '',
      region: ['north', 'central', 'south'].includes(region) ? region : 'north'
    });
    
    const data = driver.toJSON();
    data._id = data.id;
    
    res.status(201).json({
      message: 'Driver post created successfully',
      driver: data
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
    
    const driver = await DriverPost.findByPk(id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver post not found' });
    }
    
    await driver.update(updateData);
    
    const data = driver.toJSON();
    data._id = data.id;
    
    res.json({
      message: 'Driver post updated successfully',
      driver: data
    });
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    
    const driver = await DriverPost.findByPk(id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver post not found' });
    }
    
    await driver.destroy();
    
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
