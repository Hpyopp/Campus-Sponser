const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors'); // 👈 Naya Import
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');

const port = process.env.PORT || 5000;

// Database Connect
connectDB();

const app = express();

// 👇 SABSE ZAROORI: CORS Enable Karo
app.use(cors()); 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Error Handler
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));