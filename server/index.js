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
const analyticsRoutes = require('./routes/analyticsRoutes'); // 👈 NEW IMPORT

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes); // 👈 NEW USE

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => { res.send('API is running...'); });

// Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  socket.on('join_room', (userId) => { socket.join(userId); });

  socket.on('send_message', async (data) => {
    const { sender, receiver, message } = data;
    try {
        const Message = require('./models/Message');
        const newMsg = await Message.create({ sender, receiver, message, isRead: false });
        io.to(receiver).emit('receive_message', newMsg);
    } catch(e) {}
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
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));