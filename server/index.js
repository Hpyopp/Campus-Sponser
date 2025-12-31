const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const path = require('path'); 
const fs = require('fs'); // 👈 IMPORT FS MODULE
const cors = require('cors');

const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// 👇 AUTO-CREATE UPLOADS FOLDER
// Ye code check karega ki folder hai ya nahi. Nahi toh bana dega.
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    console.log('📂 Uploads folder created automatically!');
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Folder ko Public karo
app.use('/uploads', express.static(uploadDir));

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));