import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

// Backend URL (Change to localhost if testing locally)
const ENDPOINT = "https://campus-sponser-api.onrender.com"; 

const Chat = () => {
  const [searchParams] = useSearchParams();
  const startChatId = searchParams.get('userId'); // Profile se aane wala ID
  const user = JSON.parse(localStorage.getItem('user'));

  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null); // Selected User
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef();

  // 1. Initialize Socket
  useEffect(() => {
    const s = io(ENDPOINT);
    setSocket(s);
    if (user) s.emit("join_room", user._id);
    
    return () => s.disconnect();
  }, []);

  // 2. Listen for Incoming Messages
  useEffect(() => {
    if (!socket) return;
    socket.on("receive_message", (data) => {
      if (currentChat && (data.sender === currentChat._id || data.sender === user._id)) {
        setMessages((prev) => [...prev, data]);
      } else {
        toast("New Message Received 📩");
        fetchConversations(); // Refresh sidebar list
      }
    });
  }, [socket, currentChat]);

  // 3. Fetch Sidebar Users
  const fetchConversations = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${ENDPOINT}/api/chat/conversations/all`, config);
      setConversations(data);

      // Agar Profile se "Connect" dabaya hai, toh us bande ko list mein add karo
      if (startChatId) {
        const exists = data.find(u => u._id === startChatId);
        if (!exists) {
            // Fetch User Details to add to sidebar temporarily
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

  // 4. Fetch Chat History when clicking a user
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

  // 5. Auto Scroll to Bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 6. Send Message Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
      sender: user._id,
      receiver: currentChat._id,
      message: newMessage,
      createdAt: new Date().toISOString()
    };

    // Emit to Socket
    socket.emit("send_message", msgData);

    // Update UI instantly
    setMessages((prev) => [...prev, msgData]);
    setNewMessage("");
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: '#f1f5f9', fontFamily: 'Poppins' }}>
      
      {/* 🟢 SIDEBAR (Users List) */}
      <div style={{ width: '300px', background: 'white', borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Messages 💬</h2>
        </div>
        {conversations.map((c) => (
          <div 
            key={c._id} 
            onClick={() => setCurrentChat(c)}
            style={{ 
                padding: '15px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                background: currentChat?._id === c._id ? '#eff6ff' : 'white',
                borderBottom: '1px solid #f8fafc'
            }}
          >
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

      {/* 🔵 CHAT BOX (Right Side) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentChat ? (
            <>
                {/* Chat Header */}
                <div style={{ padding: '15px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '35px', height: '35px', background: '#3b82f6', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {currentChat.name?.charAt(0)}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{currentChat.name}</h3>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {messages.map((m, index) => (
                        <div key={index} ref={scrollRef} style={{ alignSelf: m.sender === user._id ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                            <div style={{ 
                                padding: '10px 15px', 
                                borderRadius: '15px', 
                                background: m.sender === user._id ? '#2563eb' : 'white', 
                                color: m.sender === user._id ? 'white' : '#1e293b',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                borderTopRightRadius: m.sender === user._id ? '0' : '15px',
                                borderTopLeftRadius: m.sender === user._id ? '15px' : '0'
                            }}>
                                {m.message}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '5px', display: 'block', textAlign: m.sender === user._id ? 'right' : 'left' }}>
                                {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} style={{ padding: '20px', background: 'white', display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                    <button type="submit" style={{ padding: '12px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Send 🚀
                    </button>
                </form>
            </>
        ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '1.2rem' }}>
                Select a user to start chatting 👋
            </div>
        )}
      </div>
    </div>
  );
};

export default Chat;