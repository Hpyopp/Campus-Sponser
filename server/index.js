require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Sirf ek baar import karo
const connectDB = require('./config/db');

const app = express();

// Database Connect
connectDB();

// 👇 MIDDLEWARE SABSE PEHLE AATE HAIN
// 1. CORS Configuration (Sabse Important)
app.use(cors({
    origin: ["http://localhost:5173", "https://campus-sponser.vercel.app"],
    credentials: true
}));

// 2. JSON Parser
app.use(express.json());

// 👇 ROUTES USKE BAAD AATE HAIN
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Test Route
app.get('/', (req, res) => {
    res.send("CampuSponsor API is Running... 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🔥`);
});