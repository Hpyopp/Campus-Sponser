const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// 1. Config sabse pehle load karo
dotenv.config();

// 2. Database connect
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// --- ROUTES IMPORTS ---
// IMPORTANT: Ensure ye paths sahi hon
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // 👈 Payment Route Import
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); 
const reportRoutes = require('./routes/reportRoutes');

// --- MOUNT ROUTES ---
// Debugging log taaki pata chale routes load huye
console.log("✅ Mounting Routes...");

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payment', paymentRoutes); // 👈 Payment Route Mount (Singular 'payment')
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Static Uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => { res.send('API is running...'); });

// Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: err.message });
});

// ==========================================
// ⚡ SOCKET.IO SETUP
// ==========================================
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log(`⚡ Socket Connected: ${socket.id}`);
  socket.on('join_room', (userId) => { socket.join(userId); });
  socket.on('send_message', async (data) => {
    const { sender, receiver, message } = data;
    try {
        const Message = require('./models/Message');
        await Message.create({ sender, receiver, message });
        io.to(receiver).emit('receive_message', data);
    } catch(e) { console.error("Message Save Error", e); }
  });
  socket.on('disconnect', () => { console.log('User Disconnected'); });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server & Socket running on port ${PORT}`));