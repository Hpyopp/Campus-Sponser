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
app.use(cors());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// 👇 IMPORTANT: /tmp folder ko public karo
// Taaki browser usse access kar sake (e.g., website.com/tmp/image.png)
app.use('/tmp', express.static('/tmp'));

app.get('/', (req, res) => res.send('Server & File System Running 🚀'));

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));