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
        { name: 'Anh Tuan', phone: '0912345678', route: 'Ha Noi <-> Lao Cai', region: 'north' },
        { name: 'Chi Hanh', phone: '0987654321', route: 'Ha Noi <-> Ninh Binh', region: 'north' },
        { name: 'Anh Duong', phone: '0901234567', route: 'My Dinh <-> Noi Bai', region: 'north' },
        { name: 'Anh Hoang', phone: '0968888777', route: 'Cau Giay <-> Hai Phong', region: 'north' },
        { name: 'Anh Nam', phone: '0977123456', route: 'Long Bien <-> Ha Long', region: 'north' },
        { name: 'Chi Linh', phone: '0355555999', route: 'Ha Dong <-> Phu Tho', region: 'north' },
        { name: 'Bac Tuan', phone: '0934567123', route: 'Ha Noi <-> Dien Bien', region: 'north' },
        { name: 'Anh Thang', phone: '0945678123', route: 'Ha Noi <-> Son La', region: 'north' },
        { name: 'Anh Vinh', phone: '0911222333', route: 'Ha Noi <-> Ha Giang', region: 'north' },
        { name: 'Anh Tam', phone: '0977333555', route: 'Ha Noi <-> Yen Bai', region: 'north' },
        { name: 'Anh Khoa', phone: '0934567890', route: 'Da Nang <-> Hue', region: 'central' },
        { name: 'Anh Tho', phone: '0905671234', route: 'Da Nang <-> Quang Nam', region: 'central' },
        { name: 'Anh Hung', phone: '0978112233', route: 'Quy Nhon <-> Pleiku', region: 'central' },
        { name: 'Anh Minh', phone: '0965123789', route: 'Nha Trang <-> Da Lat', region: 'central' },
        { name: 'Chi Yen', phone: '0923456781', route: 'Hue <-> Quang Tri', region: 'central' },
        { name: 'Anh Khai', phone: '0903456789', route: 'TP HCM <-> Vung Tau', region: 'south' },
        { name: 'Anh Phuong', phone: '0939345123', route: 'TP HCM <-> Can Tho', region: 'south' },
        { name: 'Anh Cuong', phone: '0988123456', route: 'Bien Hoa <-> Long An', region: 'south' },
        { name: 'Chi Trang', phone: '0977456123', route: 'TP HCM <-> Tay Ninh', region: 'south' },
        { name: 'Anh Loc', phone: '0911778899', route: 'Can Tho <-> Ca Mau', region: 'south' }
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

