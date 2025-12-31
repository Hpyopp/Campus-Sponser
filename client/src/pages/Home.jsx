import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (storedUser) {
      setUser(storedUser);
      // 👇 IMPORTANT: Page load hote hi taaza status check karo
      fetchLatestStatus(storedUser);
    }

    // Events fetch karo
    fetchEvents();
  }, []);

  // 🔄 1. LIVE STATUS CHECK FUNCTION
  const fetchLatestStatus = async (currentUser) => {
    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      // Backend se poocho: "Kya main verify ho gaya?"
      const res = await axios.get('/api/users/me', config);
      
      // Agar backend bole "Haan Verified ho", aur local bole "Nahi", toh update karo
      if (res.data.isVerified !== currentUser.isVerified) {
        const updatedUser = { ...currentUser, isVerified: res.data.isVerified };
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Browser update
        setUser(updatedUser); // State update
        
        if(res.data.isVerified) {
            alert("🎉 Good News! Your account is now Verified.");
        }
      }
    } catch (err) {
      console.error("Status Check Failed:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/events');
      setEvents(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load events. Backend might be sleeping 😴");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 2. MANUAL CHECK BUTTON HANDLER
  const handleCheckStatus = () => {
    if(user) fetchLatestStatus(user);
    alert("Checking with Admin... 📡");
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins' }}>
      
      {/* HEADER SECTION */}
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <h1 style={{ fontSize: '3rem', color: '#1e293b', marginBottom: '10px' }}>🚀 CampusSponsor</h1>
        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Connect Student Events with Top Sponsors</p>

        {/* KYC ALERT BOX */}
        {user && !user.isVerified && (
          <div style={{ margin: '30px auto', maxWidth: '600px', padding: '20px', background: '#fff7ed', border: '2px dashed #f97316', borderRadius: '15px' }}>
            <h3 style={{ color: '#c2410c', margin: '0 0 10px 0' }}>⚠️ KYC Verification Pending</h3>
            <p style={{ color: '#9a3412', marginBottom: '15px' }}>
              Upload proof if you haven't. If uploaded, wait for Admin approval.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Link to="/verify" style={{ padding: '10px 20px', background: '#f97316', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                    📂 Upload ID Proof
                </Link>
                
                {/* 👇 BUTTON AB DISABLED NAHI HAI */}
                <button 
                  onClick={handleCheckStatus}
                  style={{ padding: '10px 20px', background: 'white', border: '2px solid #f97316', color: '#f97316', borderRadius: '8px', fontWeight: 'bold', cursor:'pointer' }}
                >
                    Check Status ⚡
                </button>
            </div>
          </div>
        )}

        {/* CREATE EVENT BUTTON (Sirf Students ke liye) */}
        {user && user.role === 'student' && user.isVerified && (
          <Link to="/create-event" style={{ display: 'inline-block', marginTop: '20px', padding: '15px 30px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)' }}>
            + Create New Event
          </Link>
        )}
      </div>

      {/* EVENTS SECTION */}
      <h2 style={{ color: '#334155', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>🔥 Trending Events</h2>
      
      {loading ? (
        <p style={{textAlign:'center', fontSize:'1.2rem', color:'#64748b'}}>Loading Events... ⏳</p>
      ) : error ? (
        <p style={{textAlign:'center', color:'#ef4444', background:'#fee2e2', padding:'10px', borderRadius:'8px'}}>{error}</p>
      ) : events.length === 0 ? (
        <p style={{textAlign:'center', color:'#64748b', fontSize:'1.1rem'}}>No events found. Be the first to create one! 🎉</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          {events.map((event) => (
            <div key={event._id} style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s', border: '1px solid #f1f5f9' }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize:'1.4rem' }}>{event.title}</h3>
                <span style={{background:'#dbeafe', color:'#1e40af', padding:'5px 10px', borderRadius:'15px', fontSize:'0.75rem', fontWeight:'bold'}}>
                   Budget: ₹{event.budget}
                </span>
              </div>
              
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight:'1.5', marginBottom:'15px' }}>
                {event.description ? event.description.substring(0, 100) + '...' : 'No description'}
              </p>
              
              <div style={{display:'flex', gap:'15px', fontSize:'0.9rem', color:'#475569', borderTop:'1px solid #f1f5f9', paddingTop:'15px'}}>
                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                <span>📍 {event.location}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;