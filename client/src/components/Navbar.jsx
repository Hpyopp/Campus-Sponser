import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../assets/logo.svg'; 

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [msgCount, setMsgCount] = useState(0); 
  const user = JSON.parse(localStorage.getItem('user'));
  
  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  // 👇 LOGIC CHANGED: Sirf tab check karo jab Chat page par NA ho
  useEffect(() => {
      if(!user) return;

      const fetchUnread = async () => {
          try {
              const { data } = await axios.get(`${ENDPOINT}/api/messages/unread`, {
                  headers: { Authorization: `Bearer ${user.token}` }
              });
              setMsgCount(data.count);
          } catch(e) { console.error(e); }
      };

      // Agar hum Chat page par nahi hain, tabhi count update karo
      if (location.pathname !== '/chat') {
          fetchUnread(); // Turant check karo
          const interval = setInterval(fetchUnread, 5000); // Har 5 sec mein check karo
          return () => clearInterval(interval);
      } else {
          // Agar Chat page par hain, toh count 0 kar do
          setMsgCount(0);
      }
  }, [user, location.pathname]); 

  return (
    <nav style={{ background: '#ffffff', padding: '10px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position:'sticky', top:0, zIndex:1000 }}>
      
      <Link to="/" style={{ textDecoration: 'none' }}>
        <img src={logo} alt="Logo" style={{ height: '50px' }} />
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontFamily:'Poppins', fontWeight:'500' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link>
        
        {user ? (
          <>
            {user.role === 'student' && <Link to="/create-event" style={{ textDecoration: 'none', color: '#64748b' }}>Create Event</Link>}
            {user.role === 'admin' && <Link to="/admin" style={{ textDecoration: 'none', color: '#dc2626' }}>Admin</Link>}
            
            <Link to="/analytics" style={{ textDecoration: 'none', color: '#64748b' }}>Dashboard</Link>

            {/* 👇 MESSAGES WITH BADGE */}
            <Link to="/chat" style={{ textDecoration: 'none', color: '#64748b', display:'flex', alignItems:'center', gap:'5px', position:'relative' }}>
                <span style={{fontSize:'1.2rem'}}>💬</span> Messages
                {/* Agar count > 0 hai aur hum chat page pe nahi hain, tabhi badge dikhao */}
                {msgCount > 0 && location.pathname !== '/chat' && (
                    <span style={{ position: 'absolute', top: '-8px', right: '-10px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold', border: '2px solid white' }}>
                        {msgCount > 9 ? '9+' : msgCount}
                    </span>
                )}
            </Link>

            <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background:'#f1f5f9', padding:'5px 12px 5px 5px', borderRadius:'30px', border:'1px solid #e2e8f0' }}>
                <div style={{width:'32px', height:'32px', background:'#3b82f6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'bold'}}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{color:'#334155', fontSize:'0.9rem'}}>{user.name.split(' ')[0]}</span>
            </div>
          </>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 'bold' }}>Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;