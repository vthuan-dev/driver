const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const { sequelize } = require('./models');

// Load environment variables
dotenv.config();

const app = express();
const PORT = config.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Cho phép tất cả origins
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
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect DB and Start Server
sequelize.authenticate()
  .then(() => {
    console.log('Connected to MySQL via Sequelize');
    // For local dev, you can use sync({ alter: true }). 
    // In production, migrations should be used.
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
