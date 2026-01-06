import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0); 
  const [msgRedDot, setMsgRedDot] = useState(false); 
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Ref to track location inside socket callback
  const locationRef = useRef(location.pathname);

  // Update ref whenever location changes
  useEffect(() => {
    locationRef.current = location.pathname;
    // Agar chat page par aa gaye, to red dot hata do
    if (location.pathname === '/chat') {
        setMsgRedDot(false);
    }
  }, [location.pathname]);

  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  // 1. CHAT RED DOT LOGIC (Fixed)
  useEffect(() => {
    if(!user) return;
    
    const socket = io(ENDPOINT);
    socket.emit("join_room", user._id);

    socket.on("receive_message", (data) => {
        // Check current location using Ref (Taaki socket disconnect na karna pade)
        if (locationRef.current !== '/chat') {
            setMsgRedDot(true);
            // Optional: Chhota sa sound bhi play kar sakte ho
        }
    });

    return () => socket.disconnect();
  }, [user]); // Removed location.pathname dependency

  // 2. Notification System
  useEffect(() => {
    if (!user) return;
    const checkNotifications = async () => {
        try {
            const { data } = await axios.get(`${ENDPOINT}/api/notifications`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const count = data.filter(n => !n.isRead).length;
            setUnreadCount(count);
        } catch (e) {}
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 10000); 
    return () => clearInterval(interval); 
  }, [user]);

  return (
    <nav style={{ background: '#ffffff', padding: '15px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position:'sticky', top:0, zIndex:1000, flexWrap: 'wrap', gap: '15px' }}>
      
      <Link to="/" style={{ textDecoration: 'none', display:'flex', alignItems:'center', gap:'10px' }}>
        <span style={{fontSize:'1.8rem'}}>🚀</span>
        <h2 style={{ margin: 0, color: '#1e293b', fontFamily: 'Poppins', fontWeight:'800', fontSize:'1.5rem' }}>CampusSponsor</h2>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontFamily:'Poppins', fontWeight:'500', flexWrap:'wrap' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link>
        
        {user ? (
          <>
            {user.role === 'student' && <Link to="/create-event" style={{ textDecoration: 'none', color: '#64748b' }}>Create Event</Link>}
            {user.role === 'admin' && <Link to="/admin" style={{ textDecoration: 'none', color: '#dc2626', fontWeight:'bold' }}>Admin Panel</Link>}

            {/* 👇 MESSAGE LINK WITH RED DOT */}
            <Link to="/chat" style={{ textDecoration: 'none', color: '#64748b', display:'flex', alignItems:'center', gap:'5px', position:'relative' }}>
                <span style={{fontSize:'1.2rem'}}>💬</span> Messages
                {msgRedDot && (
                    <span style={{
                        position: 'absolute', top: '-2px', right: '-6px',
                        height: '10px', width: '10px',
                        backgroundColor: '#ef4444', borderRadius: '50%',
                        border: '2px solid white'
                    }}></span>
                )}
            </Link>

            {/* NOTIFICATIONS */}
            <div onClick={() => { setUnreadCount(0); navigate('/notifications'); }} style={{ position: 'relative', cursor: 'pointer', fontSize: '1.4rem', display:'flex', alignItems:'center' }}>
                🔔
                {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '0.7rem', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid white' }}>
                        {unreadCount}
                    </span>
                )}
            </div>

            {/* PROFILE */}
            <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background:'#f1f5f9', padding:'5px 12px 5px 5px', borderRadius:'30px', transition:'0.3s', border:'1px solid #e2e8f0' }}>
                <div style={{width:'32px', height:'32px', background:'#3b82f6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.9rem', fontWeight:'bold'}}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{color:'#334155', fontSize:'0.9rem', fontWeight:'600'}}>{user.name.split(' ')[0]}</span>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 'bold' }}>Login</Link>
            <Link to="/register" style={{ padding: '8px 16px', background: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', boxShadow:'0 4px 14px rgba(37, 99, 235, 0.3)' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;