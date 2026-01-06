import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const startChatId = searchParams.get('userId');
  const user = JSON.parse(localStorage.getItem('user'));

  // Smart Endpoint Logic
  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef();

  // 1. Socket Initialize
  useEffect(() => {
    const s = io(ENDPOINT);
    setSocket(s);
    if (user) s.emit("join_room", user._id);
    return () => s.disconnect();
  }, []);

  // 2. Incoming Messages & Seen Updates
  useEffect(() => {
    if (!socket) return;
    
    // Message Receive Listener
    socket.on("receive_message", (data) => {
      if (currentChat && (data.sender === currentChat._id || data.sender === user._id)) {
        setMessages((prev) => [...prev, data]);
        // Agar chat khuli hai, toh turant SEEN mark karo
        if (data.sender === currentChat._id) {
            socket.emit("mark_as_seen", { senderId: data.sender, receiverId: user._id });
        }
      } else {
        toast("New Message Received 📩");
        fetchConversations();
      }
    });

    // 👇 Seen Update Listener (Blue Tick Logic)
    socket.on("message_seen_update", ({ seerId }) => {
        if (currentChat && currentChat._id === seerId) {
            setMessages(prev => prev.map(msg => 
                msg.sender === user._id ? { ...msg, isRead: true } : msg
            ));
        }
    });

  }, [socket, currentChat]);

  // 3. Mark as Seen when Chat Opens
  useEffect(() => {
      if (socket && currentChat) {
          socket.emit("mark_as_seen", { senderId: currentChat._id, receiverId: user._id });
      }
  }, [currentChat, socket]);

  // 4. Fetch Users
  const fetchConversations = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${ENDPOINT}/api/chat/conversations/all`, config);
      setConversations(data);

      if (startChatId) {
        const exists = data.find(u => u._id === startChatId);
        if (!exists) {
            const userRes = await axios.get(`${ENDPOINT}/api/users/u/${startChatId}`);
            const newUser = { _id: userRes.data.user._id, name: userRes.data.user.name, role: userRes.data.user.role };
            setConversations(prev => [newUser, ...prev]);
            setCurrentChat(newUser);
        } else {
            setCurrentChat(exists);
        }
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchConversations(); }, [startChatId]);

  // 5. Fetch Chat History
  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${ENDPOINT}/api/chat/${currentChat._id}`, config);
        setMessages(data);
      } catch (err) { console.error(err); }
    };
    getMessages();
  }, [currentChat]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // 6. Send Message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
      sender: user._id, receiver: currentChat._id, message: newMessage,
      createdAt: new Date().toISOString(), isRead: false 
    };

    socket.emit("send_message", msgData);
    setMessages((prev) => [...prev, msgData]);
    setNewMessage("");
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: '#f1f5f9', fontFamily: 'Poppins' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '300px', background: 'white', borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Messages 💬</h2>
        </div>
        {conversations.map((c) => (
          <div key={c._id} onClick={() => setCurrentChat(c)}
            style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: currentChat?._id === c._id ? '#eff6ff' : 'white', borderBottom: '1px solid #f8fafc' }}>
            <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {c.name?.charAt(0)}
            </div>
            <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>{c.name}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{c.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentChat ? (
            <>
                {/* Header */}
                <div style={{ padding: '15px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '35px', height: '35px', background: '#3b82f6', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{currentChat.name?.charAt(0)}</div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{currentChat.name}</h3>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {messages.map((m, index) => (
                        <div key={index} ref={scrollRef} style={{ alignSelf: m.sender === user._id ? 'flex-end' : 'flex-start', maxWidth: '70%', display:'flex', flexDirection:'column', alignItems: m.sender === user._id ? 'flex-end' : 'flex-start' }}>
                            <div style={{ padding: '10px 15px', borderRadius: '15px', background: m.sender === user._id ? '#2563eb' : 'white', color: m.sender === user._id ? 'white' : '#1e293b', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderTopRightRadius: m.sender === user._id ? '0' : '15px', borderTopLeftRadius: m.sender === user._id ? '15px' : '0' }}>
                                {m.message}
                            </div>
                            
                            {/* 👇 SEEN INDICATOR (Last Message par) */}
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px' }}>
                                {m.sender === user._id ? (m.isRead ? "Seen ✅" : "Delivered") : ""}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} style={{ padding: '20px', background: 'white', display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    <button type="submit" style={{ padding: '12px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>Send 🚀</button>
                </form>
            </>
        ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '1.2rem' }}>Select a user to start chatting 👋</div>
        )}
      </div>
    </div>
  );
};

export default Chat;