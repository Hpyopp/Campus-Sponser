const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');

const port = process.env.PORT || 5000;

// Database Connect
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 👇 ROUTES CONFIGURATION (Dhyan se dekhna)
// Hum '/api/users' use karenge, '/api/auth' nahi.
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));