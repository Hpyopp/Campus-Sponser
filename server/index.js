const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const port = process.env.PORT || 5000;

// Database Connection
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 👇 TEST ROUTE (Ye confirm karega ki naya code live hai)
app.get('/', (req, res) => {
    res.status(200).send("✅ API is Live & Updated! (New Code)");
});

// 👇 MAIN ROUTES (Yahan se rasta ban raha hai)
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Error Handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`🚀 SERVER RESTARTED ON PORT ${port}`); // Logs mein ye dhundna hai
});