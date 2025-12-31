const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const path = require('path'); 
const fs = require('fs');
const cors = require('cors'); // Ensure ye installed ho

const port = process.env.PORT || 5000;

// Database Connect
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors()); 

// Auto-Create Uploads Folder (Safety Check)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    try {
        fs.mkdirSync(uploadDir);
        console.log('📂 Uploads folder created!');
    } catch (err) {
        console.log('Error creating upload folder:', err);
    }
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Public Folder for Uploads
app.use('/uploads', express.static(uploadDir));

// Test Route (Taaki pata chale server zinda hai)
app.get('/', (req, res) => res.send('Server is Running 🚀'));

// Error Handler
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));