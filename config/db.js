require('dotenv').config();
const mongoose = require('mongoose');

async function connectDB() {
  await mongoose.connect(process.env.MONGO_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferCommands: false
  });

  const connection = mongoose.connection;
  connection.on('error', (err) => {
    console.log('DB Connection Failed', err);
  });
  connection.once('open', () => {
    console.log('DB Connection Successful');
  });
}

module.exports = connectDB;