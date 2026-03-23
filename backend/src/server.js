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

// MongoDB connection
mongoose.connect(config.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});


