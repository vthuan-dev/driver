const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const DriverPost = require('./models/DriverPost');
const config = require('./config/config');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Create default admin
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const admin = new Admin({
        username: 'admin',
        password: 'admin123',
        role: 'super_admin'
      });
      await admin.save();
      console.log('Default admin created: admin/admin123');
    }

    // Create sample driver posts
    const existingDrivers = await DriverPost.countDocuments();
    if (existingDrivers === 0) {
      const drivers = [
        { name: 'Anh Tuấn', phone: '0912345678', route: 'Hà Nội ⇄ Lào Cai' },
        { name: 'Chị Hạnh', phone: '0987654321', route: 'Hà Nội ⇄ Ninh Bình' },
        { name: 'Anh Dũng', phone: '0901234567', route: 'Mỹ Đình ⇄ Nội Bài' },
        { name: 'Anh Hoàng', phone: '0968888777', route: 'Cầu Giấy ⇄ Hải Phòng' },
        { name: 'Anh Nam', phone: '0977123456', route: 'Long Biên ⇄ Hạ Long' },
        { name: 'Chị Linh', phone: '0355555999', route: 'Hà Đông ⇄ Phú Thọ' },
        { name: 'Tài xế 1', phone: '0927735274', route: 'Giáp Bát ⇄ Ninh Bình' },
        { name: 'Tài xế 2', phone: '0924649610', route: 'Hà Nội ⇄ Hải Dương' },
        { name: 'Tài xế 3', phone: '0844657330', route: 'Hà Nội ⇄ Bắc Ninh' },
        { name: 'Tài xế 4', phone: '0779966349', route: 'Mỹ Đình ⇄ Nội Bài' },
        { name: 'Tài xế 5', phone: '0889345121', route: 'Hà Nội ⇄ Nam Định' },
        { name: 'Tài xế 6', phone: '0325463415', route: 'Cầu Giấy ⇄ Hưng Yên' }
      ];

      await DriverPost.insertMany(drivers);
      console.log('Sample driver posts created');
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
