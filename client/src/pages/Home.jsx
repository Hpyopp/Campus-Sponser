import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) { setUser(storedUser); fetchLatestStatus(storedUser); }
    fetchEvents();
  }, []);

  const fetchLatestStatus = async (currentUser) => {
    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      const res = await axios.get('/api/users/me', config);
      if (res.data.isVerified !== currentUser.isVerified) {
        const updatedUser = { ...currentUser, isVerified: res.data.isVerified };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) { console.error("Status Check Failed"); }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/events');
      setEvents(res.data);
    } catch (err) { console.log("Fetch error"); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins' }}>
      
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <h1 style={{ fontSize: '3rem', color: '#1e293b', marginBottom: '10px' }}>🚀 CampusSponsor</h1>
        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Connect Student Events with Top Sponsors</p>

        {user && !user.isVerified && (
          <div style={{ margin: '30px auto', maxWidth: '600px', padding: '20px', background: '#fff7ed', border: '2px dashed #f97316', borderRadius: '15px' }}>
            <h3 style={{ color: '#c2410c', margin: '0' }}>⚠️ KYC Pending</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop:'15px' }}>
                <Link to="/verify" style={{ padding: '10px 20px', background: '#f97316', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>📂 Upload Proof</Link>
                <button onClick={() => fetchLatestStatus(user)} style={{ padding: '10px 20px', background: 'white', border: '2px solid #f97316', color: '#f97316', borderRadius: '8px', cursor:'pointer' }}>Check Status ⚡</button>
            </div>
          </div>
        )}

        {user && user.role === 'student' && user.isVerified && (
          <Link to="/create-event" style={{ display: 'inline-block', marginTop: '20px', padding: '15px 30px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold' }}>+ Create Event</Link>
        )}
      </div>

      <h2 style={{ color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>🔥 Trending Events</h2>
      
      {loading ? <p style={{textAlign:'center'}}>Loading...</p> : 
       events.length === 0 ? <p style={{textAlign:'center'}}>No events found.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
          {events.map((event) => (
            <div 
                key={event._id} 
                onClick={() => navigate(`/event/${event._id}`)}
                style={{ 
                    cursor: 'pointer',
                    background: 'white', padding: '25px', borderRadius: '15px', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition:'0.2s'
                }}
            >
              <div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'15px'}}>
                    <h3 style={{ margin: '0', color: '#1e293b', fontSize:'1.3rem', wordBreak: 'break-word', maxWidth:'65%' }}>{event.title}</h3>
                    <span style={{background:'#dbeafe', color:'#1e40af', padding:'6px 10px', borderRadius:'12px', fontSize:'0.8rem', fontWeight:'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>💰 ₹{event.budget}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight:'1.5', marginBottom:'20px', minHeight: '60px' }}>
                    {event.description ? event.description.substring(0, 100) + '...' : 'No details.'}
                </p>
                <div style={{display:'flex', gap:'15px', fontSize:'0.85rem', color:'#475569', marginBottom:'20px'}}>
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    <span>📍 {event.location}</span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                {event.isSponsored ? (
                    <div style={{width:'100%', padding:'10px', background:'#dcfce7', color:'#166534', textAlign:'center', borderRadius:'8px', fontWeight:'bold'}}>✅ FUNDED</div>
                ) : (
                    // 👇 Button Text Changed to Neutral "View Details"
                    <div style={{width:'100%', padding:'10px', background:'#f1f5f9', color:'#1e293b', textAlign:'center', borderRadius:'8px', fontWeight:'bold'}}>📄 View Details</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Home;