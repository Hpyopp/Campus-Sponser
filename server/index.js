const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http'); // 👈 Required for Socket
const { Server } = require('socket.io'); // 👈 Required for Socket

// Config
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// --- ROUTES IMPORTS ---
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); 
const reportRoutes = require('./routes/reportRoutes');// 👈 NEW CHAT ROUTE

// --- MOUNT ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes); // 👈 MOUNT REPORT ROUTE

// Static Uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => { res.send('API is running...'); });

// Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: err.message });
});

// ==========================================
// ⚡ SOCKET.IO SETUP (REAL-TIME CHAT)
// ==========================================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (Development ke liye easy)
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`⚡ Socket Connected: ${socket.id}`);

  // User joins their own room (based on User ID)
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  // Send Message
  socket.on('send_message', async (data) => {
    const { sender, receiver, message } = data;
    
    // Save to DB (Taaki refresh karne pe gayab na ho)
    const Message = require('./models/Message');
    await Message.create({ sender, receiver, message });

    // Send to Receiver instantly
    io.to(receiver).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
});

const PORT = process.env.PORT || 5000;
// Note: app.listen nahi, server.listen use karna hai
server.listen(PORT, () => console.log(`🚀 Server & Socket running on port ${PORT}`));