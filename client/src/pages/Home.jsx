import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user'))); // Local state
  const navigate = useNavigate();

  // 👇 YE NAYA CODE HAI: Background mein status check karega
  const refreshUserStatus = async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/users/me', config);
      
      // Agar status badal gaya hai (Verified ho gaya), toh LocalStorage update karo
      if (data.isVerified !== user.isVerified) {
        const updatedUser = { ...user, isVerified: data.isVerified, role: data.role };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser); // State bhi update karo taaki button turant dikhe
        console.log("User Status Auto-Updated: ", data.isVerified);
      }
    } catch (error) {
      console.error("Status Check Failed:", error);
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
    refreshUserStatus(); // 👈 Page load hote hi status check karo
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '20px', marginBottom: '40px' }}>
        <h1 style={{ color: '#1e293b', fontSize: '2.5rem', marginBottom: '10px' }}>🚀 CampusSponsor</h1>
        <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '30px' }}>Connect Student Events with Top Sponsors</p>

        {/* 👇 DYNAMIC BUTTON LOGIC */}
        {user ? (
          user.isVerified ? (
            <Link to="/create-event" style={{ textDecoration: 'none' }}>
              <button style={{ background: '#2563eb', color: 'white', padding: '15px 30px', fontSize: '1.1rem', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)' }}>
                + Create New Event
              </button>
            </Link>
          ) : (
            <div style={{ background: '#fff7ed', display: 'inline-block', padding: '15px 25px', borderRadius: '10px', border: '1px solid #ffedd5' }}>
              <span style={{ color: '#c2410c', fontWeight: 'bold' }}>⏳ Verification Pending</span>
              <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#9a3412' }}>You can create events once Admin approves your ID.</p>
              <button onClick={refreshUserStatus} style={{ marginTop: '10px', background: 'transparent', border: '1px solid #c2410c', color: '#c2410c', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}>Check Status Again 🔄</button>
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
        {events.map(e => (
          <div key={e._id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '15px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px' }}>{e.title}</h3>
            <p style={{ color: '#64748b' }}>📍 {e.location} | 💰 ₹{e.budget}</p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '10px' }}>By: {e.createdBy?.name || 'Unknown'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;