// Environment configuration
module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://100103:vthuandev@cluster0.jffqvf5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  PORT: process.env.PORT || 5000
};
