const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');

const port = process.env.PORT || 5000;

// Database Connect
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// 👇 STATIC FILES CONFIG (Render Fix)
// Render ke '/tmp' folder ko public bana rahe hain
// Taaki browser usse access kar sake (e.g. backend.com/tmp/doc-123.jpg)
app.use('/tmp', express.static('/tmp'));

// Test Route
app.get('/', (req, res) => res.send('Server is Running 🚀'));

// Error Handler
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));