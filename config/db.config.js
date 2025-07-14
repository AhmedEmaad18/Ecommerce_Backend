const mongoose = require('mongoose');
const connectionstring = process.env.CONNECTIONSTRING;
const connectdb = async () => {
  try {
    const connection = await mongoose.connect(connectionstring || 'mongodb://localhost:27017/Ecomm');
    console.log(`Connected to MongoDB: ${connection.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
module.exports = connectdb;