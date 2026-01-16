import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Chat = () => {
  const [myChats, setMyChats] = useState([]); // Recent Chats history
  const [searchResults, setSearchResults] = useState([]); // Global Search Results
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState(""); // Search text
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef();
  const user = JSON.parse(localStorage.getItem('user'));

  const ENDPOINT = window.location.hostname === 'localhost'
    ? "http://127.0.0.1:5000"
    : "https://campus-sponser-api.onrender.com";

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  // 1. Fetch My Conversations (History)
  const fetchMyChats = async () => {
    try {
      const { data } = await axios.get(`${ENDPOINT}/api/messages/conversations`, config);
      setMyChats(data);
    } catch (error) { console.error("Error fetching chats"); }
  };

  // 2. Search Users (Global Search)
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
        setSearchResults([]); // Agar search khali hai to results hatao
        return;
    }
    try {
        setLoading(true);
        const { data } = await axios.get(`${ENDPOINT}/api/users?search=${query}`, config);
        setSearchResults(data);
        setLoading(false);
    } catch (error) {
        console.error("Search failed");
        setLoading(false);
    }
  };

  // 3. Start Chat (Click on User)
  const accessChat = (selectedUser) => {
      setCurrentChat(selectedUser);
      setSearch(""); // Search clear karo
      setSearchResults([]); // Results chhupao
      
      // Check agar ye user already chat list mein hai
      const exists = myChats.find(c => c.user._id === selectedUser._id);
      if(!exists) {
          // Temporarily add to list (Refresh hone pe asli wala aayega)
          setMyChats([{ user: selectedUser, lastMessage: "Start a conversation", date: Date.now() }, ...myChats]);
      }
  };

  // 4. Fetch Messages
  const fetchMessages = async () => {
    if (!currentChat) return;
    try {
      const { data } = await axios.get(`${ENDPOINT}/api/messages/${currentChat._id}`, config);
      setMessages(data);
    } catch (error) { console.error("Error fetching msg"); }
  };

  useEffect(() => { fetchMyChats(); }, []);
  
  // Auto-Refresh Messages (Polling)
  useEffect(() => {
    const interval = setInterval(() => {
        if(currentChat) fetchMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentChat]);

  // Send Message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const { data } = await axios.post(`${ENDPOINT}/api/messages`, {
        content: newMessage,
        receiverId: currentChat._id
      }, config);
      
      setMessages([...messages, data]);
      setNewMessage("");
      fetchMyChats(); // Update sidebar list
    } catch (error) { alert("Failed to send"); }
  };

  // Auto Scroll
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div style={{ display: 'flex', height: '90vh', backgroundColor: '#f1f5f9', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* 👈 SIDEBAR */}
      <div style={{ width: '350px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '15px' }}>💬 Messages</h2>
            <input 
                type="text" 
                placeholder="🔍 Search users to chat..." 
                value={search}
                onChange={(e)=>handleSearch(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}
            />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* SHOW SEARCH RESULTS IF SEARCHING */}
            {search ? (
                loading ? <div style={{padding:'20px', textAlign:'center'}}>Searching...</div> : 
                searchResults.map(u => (
                    <div key={u._id} onClick={()=>accessChat(u)} style={{ padding:'15px', cursor:'pointer', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'10px', background:'#fffbeb' }}>
                        <img src={u.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{width:'40px', height:'40px', borderRadius:'50%'}} alt={u.name}/>
                        <div>
                            <div style={{fontWeight:'bold'}}>{u.name}</div>
                            <div style={{fontSize:'0.8rem', color:'#64748b'}}>Click to chat</div>
                        </div>
                    </div>
                ))
            ) : (
                // SHOW RECENT CHATS IF NOT SEARCHING
                myChats.length > 0 ? myChats.map((c, i) => (
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
                        <img src={c.user.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit:'cover' }} alt={c.user.name} />
                        <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '0.95rem' }}>{c.user.name}</h4>
                            <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                                {c.lastMessage}
                            </p>
                        </div>
                    </motion.div>
                )) : (
                    <div style={{padding:'20px', textAlign:'center', color:'#94a3b8'}}>
                        No chats yet.<br/>Search above to start! 👆
                    </div>
                )
            )}
        </div>
      </div>

      {/* 👉 MAIN CHAT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        {currentChat ? (
            <>
                <div style={{ padding: '15px 30px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img src={currentChat.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{ width: '40px', height: '40px', borderRadius: '50%' }} alt={currentChat.name} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{currentChat.name}</h3>
                </div>

                <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {messages.map((m, i) => (
                        <div key={i} style={{ 
                            alignSelf: m.sender._id === user._id ? 'flex-end' : 'flex-start', 
                            maxWidth: '70%', 
                            padding: '12px 18px', 
                            borderRadius: '15px', 
                            background: m.sender._id === user._id ? '#2563eb' : 'white', 
                            color: m.sender._id === user._id ? 'white' : '#334155',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}>
                            {m.content}
                        </div>
                    ))}
                    <div ref={scrollRef}></div>
                </div>

                <form onSubmit={sendMessage} style={{ padding: '20px', background: 'white', display: 'flex', gap: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc' }}
                    />
                    <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer' }}>➤</button>
                </form>
            </>
        ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <h2>👋 Welcome, {user.name}</h2>
                <p>Search for a sponsor or student on the left to start chatting.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Chat;