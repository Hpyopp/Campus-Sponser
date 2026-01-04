const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Config
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// --- IMPORTS ---
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // 👈 NEW ADDITION (Payment Route)

// --- DEBUGGING LOGS (Terminal mein dikhenge) ---
console.log("------------------------------------------------");
console.log("🛠️  ROUTE CHECK:");
console.log("User Routes Type:", typeof userRoutes === 'function' ? '✅ Function (Correct)' : '❌ Object (WRONG!)');
console.log("Event Routes Type:", typeof eventRoutes === 'function' ? '✅ Function (Correct)' : '❌ Object (WRONG!)');
console.log("Payment Routes Type:", typeof paymentRoutes === 'function' ? '✅ Function (Correct)' : '❌ Object (WRONG!)'); // 👈 Check Payment Route
console.log("------------------------------------------------");

// --- MOUNT ROUTES ---

// 1. User Routes
if (typeof userRoutes === 'function') {
    app.use('/api/users', userRoutes);
} else {
    console.error("🚨 CRITICAL ERROR: userRoutes.js is not exporting a router function!");
}

// 2. Event Routes
if (typeof eventRoutes === 'function') {
    app.use('/api/events', eventRoutes);
} else {
    console.error("🚨 CRITICAL ERROR: eventRoutes.js is not exporting a router function!");
}

// 3. Payment Routes (👈 NEW ADDITION)
if (typeof paymentRoutes === 'function') {
    app.use('/api/payment', paymentRoutes);
} else {
    console.error("🚨 CRITICAL ERROR: paymentRoutes.js is not exporting a router function! Check file path.");
}

// Upload Folder Static Access
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`🚀 Server running on port ${PORT}`));