const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const path = require('path'); 
const fs = require('fs');
const cors = require('cors'); // Ab ye error nahi dega kyunki tune Step 1 kar liya

const port = process.env.PORT || 5000;

// Database Connect
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors()); 

// Auto-Create Uploads Folder (Crash Proof)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    console.log('📂 Uploads folder created automatically!');
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Public Folder
app.use('/uploads', express.static(uploadDir));

// Error Handler
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));