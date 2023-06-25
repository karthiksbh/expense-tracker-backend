require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const requestRoutes = require('./routes/requestRoutes');

connectDB = require('./config/db');
connectDB();

connectDB().then(() => {
    app.use('/users', userRoutes);
    app.use('/expense', expenseRoutes);
    app.use('/request',requestRoutes);
  
    const PORT = process.env.PORT || 3000;
  
    app.listen(PORT, () => {
      console.log(`Server running at ${PORT}`);
    });
});


app.use('/users', userRoutes);
app.use('/expense', expenseRoutes);