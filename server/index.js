const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// 👇 SECURITY IMPORTS (Naye wale)
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Config
dotenv.config();
connectDB();

const app = express();

// 🔒 1. SECURITY HEADERS (Helmet)
// crossOriginResourcePolicy: false isliye kiya taaki frontend se images load ho sakein
app.use(helmet({ crossOriginResourcePolicy: false }));

// 🔒 2. RATE LIMITING (Spam rokne ke liye)
// 15 minute mein max 100 requests allow karega ek IP se
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use('/api', limiter); // Sirf API routes pe limit lagayi hai

// 🔒 3. CORS (Specific Websites ko allow karo)
// Jab live ho jaye toh localhost hata ke sirf apna domain rakhna
app.use(cors({
    origin: ["http://localhost:5173", "https://campussponsor.in", "https://your-render-url.onrender.com"],
    credentials: true
}));

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// --- IMPORT ROUTES ---
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); 
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const messageRoutes = require('./routes/messageRoutes'); 

// --- USE ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/messages', messageRoutes); 

// Static Folder (Images ke liye)
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Root Route
app.get('/', (req, res) => { res.send('CampusSponsor API is running securely... 🛡️'); });

// --- SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  // Socket ke liye bhi CORS set kar diya
  cors: { 
      origin: ["http://localhost:5173", "https://campussponsor.in"],
      methods: ["GET", "POST"] 
  }
});

io.on('connection', (socket) => {
  // console.log('Socket Connected:', socket.id);

  socket.on('join_room', (userId) => { socket.join(userId); });

  socket.on('send_message', async (data) => {
    const { sender, receiver, message } = data;
    try {
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
    console.log(`🚀 Server running securely on port ${PORT}`);
});