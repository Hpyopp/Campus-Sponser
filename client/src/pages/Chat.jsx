import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Chat = () => {
  const [myChats, setMyChats] = useState([]); 
  const [searchResults, setSearchResults] = useState([]); 
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState(""); 
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef();
  const user = JSON.parse(localStorage.getItem('user'));

  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  // 1. Fetch Sidebar Chats
  const fetchMyChats = async () => {
    try {
      const { data } = await axios.get(`${ENDPOINT}/api/messages/conversations`, config);
      setMyChats(data);
    } catch (error) { console.error("Error fetching chats"); }
  };

  // 2. Search Logic
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) { setSearchResults([]); return; }
    try {
        setLoading(true);
        const { data } = await axios.get(`${ENDPOINT}/api/users?search=${query}`, config);
        setSearchResults(data);
        setLoading(false);
    } catch (error) { setLoading(false); }
  };

  // 3. Mark Read Function
  const markAsRead = async (senderId) => {
      try {
          await axios.put(`${ENDPOINT}/api/messages/read`, { senderId }, config);
      } catch(e) { console.error("Read mark failed"); }
  };

  // 4. Open Chat
  const accessChat = (selectedUser) => {
      setCurrentChat(selectedUser);
      setSearch(""); 
      setSearchResults([]); 
      
      const exists = myChats.find(c => c.user._id === selectedUser._id);
      if(!exists) {
          setMyChats([{ user: selectedUser, lastMessage: "Start a conversation", date: Date.now() }, ...myChats]);
      }
      markAsRead(selectedUser._id); 
  };

  // 5. Fetch Messages (Polling)
  const fetchMessages = async () => {
    if (!currentChat) return;
    try {
      const { data } = await axios.get(`${ENDPOINT}/api/messages/${currentChat._id}`, config);
      setMessages(data);
      
      // Agar naya message aaya hai jo mera nahi hai, toh use read mark karo
      const lastMsg = data[data.length - 1];
      if (lastMsg && lastMsg.sender._id !== user._id && !lastMsg.read) {
          markAsRead(currentChat._id);
      }
    } catch (error) { console.error("Error fetching msg"); }
  };

  useEffect(() => { fetchMyChats(); }, []);
  
  // Fast Polling (Every 2 seconds)
  useEffect(() => {
    const interval = setInterval(() => { if(currentChat) fetchMessages(); }, 2000);
    return () => clearInterval(interval);
  }, [currentChat]);

  // 🚀 FAST SEND FUNCTION
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgContent = newMessage;
    setNewMessage(""); // Input clear instantly

    // 1. Optimistic UI Update (Turant dikhao)
    const tempMsg = {
        _id: Date.now(), // Fake ID
        sender: { _id: user._id },
        content: msgContent,
        read: false,
        createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg]);

    // 2. Server Request
    try {
      await axios.post(`${ENDPOINT}/api/messages`, {
        content: msgContent, receiverId: currentChat._id
      }, config);
      
      fetchMessages(); // Asli data refresh karo
      fetchMyChats();  // Sidebar refresh karo
    } catch (error) { alert("Failed to send"); }
  };

  // Auto Scroll to Bottom
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', width: '100%', backgroundColor: '#f8fafc', fontFamily: "'Poppins', sans-serif", position: 'fixed', top: '70px', left: 0, zIndex: 100, overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '350px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '15px' }}>💬 Messages</h2>
            <input type="text" placeholder="🔍 Search users..." value={search} onChange={(e)=>handleSearch(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
            {search ? (
                loading ? <div style={{padding:'20px', textAlign:'center'}}>Searching...</div> : 
                searchResults.map(u => (
                    <div key={u._id} onClick={()=>accessChat(u)} style={{ padding:'15px', cursor:'pointer', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:'10px', background:'#fffbeb' }}>
                        <img src={u.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover'}} alt="user"/>
                        <div><div style={{fontWeight:'bold'}}>{u.name}</div><div style={{fontSize:'0.8rem', color:'#64748b'}}>Click to chat</div></div>
                    </div>
                ))
            ) : (
                myChats.length > 0 ? myChats.map((c, i) => (
                    <div key={i} onClick={() => accessChat(c.user)} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', cursor: 'pointer', backgroundColor: currentChat?._id === c.user._id ? '#eff6ff' : 'white', borderLeft: currentChat?._id === c.user._id ? '4px solid #2563eb' : '4px solid transparent', borderBottom: '1px solid #f8fafc' }}>
                        <img src={c.user.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit:'cover' }} alt="user" />
                        <div style={{ flex: 1 }}><h4 style={{ margin: 0, color: '#1e293b', fontSize: '0.95rem' }}>{c.user.name}</h4><p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{c.lastMessage}</p></div>
                    </div>
                )) : <div style={{padding:'20px', textAlign:'center', color:'#94a3b8'}}>No chats yet.</div>
            )}
        </div>
      </div>

      {/* MAIN CHAT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc', height: '100%' }}>
        {currentChat ? (
            <>
                <div style={{ padding: '15px 30px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 }}>
                    <img src={currentChat.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit:'cover' }} alt="user" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{currentChat.name}</h3>
                </div>
                
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {messages.map((m, i) => {
                        if (!m.content || m.content.trim() === "") return null;
                        const isMe = m.sender._id === user._id;
                        
                        return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                <div style={{ 
                                    maxWidth: '70%', 
                                    padding: '12px 18px', 
                                    borderRadius: '15px', 
                                    borderBottomRightRadius: isMe ? '2px' : '15px', 
                                    borderBottomLeftRadius: isMe ? '15px' : '2px', 
                                    background: isMe ? '#2563eb' : 'white', 
                                    color: isMe ? 'white' : '#334155', 
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)', 
                                    wordBreak: 'break-word', 
                                    fontSize: '0.95rem' 
                                }}>
                                    {m.content}
                                </div>
                                {/* 👇 STATUS INDICATOR (Sent/Read) */}
                                {isMe && (
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px', marginRight: '5px' }}>
                                        {m.read ? "✅ Read" : "✓ Sent"}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    <div ref={scrollRef}></div>
                </div>

                <form onSubmit={sendMessage} style={{ padding: '20px', background: 'white', display: 'flex', gap: '15px', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
                    <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid #e2e8f0', outline: 'none', background: '#f8fafc', fontSize: '1rem' }} />
                    <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>➤</button>
                </form>
            </>
        ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <div style={{fontSize:'4rem', marginBottom:'20px'}}>💬</div>
                <h2 style={{color:'#334155'}}>Welcome to Campus Chat</h2>
                <p>Start a conversation with Sponsors or Students.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Chat;