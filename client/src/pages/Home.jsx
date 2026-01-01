import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(storedUser);
      fetchEvents();
    }
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events');
      setEvents(res.data);
    } catch (error) {
      console.log("Error fetching events:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 👇 YAHAN HAI MAIN FIX (AUTO-SYNC LOGIC)
  const checkStatus = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // 1. Fresh Data Mangwao
      const res = await axios.get('/api/users/me', config);
      
      // 2. Token ko Fresh Data ke saath Jod do
      const updatedUser = { ...user, ...res.data }; 
      
      // 3. Chupchap LocalStorage Update karo
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // 4. Result Dikhao
      if (res.data.isVerified) {
        alert("🎉 You are VERIFIED! You can now create events.");
      } else if (res.data.verificationDoc) {
        alert("⏳ Status: PENDING Admin Approval.");
      } else {
        alert("⚠️ Not Verified. Please Upload ID.");
        navigate('/verify');
      }
    } catch (error) {
      console.error(error);
      alert("Error syncing status.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ fontFamily: 'Poppins', padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#1e293b' }}>🚀 CampusSponsor</h2>
        <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
            <span style={{fontWeight:'bold', color:'#64748b'}}>Hi, {user.name} 👋</span>
            <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold' }}>Logout</button>
        </div>
      </div>

      {/* STATUS CARD */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center', marginBottom:'40px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{user.isVerified ? '✅' : '⏳'}</div>
        <h2 style={{ color: '#0f172a', margin:'0 0 10px 0' }}>Welcome, {user.name}!</h2>
        
        <div style={{ 
            display: 'inline-block', padding: '8px 20px', borderRadius: '20px', 
            background: user.isVerified ? '#dcfce7' : '#fff7ed', 
            color: user.isVerified ? '#166534' : '#c2410c',
            fontWeight: 'bold', border: user.isVerified ? '1px solid #22c55e' : '1px solid #f97316'
        }}>
          {user.isVerified ? 'Verified Account' : 'Verification Pending'}
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap:'wrap' }}>
          
          {/* CHECK STATUS BUTTON */}
          <button onClick={checkStatus} disabled={loading} style={{ padding: '12px 25px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display:'flex', alignItems:'center', gap:'8px' }}>
            {loading ? 'Checking...' : '🔄 Check Status'}
          </button>

          {!user.isVerified && (
            <button onClick={() => navigate('/verify')} style={{ padding: '12px 25px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              📂 Upload ID Proof
            </button>
          )}

          {user.role === 'student' && user.isVerified && (
            <button onClick={() => navigate('/create-event')} style={{ padding: '12px 25px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold' }}>
              ➕ Create Event
            </button>
          )}
        </div>
      </div>

      {/* EVENTS LIST */}
      <h3 style={{ color: '#1e293b', borderBottom:'2px solid #e2e8f0', paddingBottom:'10px' }}>📅 Upcoming Campus Events</h3>
      
      {events.length === 0 ? (
        <div style={{textAlign:'center', padding:'40px', color:'#94a3b8'}}>
            <h3>No events found 📭</h3>
            <p>Be the first one to create an event!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {events.map((event) => (
            <div 
                key={event._id} 
                onClick={() => navigate(`/event/${event._id}`)}
                style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', cursor:'pointer', transition:'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <h3 style={{ margin: '0 0 10px 0', color:'#2563eb' }}>{event.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom:'15px', height:'40px', overflow:'hidden' }}>{event.description}</p>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.85rem', color:'#475569', background:'#f8fafc', padding:'10px', borderRadius:'8px'}}>
                    <span>📍 {event.location}</span>
                    <span>💰 ₹{event.budget}</span>
                </div>
                <div style={{marginTop:'15px', textAlign:'right', fontSize:'0.8rem', color:'#94a3b8'}}>
                    {new Date(event.date).toDateString()}
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;