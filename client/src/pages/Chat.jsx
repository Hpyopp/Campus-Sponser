import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const startChatId = searchParams.get('userId');
  const user = JSON.parse(localStorage.getItem('user'));

  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef();

  // 1. Socket Init
  useEffect(() => {
    const s = io(ENDPOINT);
    setSocket(s);
    if (user) s.emit("join_room", user._id);
    return () => s.disconnect();
  }, []);

  // 2. Listeners
  useEffect(() => {
    if (!socket) return;
    
    // Message Receive
    socket.on("receive_message", (data) => {
      if (currentChat && (data.sender === currentChat._id || data.sender === user._id)) {
        setMessages((prev) => [...prev, data]);
        // Agar chat khuli hai to turant seen karo
        if (data.sender === currentChat._id) {
            socket.emit("mark_as_seen", { senderId: data.sender, receiverId: user._id });
        }
      } else {
        toast("New Message 📩");
        fetchConversations();
      }
    });

    // 👇 SEEN UPDATE LISTENER
    socket.on("msg_seen_update", ({ receiverId }) => {
        if (currentChat && currentChat._id === receiverId) {
            setMessages(prev => prev.map(msg => 
                msg.sender === user._id ? { ...msg, isRead: true } : msg
            ));
        }
    });

  }, [socket, currentChat]);

  // 3. Chat Open hone par Mark Seen
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
        } else { setCurrentChat(exists); }
      }
    } catch (error) {}
  };
  useEffect(() => { fetchConversations(); }, [startChatId]);

  // 5. Messages Load
  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${ENDPOINT}/api/chat/${currentChat._id}`, config);
        setMessages(data);
      } catch (err) {}
    };
    getMessages();
  }, [currentChat]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // 6. Send
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
      <div style={{ width: '320px', background: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700' }}>Chats</h2>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.map((c) => (
            <div key={c._id} onClick={() => setCurrentChat(c)}
                style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', background: currentChat?._id === c._id ? '#eff6ff' : 'transparent', transition: '0.2s' }}>
                <div style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {c.name?.charAt(0)}
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{c.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{c.role}</p>
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        {currentChat ? (
            <>
                <div style={{ padding: '15px 25px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize:'1.1rem' }}>{currentChat.name?.charAt(0)}</div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>{currentChat.name}</h3>
                </div>

                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {messages.map((m, index) => {
                        const isMe = m.sender === user._id;
                        return (
                            <div key={index} ref={scrollRef} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                <div style={{ 
                                    padding: '12px 18px', 
                                    borderRadius: '20px', 
                                    background: isMe ? '#2563eb' : 'white', 
                                    color: isMe ? 'white' : '#1e293b', 
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    borderBottomRightRadius: isMe ? '4px' : '20px',
                                    borderBottomLeftRadius: isMe ? '20px' : '4px',
                                    fontSize: '0.95rem'
                                }}>
                                    {m.message}
                                </div>
                                {/* 👇 INSTAGRAM STYLE SEEN STATUS */}
                                {isMe && (
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', marginRight: '5px' }}>
                                        {m.isRead ? "Seen" : "Sent"}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '20px', background: 'white', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" placeholder="Message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ flex: 1, padding: '14px 20px', borderRadius: '30px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '1rem' }} />
                    <button type="submit" style={{ padding: '12px 25px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>Send</button>
                </form>
            </>
        ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '1.2rem' }}>
                Start a conversation ✨
            </div>
        )}
      </div>
    </div>
  );
};

export default Chat;