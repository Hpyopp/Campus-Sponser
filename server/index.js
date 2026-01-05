const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// 1. Config sabse pehle
dotenv.config();
connectDB();

const app = express();

// 👇👇 YE LINE SABSE ZAROORI HAI (Razorpay Fix) 👇👇
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
// 👆👆 ---------------------------------------- 👆👆

app.use(cors());

// Routes
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); 
const reportRoutes = require('./routes/reportRoutes');

// Mount Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => { res.send('API is running...'); });

// Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: err.message });
});

// Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  // Socket logic same as before...
  socket.on('join_room', (userId) => { socket.join(userId); });
  socket.on('send_message', async (data) => {
    const { sender, receiver, message } = data;
    try {
        const Message = require('./models/Message');
        await Message.create({ sender, receiver, message });
        io.to(receiver).emit('receive_message', data);
    } catch(e) {}
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));