import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SponsorDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null); // 👇 Contact store karne ke liye
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) navigate('/login');
    if (user?.role !== 'sponsor') {
      alert("Access Denied!");
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

  const handleSponsorClick = (eventCreator) => {
    // 🔒 Security Check
    if (!user.isVerified) {
      alert("🚫 You are NOT Verified!\nUpload your Company ID to see contact details.");
      navigate('/verify'); // Verify page par bhej do
      return;
    }

    // ✅ Reveal Contact Info
    setSelectedContact(eventCreator);
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, []);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Opportunities... 💰</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins, sans-serif', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', color: 'white', padding: '40px', borderRadius: '20px', marginBottom: '40px' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>🤝 Sponsor Dashboard</h1>
        <p style={{ opacity: 0.9, marginTop: '10px' }}>Find the perfect event for your brand.</p>
      </div>

      {/* Events Grid */}
      <h2 style={{ color: '#334155', marginBottom: '20px' }}>🌟 Active Opportunities</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
        {events.map(e => (
          <div key={e._id} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>{e.title}</h3>
              <span style={{ background: '#dbeafe', color: '#1e40af', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>₹{e.budget} Needed</span>
            </div>
            
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '20px' }}>{e.description}</p>
            <p style={{ fontSize: '0.9rem', color: '#475569' }}>📍 {e.location} | 📅 {e.date}</p>

            <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
              <button 
                onClick={() => handleSponsorClick(e.createdBy)}
                style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}
              >
                Show Organizer Contact 📞
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 👇 CONTACT POPUP MODAL */}
      {selectedContact && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>📞 Contact Details</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Connect with the organizer directly.</p>
            
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', marginBottom: '20px', textAlign: 'left' }}>
              <p><strong>Name:</strong> {selectedContact.name}</p>
              <p><strong>Email:</strong> <a href={`mailto:${selectedContact.email}`} style={{ color: '#2563eb' }}>{selectedContact.email}</a></p>
            </div>

            <button 
              onClick={() => setSelectedContact(null)}
              style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SponsorDashboard;