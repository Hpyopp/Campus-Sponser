const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const path = require('path'); 
const fs = require('fs');
const cors = require('cors');

const port = process.env.PORT || 5000;

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors()); // Frontend connection allow karo

// 👇 CRASH PROOF FOLDER CREATION
// Render par kabhi-kabhi folder banane ki permission nahi hoti, 
// isliye hum 'try-catch' lagayenge taaki server na ruke.
const uploadDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('📂 Uploads folder created!');
    }
} catch (err) {
    console.log('⚠️ Could not create upload folder (Check Permissions):', err);
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Public Folder
app.use('/uploads', express.static(uploadDir));

// Test Route (Browser mein API link khol kar check karne ke liye)
app.get('/', (req, res) => res.send('✅ Server is Running Successfully!'));

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));