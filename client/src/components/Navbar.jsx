import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'; // 👈 Hooks import kiye
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0); // 👈 Red Dot ke liye State
  const user = JSON.parse(localStorage.getItem('user'));

  // 👇 Notification Polling Logic (Har 10 sec mein check karega)
  useEffect(() => {
    if (!user) return;
    
    const checkNotifications = async () => {
        try {
            const { data } = await axios.get('https://campus-sponser-api.onrender.com/api/notifications', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            // Count unread notifications
            const count = data.filter(n => !n.isRead).length;
            setUnreadCount(count);
        } catch (e) { 
            console.error("Notification Check Failed", e); 
        }
    };

    checkNotifications(); // Pehli baar check karo
    const interval = setInterval(checkNotifications, 10000); // Phir har 10s baad
    return () => clearInterval(interval); // Cleanup
  }, []);

  return (
    <nav style={{ 
        background: '#ffffff', 
        padding: '15px 20px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        position:'sticky', 
        top:0, 
        zIndex:1000, 
        flexWrap: 'wrap', 
        gap: '15px' 
    }}>
      
      {/* LOGO */}
      <Link to="/" style={{ textDecoration: 'none', display:'flex', alignItems:'center', gap:'10px' }}>
        <span style={{fontSize:'1.8rem'}}>🚀</span>
        <h2 style={{ margin: 0, color: '#1e293b', fontFamily: 'Poppins', fontWeight:'800', fontSize:'1.5rem' }}>CampusSponsor</h2>
      </Link>

      {/* LINKS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontFamily:'Poppins', fontWeight:'500', flexWrap:'wrap' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link>
        
        {user ? (
          <>
            {user.role === 'student' && (
                <Link to="/create-event" style={{ textDecoration: 'none', color: '#64748b' }}>Create Event</Link>
            )}
            
            {user.role === 'admin' && (
                <Link to="/admin" style={{ textDecoration: 'none', color: '#dc2626', fontWeight:'bold' }}>Admin Panel</Link>
            )}

            {/* MESSAGE LINK */}
            <Link to="/chat" style={{ textDecoration: 'none', color: '#64748b', display:'flex', alignItems:'center', gap:'5px' }}>
                <span style={{fontSize:'1.2rem'}}>💬</span> Messages
            </Link>

            {/* 👇🔔 NEW NOTIFICATION BELL ADDED HERE */}
            <div 
                onClick={() => { setUnreadCount(0); navigate('/notifications'); }} 
                style={{ position: 'relative', cursor: 'pointer', fontSize: '1.4rem', display:'flex', alignItems:'center' }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-5px', right: '-5px',
                        background: '#ef4444', color: 'white', fontSize: '0.7rem',
                        width: '18px', height: '18px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                        border: '2px solid white'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </div>
            {/* 👆🔔 END BELL */}

            {/* PROFILE LINK */}
            <div 
                onClick={() => navigate('/profile')} 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background:'#f1f5f9', padding:'5px 12px 5px 5px', borderRadius:'30px', transition:'0.3s', border:'1px solid #e2e8f0' }}
            >
                <div style={{width:'32px', height:'32px', background:'#3b82f6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.9rem', fontWeight:'bold'}}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{color:'#334155', fontSize:'0.9rem', fontWeight:'600'}}>
                    {user.name.split(' ')[0]}
                </span>
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