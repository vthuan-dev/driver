const fs = require('fs');
const path = require('path');
const { sequelize, Admin, User, DriverPost, WaitingRequest, FakeNotification, AppSetting } = require('./src/models');

const backupDir = path.join(__dirname, 'mongo-backup');

async function seed() {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    // ID Maps to preserve relationships
    const adminMap = {}; // mongoId -> mysqlId
    const userMap = {};  // mongoId -> mysqlId

    // 1. Seed Admins
    console.log('Seeding Admins...');
    const adminsData = JSON.parse(fs.readFileSync(path.join(backupDir, 'admins.json')));
    for (const data of adminsData) {
      const admin = await Admin.create({
        username: data.username,
        password: data.password, // This will be double hashed if we don't bypass hook. But the hook checks if password changed. If we just bulkCreate we can bypass hooks.
        role: data.role || 'admin',
        createdAt: new Date(data.createdAt || data.date || Date.now())
      }, { hooks: false }); // Bypass hooks so password isn't re-hashed
      adminMap[data._id.toString()] = admin.id;
    }
    console.log(`Seeded ${adminsData.length} admins.`);

    // 2. Seed Users
    console.log('Seeding Users...');
    const usersData = JSON.parse(fs.readFileSync(path.join(backupDir, 'users.json')));
    for (const data of usersData) {
      const user = await User.create({
        name: data.name,
        phone: data.phone,
        password: data.password,
        carType: data.carType || '4',
        carYear: data.carYear || '2020',
        carImage: data.carImage || '',
        status: data.status || 'pending',
        depositBalance: data.depositBalance || 200000,
        approvedAt: data.approvedAt ? new Date(data.approvedAt) : null,
        approvedById: data.approvedBy ? adminMap[data.approvedBy.toString()] : null,
        createdAt: new Date(data.createdAt || data.date || Date.now())
      }, { hooks: false });
      userMap[data._id.toString()] = user.id;
    }
    console.log(`Seeded ${usersData.length} users.`);

    // 3. Seed DriverPosts
    console.log('Seeding DriverPosts...');
    const driverPostsData = JSON.parse(fs.readFileSync(path.join(backupDir, 'driverposts.json')));
    for (const data of driverPostsData) {
      await DriverPost.create({
        name: data.name,
        phone: data.phone,
        route: data.route,
        avatar: data.avatar || '',
        region: data.region || 'north',
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date(data.createdAt || data.date || Date.now())
      });
    }
    console.log(`Seeded ${driverPostsData.length} driver posts.`);

    // 4. Seed WaitingRequests
    console.log('Seeding WaitingRequests...');
    const waitingRequestsData = JSON.parse(fs.readFileSync(path.join(backupDir, 'waitingrequests.json')));
    // It has 4000+ requests. Use bulkCreate for speed.
    const wrRows = waitingRequestsData.map(data => ({
      userId: data.userId ? userMap[data.userId.toString()] : null,
      name: data.name,
      phone: data.phone,
      startPoint: data.startPoint,
      endPoint: data.endPoint,
      price: data.price,
      note: data.note || '',
      status: data.status || 'waiting',
      region: data.region || 'north',
      createdAt: new Date(data.createdAt || data.date || Date.now())
    }));
    let count = 0;
    for (const data of wrRows) {
      await WaitingRequest.create(data);
      count++;
    }
    console.log(`Seeded ${count} waiting requests.`);

    // 5. Seed FakeNotifications
    console.log('Seeding FakeNotifications...');
    const fakeNotifsData = JSON.parse(fs.readFileSync(path.join(backupDir, 'fakenotifications.json')));
    for (const data of fakeNotifsData) {
      await FakeNotification.create({
        region: data.region || 'north',
        startPoint: data.startPoint,
        endPoint: data.endPoint,
        displayTime: data.displayTime,
        carType: data.carType,
        price: data.price,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdById: adminMap[data.createdBy.toString()] || 1,
        createdAt: new Date(data.createdAt || data.date || Date.now())
      });
    }
    console.log(`Seeded ${fakeNotifsData.length} fake notifications.`);

    // 6. Seed AppSettings
    console.log('Seeding AppSettings...');
    const appSettingsData = JSON.parse(fs.readFileSync(path.join(backupDir, 'appsettings.json')));
    if (appSettingsData.length > 0) {
      const data = appSettingsData[0];
      await AppSetting.create({
        minFakeCount: data.minFakeCount,
        maxFakeCount: data.maxFakeCount,
        minFakeInterval: data.minFakeInterval,
        maxFakeInterval: data.maxFakeInterval
      });
      console.log(`Seeded AppSettings.`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
