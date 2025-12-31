const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const port = process.env.PORT || 5000;

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 👇 1. WELCOME ROUTE (Ye 'Cannot GET /' ko hatayega)
app.get('/', (req, res) => {
    res.send('API is Running Successfully 🚀');
});

// 👇 2. MAIN ROUTES
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Error Handler
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));