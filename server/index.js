const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // npm install cors

const port = process.env.PORT || 5000;

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// 👇 CRASH PROOF FOLDER SETUP
// Hum root mein 'uploads' folder banayenge jo har jagah chalta hai
const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)){
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`📂 Created Uploads Folder at: ${uploadDir}`);
    } catch (err) {
        console.log("⚠️ Error creating folder:", err);
    }
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Folder Public Karo
app.use('/uploads', express.static(uploadDir));

app.get('/', (req, res) => res.send('Server is Running 🚀'));
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));