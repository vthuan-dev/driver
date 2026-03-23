const mongoose = require('./backend/node_modules/mongoose');
const DriverPost = require('./backend/src/models/DriverPost');

// Kết nối MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://100103:vthuandev@cluster0.jffqvf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const seedSouthCentralDrivers = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 10 tài xế miền Nam
    const southDrivers = [
      { name: 'Anh Khai', phone: '0903456789', route: 'TP HCM <-> Vũng Tàu', region: 'south' },
      { name: 'Anh Phương', phone: '0939345123', route: 'TP HCM <-> Cần Thơ', region: 'south' },
      { name: 'Anh Cường', phone: '0988123456', route: 'Biên Hòa <-> Long An', region: 'south' },
      { name: 'Chị Trang', phone: '0977456123', route: 'TP HCM <-> Tây Ninh', region: 'south' },
      { name: 'Anh Lộc', phone: '0911778899', route: 'Cần Thơ <-> Cà Mau', region: 'south' },
      { name: 'Anh Việt', phone: '0906677889', route: 'TP HCM <-> Vĩnh Long', region: 'south' },
      { name: 'Anh Danh', phone: '0938222333', route: 'TP HCM <-> Tiền Giang', region: 'south' },
      { name: 'Anh Bảo', phone: '0977555333', route: 'TP HCM <-> Bến Tre', region: 'south' },
      { name: 'Anh Phát', phone: '0965222444', route: 'TP HCM <-> Bình Dương', region: 'south' },
      { name: 'Chị Nhi', phone: '0924333444', route: 'Cần Thơ <-> Kiên Giang', region: 'south' }
    ];

    // 10 tài xế miền Trung
    const centralDrivers = [
      { name: 'Anh Khoa', phone: '0934567890', route: 'Đà Nẵng <-> Huế', region: 'central' },
      { name: 'Anh Thọ', phone: '0905671234', route: 'Đà Nẵng <-> Quảng Nam', region: 'central' },
      { name: 'Anh Hùng', phone: '0978112233', route: 'Quy Nhon <-> Pleiku', region: 'central' },
      { name: 'Anh Minh', phone: '0965123789', route: 'Nha Trang <-> Đà Lạt', region: 'central' },
      { name: 'Chị Yến', phone: '0923456781', route: 'Huế <-> Quảng Trị', region: 'central' },
      { name: 'Anh Phúc', phone: '0907788991', route: 'Đà Nẵng <-> Quảng Ngãi', region: 'central' },
      { name: 'Anh Sơn', phone: '0935111222', route: 'Đà Nẵng <-> Quảng Bình', region: 'central' },
      { name: 'Anh Tiến', phone: '0978999111', route: 'Nha Trang <-> Phan Rang', region: 'central' },
      { name: 'Anh Long', phone: '0965222333', route: 'Quy Nhon <-> Kon Tum', region: 'central' },
      { name: 'Chị Hà', phone: '0924666888', route: 'Huế <-> Đà Nẵng', region: 'central' }
    ];

    // Xóa tài xế cũ của miền Nam và Trung (nếu có)
    console.log('🗑️ Cleaning old South & Central drivers...');
    await DriverPost.deleteMany({ region: { $in: ['south', 'central'] } });

    // Thêm tài xế miền Nam
    console.log('🌴 Adding South drivers...');
    const southResult = await DriverPost.insertMany(southDrivers);
    console.log(`✅ Added ${southResult.length} South drivers`);

    // Thêm tài xế miền Trung
    console.log('🏔️ Adding Central drivers...');
    const centralResult = await DriverPost.insertMany(centralDrivers);
    console.log(`✅ Added ${centralResult.length} Central drivers`);

    // Kiểm tra kết quả
    const totalSouth = await DriverPost.countDocuments({ region: 'south' });
    const totalCentral = await DriverPost.countDocuments({ region: 'central' });
    const totalNorth = await DriverPost.countDocuments({ region: 'north' });

    console.log('\n📊 Database Summary:');
    console.log(`🌴 Miền Nam: ${totalSouth} tài xế`);
    console.log(`🏔️ Miền Trung: ${totalCentral} tài xế`);
    console.log(`❄️ Miền Bắc: ${totalNorth} tài xế`);
    console.log(`📱 Tổng cộng: ${totalSouth + totalCentral + totalNorth} tài xế`);

    console.log('\n🎯 Test API endpoints:');
    console.log('curl "https://driver-ahv6.onrender.com/api/drivers?region=south"');
    console.log('curl "https://driver-ahv6.onrender.com/api/drivers?region=central"');

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedSouthCentralDrivers();