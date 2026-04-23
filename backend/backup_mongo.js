const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const URI = 'mongodb+srv://100103:vthuandev@cluster0.jffqvf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function backup() {
  if (!URI) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(URI, { serverSelectionTimeoutMS: 15000, family: 4 });
    console.log('Connected to MongoDB Atlas');
    
    const collections = ['driverposts', 'waitingrequests', 'users', 'admins', 'fakenotifications', 'appsettings'];
    const backupDir = path.join(__dirname, 'mongo-backup');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    for (const col of collections) {
      try {
        const data = await mongoose.connection.collection(col).find({}).toArray();
        fs.writeFileSync(path.join(backupDir, `${col}.json`), JSON.stringify(data, null, 2));
        console.log(`Exported ${col}: ${data.length} docs`);
      } catch(e) { 
        console.warn(`Skip ${col}:`, e.message); 
      }
    }
    
    await mongoose.disconnect();
    console.log('Backup completed successfully.');
  } catch (error) {
    console.error('Backup failed:', error);
  }
}

backup();
