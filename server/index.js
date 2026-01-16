const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Config
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

// --- IMPORT ROUTES ---
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes'); // Tera Purana chat route
const notificationRoutes = require('./routes/notificationRoutes'); 
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// 👇 NEW: Abhi jo humne naya banaya (HTTP Polling Chat ke liye)
const messageRoutes = require('./routes/messageRoutes'); 

// --- USE ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes); // Purana wala chalne de
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// 👇 NEW: Naya Route Link kiya
app.use('/api/messages', messageRoutes); 

// Static Folder
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Root Route
app.get('/', (req, res) => { res.send('API is running...'); });

// --- SOCKET.IO SETUP (Tera Purana Code As-is) ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  // console.log('Socket Connected:', socket.id);

  socket.on('join_room', (userId) => { socket.join(userId); });

  socket.on('send_message', async (data) => {
    const { sender, receiver, message } = data;
    try {
        // Ensure path correct hai
        const Message = require('./models/Message'); 
        const newMsg = await Message.create({ sender, receiver, message, isRead: false });
        io.to(receiver).emit('receive_message', newMsg);
    } catch(e) {
        console.error("Socket Error:", e);
    }
  });

  socket.on('mark_as_seen', async ({ senderId, receiverId }) => {
    try {
        const Message = require('./models/Message');
        await Message.updateMany(
            { sender: senderId, receiver: receiverId, isRead: false },
            { $set: { isRead: true } }
        );
        io.to(senderId).emit('msg_seen_update', { receiverId });
    } catch (e) { console.error(e); }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`💬 Message Routes Active`);
});