import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SponsorDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // ✅ Security Check: Sirf Sponsor hi andar aa sakta hai
  useEffect(() => {
    if (!user) navigate('/login');
    if (user?.role !== 'sponsor') {
      alert("Access Denied! Only Sponsors can view this page.");
      navigate('/');
    }
  }, [user, navigate]);

  const fetchEvents = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/events', config);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSponsorClick = (eventTitle) => {
    // Abhi ke liye bas alert, baad mein Payment Gateway lagayenge
    alert(`Thank you for your interest in sponsoring "${eventTitle}"! \n\nConnecting you with the organizer... 📞`);
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, []);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Opportunities... 💰</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Header Section */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '40px', borderRadius: '20px', marginBottom: '40px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>🚀 Sponsor Dashboard</h1>
        <p style={{ opacity: 0.8, marginTop: '10px', fontSize: '1.1rem' }}>
          Discover and fund the best campus events. Verified organizers only.
        </p>
      </div>

      {/* Events Grid */}
      <h2 style={{ color: '#334155', marginBottom: '20px' }}>🌟 Active Opportunities ({events.length})</h2>
      
      {events.length === 0 ? (
        <p style={{ color: '#64748b' }}>No active events found properly.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
          {events.map(e => (
            <div key={e._id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', transition: 'transform 0.2s' }}>
              
              <div style={{ padding: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>{e.title}</h3>
                  <span style={{ background: '#dbeafe', color: '#1e40af', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    ₹{e.budget} Needed
                  </span>
                </div>
                
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}>
                  {e.description || "No description provided by the organizer."}
                </p>

                <div style={{ display: 'flex', gap: '15px', color: '#475569', fontSize: '0.9rem', marginBottom: '20px' }}>
                  <span>📍 {e.location}</span>
                  <span>📅 {e.date || 'Date TBA'}</span>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>Organizer:</span> <br/>
                    <strong>{e.createdBy?.name || 'Unknown'}</strong>
                  </div>
                  
                  <button 
                    onClick={() => handleSponsorClick(e.title)}
                    style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)' }}
                  >
                    Sponsor Now 🤝
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SponsorDashboard;