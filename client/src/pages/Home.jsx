import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [checking, setChecking] = useState(false);

  // Status Check Function
  const refreshUserStatus = async () => {
    if (!user?.token) return;
    setChecking(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/users/me', config);
      
      if (data.isVerified) {
        const updatedUser = { ...user, isVerified: true, role: data.role };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert("🎉 Congrats! You are now Verified.");
      } else {
        alert("⏳ Status: Still Pending.\nAdmin has not approved your request yet.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setChecking(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get('/api/events');
      setEvents(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchEvents();
    if(user && !user.isVerified) refreshUserStatus();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '20px', marginBottom: '40px' }}>
        <h1 style={{ color: '#1e293b', fontSize: '2.5rem', marginBottom: '10px' }}>🚀 CampusSponsor</h1>
        <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '30px' }}>Connect Student Events with Top Sponsors</p>

        {/* Dynamic Buttons */}
        {user ? (
          user.isVerified ? (
            // ✅ AGAR VERIFIED HAI: Create Event Button
            <Link to="/create-event" style={{ textDecoration: 'none' }}>
              <button style={{ background: '#2563eb', color: 'white', padding: '15px 30px', fontSize: '1.1rem', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                + Create New Event
              </button>
            </Link>
          ) : (
            // ⚠️ AGAR PENDING HAI: KYC Section
            <div style={{ background: '#fff7ed', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: '25px', borderRadius: '15px', border: '2px dashed #f97316' }}>
              <span style={{ color: '#c2410c', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '5px' }}>⚠️ KYC Verification Pending</span>
              <p style={{ margin: '0 0 15px', fontSize: '0.9rem', color: '#9a3412' }}>Complete these steps to activate your account:</p>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                
                {/* 👇 Button 1: Upload Document (KYC Page) */}
                <Link to="/verify">
                  <button style={{ background: '#ea580c', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    📂 Upload ID Proof
                  </button>
                </Link>

                {/* 👇 Button 2: Check Status (Agar upload kar diya hai) */}
                <button 
                  onClick={refreshUserStatus} 
                  disabled={checking}
                  style={{ background: 'white', border: '2px solid #ea580c', color: '#ea580c', padding: '10px 20px', borderRadius: '8px', cursor: checking ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  {checking ? 'Checking... 🔄' : 'Check Status ⚡'}
                </button>

              </div>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/login"><button style={{ padding: '12px 25px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Login</button></Link>
            <Link to="/register"><button style={{ padding: '12px 25px', borderRadius: '8px', border: '1px solid #2563eb', background: 'white', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>Register</button></Link>
          </div>
        )}
      </div>

      {/* Events Feed */}
      <h2 style={{ color: '#334155' }}>🔥 Trending Events</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {events.length === 0 ? <p style={{color: '#64748b'}}>No events yet. Be the first to create one!</p> : events.map(e => (
          <div key={e._id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '15px', background: 'white' }}>
            <h3>{e.title}</h3>
            <p>📍 {e.location} | 💰 ₹{e.budget}</p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>By: {e.createdBy?.name || 'Unknown'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;