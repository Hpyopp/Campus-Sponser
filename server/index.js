const express = require('express');
// const colors = require('colors'); // 👈 HATA DIYA (Ye error de raha tha)
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const path = require('path'); 
const cors = require('cors'); // Note: Agar ispe error aaye toh 'npm install cors' karna padega

const port = process.env.PORT || 5000;

// Database Connect
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors()); // Frontend connection ke liye zaroori hai

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// 📂 Upload Folder Public Karo
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error Handler
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));