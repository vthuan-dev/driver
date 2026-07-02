const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const { sequelize } = require('./models');
const telegramBot = require('./utils/telegram');


// Load environment variables
dotenv.config();

const app = express();
const PORT = config.PORT || 5000;

// Middleware
const allowedOrigins = [
  'https://driver-uenm.vercel.app',
  'https://driver-client-bice.vercel.app',
  'https://180-93-35-55.sslip.io',
  'https://us.180-93-35-55.sslip.io',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:24326',
];
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/driver', require('./routes/driver'));
app.use('/api/admin/fake-notifications', require('./routes/fakeNotifications'));
app.use('/api/admin/settings', require('./routes/settings'));
app.use('/api/driver/fake-notifications', require('./routes/driverFakeNotifications'));

// Public bank config endpoint (no auth required)
const { AppSetting } = require('./models');
app.get('/api/settings/bank', async (req, res) => {
  try {
    let settings = await AppSetting.findOne();
    if (!settings) {
      settings = await AppSetting.create({
        minFakeCount: 3,
        maxFakeCount: 4,
        minFakeInterval: 15,
        maxFakeInterval: 30
      });
    }
    res.json({
      success: true,
      data: {
        bankCode: settings.bankCode,
        bankName: settings.bankName,
        accountNo: settings.accountNo,
        accountName: settings.accountName
      }
    });
  } catch (error) {
    console.error('Error getting bank settings:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// APK Download Route - Using streaming for large files
app.get('/api/download/app', (req, res) => {
  const apkPath = path.join(__dirname, '..', 'driver-app.apk');
  
  // Check if file exists
  if (!fs.existsSync(apkPath)) {
    return res.status(404).json({ message: 'File APK không tồn tại' });
  }
  
  // Get file stats
  const stat = fs.statSync(apkPath);
  const fileSize = stat.size;
  
  // Set headers for download
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="Driver.apk"');
  res.setHeader('Content-Length', fileSize);
  res.setHeader('Cache-Control', 'no-cache');
  
  // Stream the file
  const fileStream = fs.createReadStream(apkPath);
  fileStream.pipe(res);
  
  fileStream.on('error', (err) => {
    console.error('Error streaming APK:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Lỗi khi tải file APK' });
    }
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'connecting';
  }

  res.json({
    status: 'ok',
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Driver App Backend API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Ensure we always send JSON response
  if (!res.headersSent) {
    return res.status(err.status || 500).json({ 
      success: false,
      message: err.message || 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

// Connect DB and Start Server
sequelize.authenticate()
  .then(() => {
    console.log('Connected to MySQL via Sequelize');
    // For local dev, you can use sync({ alter: true }). 
    // In production, migrations should be used.
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      // Initialize Telegram Bot
      telegramBot.initTelegramBot();
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
