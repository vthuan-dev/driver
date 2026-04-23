const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');

// Load environment variables
dotenv.config();

const app = express();
const PORT = config.PORT;

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

// Health check endpoint (dùng để wake Render server + check kết nối)
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ 
    status: 'ok', 
    db: states[dbState] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  family: 4,
};

const connectMongoDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Retry after 5 seconds
    setTimeout(connectMongoDB, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected! Attempting to reconnect...');
  setTimeout(connectMongoDB, 3000);
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected!');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error event:', err.message);
});

connectMongoDB();

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Driver App Backend API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);

  // Self-ping mỗi 14 phút để tránh Render free-tier sleep
  const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  setInterval(async () => {
    try {
      const http = require('http');
      const https = require('https');
      const url = `${BACKEND_URL}/api/health`;
      const client = url.startsWith('https') ? https : http;
      client.get(url, (res) => {
        console.log(`[Keep-alive] ping ${url} → ${res.statusCode}`);
      }).on('error', (e) => {
        console.warn('[Keep-alive] ping error:', e.message);
      });
    } catch (e) {
      console.warn('[Keep-alive] error:', e.message);
    }
  }, 14 * 60 * 1000); // 14 phút
});

