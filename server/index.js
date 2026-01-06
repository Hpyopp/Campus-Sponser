const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
connectDB();

const app = express();

// 👇 Razorpay Fix (Zaroori hai)
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
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

// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log(`⚡ Socket Connected: ${socket.id}`);

  socket.on('join_room', (userId) => { 
      socket.join(userId); 
  });

  // 1. Send Message Logic
  socket.on('send_message', async (data) => {
    const { sender, receiver, message } = data;
    try {
        const Message = require('./models/Message');
        // Naya message by default unread (isRead: false) hoga
        const newMsg = await Message.create({ sender, receiver, message, isRead: false });
        io.to(receiver).emit('receive_message', newMsg);
    } catch(e) { console.error("Message Error:", e); }
  });

  // 2. 👇 NEW: Mark as Seen Logic (Insta Style)
  socket.on('mark_as_seen', async ({ senderId, receiverId }) => {
    try {
        const Message = require('./models/Message');
        // Database mein update karo ki messages padh liye gaye
        await Message.updateMany(
            { sender: senderId, receiver: receiverId, isRead: false },
            { $set: { isRead: true } }
        );
        // Sender ko batao ki "Tera message Seen ho gaya"
        io.to(senderId).emit('message_seen_update', { seerId: receiverId });
    } catch (e) { console.error(e); }
  });

  socket.on('disconnect', () => { console.log('User Disconnected'); });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));