import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const scrollRef = useRef();
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const ENDPOINT = window.location.hostname === 'localhost'
    ? "http://127.0.0.1:5000"
    : "https://campus-sponser-api.onrender.com";

  // 1. Fetch My Conversations (Sidebar)
  const fetchConversations = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${ENDPOINT}/api/messages/conversations`, config);
      setConversations(data);
    } catch (error) { console.error("Error fetching chats", error); }
  };

  // 2. Fetch Messages for Selected Chat
  const fetchMessages = async () => {
    if (!currentChat) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${ENDPOINT}/api/messages/${currentChat._id}`, config);
      setMessages(data);
    } catch (error) { console.error("Error fetching messages", error); }
  };

  // 🔄 Auto-Refresh Logic (Real-time feel without Socket.io)
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
        if(currentChat) fetchMessages(); // Chat khuli hai to refresh karo
    }, 3000); // Har 3 second mein check karega
    return () => clearInterval(interval);
  }, [currentChat]);

  // 3. Send Message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${ENDPOINT}/api/messages`, {
        content: newMessage,
        receiverId: currentChat._id
      }, config);
      
      setMessages([...messages, data]);
      setNewMessage("");
    } catch (error) { alert("Message failed to send"); }
  };

  // 👇 SPECIAL FEATURE: Send Offer
  const sendOffer = () => {
    const amount = prompt("Enter Sponsorship Amount (₹):");
    if(amount) {
        setNewMessage(`OFFER:${amount}`); // Special Keyword
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter Search
  const filteredChats = conversations.filter(c => 
    c.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '90vh', backgroundColor: '#f1f5f9', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* 👈 SIDEBAR (Chat List) */}
      <div style={{ width: '350px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '15px' }}>💬 Messages</h2>
            <input 
                type="text" 
                placeholder="🔍 Search users..." 
                value={searchTerm}
                onChange={(e)=>setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}
            />
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredChats.map((c, i) => (
                <motion.div 
                    key={i}
                    whileHover={{ backgroundColor: '#f8fafc' }}
                    onClick={() => setCurrentChat(c.user)}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', cursor: 'pointer', 
                        backgroundColor: currentChat?._id === c.user._id ? '#eff6ff' : 'transparent',
                        borderLeft: currentChat?._id === c.user._id ? '4px solid #2563eb' : '4px solid transparent'
                    }}
                >
                    <div style={{ position:'relative' }}>
                        <img src={c.user.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="User" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit:'cover' }} />
                        <div style={{ position:'absolute', bottom:0, right:0, width:'12px', height:'12px', background:'#16a34a', borderRadius:'50%', border:'2px solid white' }}></div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '0.95rem' }}>{c.user.name}</h4>
                        <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                            {c.lastMessage}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>

      {/* 👉 MAIN CHAT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        
        {currentChat ? (
            <>
                {/* Chat Header */}
                <div style={{ padding: '15px 30px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src={currentChat.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{currentChat.name}</h3>
                            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 'bold' }}>Active Now</span>
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={sendOffer} style={{ padding: '8px 15px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                           💸 Send Offer
                        </button>
                        <button style={{ padding: '8px 15px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
                           👤 Profile
                        </button>
                    </div>
                </div>

                {/* Messages Feed */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {messages.map((m, i) => {
                        const isMe = m.sender._id === user._id;
                        const isOffer = m.content.startsWith("OFFER:");
                        const offerAmount = isOffer ? m.content.split(":")[1] : 0;

                        return (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}
                            >
                                {/* 👇 SMART DEAL CARD LOGIC */}
                                {isOffer ? (
                                    <div style={{ background: isMe ? '#eff6ff' : 'white', border: isMe ? '1px solid #bfdbfe' : '1px solid #e2e8f0', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', minWidth:'250px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                                            {isMe ? 'You sent an offer' : 'Offer Received'}
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2563eb' }}>
                                            ₹{offerAmount}
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '10px', paddingTop: '10px' }}>
                                            {!isMe && (
                                                <button style={{ width: '100%', padding: '8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                    Accept Deal 🤝
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    // Normal Text Message
                                    <div style={{ 
                                        padding: '12px 18px', 
                                        borderRadius: '15px', 
                                        borderBottomRightRadius: isMe ? '2px' : '15px',
                                        borderBottomLeftRadius: isMe ? '15px' : '2px',
                                        background: isMe ? '#2563eb' : 'white', 
                                        color: isMe ? 'white' : '#334155',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5'
                                    }}>
                                        {m.content}
                                    </div>
                                )}
                                
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '5px', textAlign: isMe ? 'right' : 'left' }}>
                                    {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {m.read ? 'Read' : 'Sent'}
                                </div>
                            </motion.div>
                        );
                    })}
                    <div ref={scrollRef}></div>
                </div>

                {/* Input Area */}
                <form onSubmit={sendMessage} style={{ padding: '20px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button type="button" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>📎</button>
                    <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem', background: '#f8fafc' }}
                    />
                    <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' }}>
                        ➤
                    </button>
                </form>
            </>
        ) : (
            // No Chat Selected State
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px' }}>👋</div>
                <h2 style={{ color: '#334155' }}>Welcome to Campus Chat</h2>
                <p>Select a conversation to start negotiating.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default Chat;