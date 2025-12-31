import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SponsorDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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
      // ✅ Populate user data (phone, name, email) backend se aana chahiye
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('/api/events', config);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 👇 DYNAMIC WHATSAPP LOGIC
  const handleSponsorClick = (event) => {
    // 1. Verification Check
    if (!user.isVerified) {
      alert("🚫 You are NOT Verified!\nUpload your Company ID to contact organizers.");
      navigate('/verify');
      return;
    }

    // 2. Phone Number Logic
    // Pehle check karo ki Event Creator ka number hai ya nahi.
    // Agar nahi hai (Purane users), toh Default (Tera Number) use karo.
    let phone = event.createdBy?.phone || "9022489860";

    // Safai: Agar number string mein hai toh spaces hatao
    phone = phone.toString().replace(/\s+/g, '');

    // Country Code: Agar sirf 10 digit hai (e.g. 9876543210), toh aage 91 lagao
    if (phone.length === 10) {
      phone = `91${phone}`;
    }

    // 3. Message Creation
    const message = `Hello! I saw your event "${event.title}" on CampusSponsor and I'm interested in sponsoring it. Let's discuss! 🤝`;
    
    // 4. Open WhatsApp
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    if (user) fetchEvents();
  }, []);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Opportunities... 💰</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', color: 'white', padding: '40px', borderRadius: '20px', marginBottom: '40px', boxShadow: '0 10px 25px -5px rgba(37, 211, 102, 0.4)' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>🤝 Sponsor Dashboard</h1>
        <p style={{ opacity: 0.9, marginTop: '10px' }}>Directly connect with organizers via WhatsApp.</p>
      </div>

      {/* Events Grid */}
      <h2 style={{ color: '#334155', marginBottom: '20px' }}>🌟 Active Opportunities</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
        {events.map(e => (
          <div key={e._id} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            {/* Content Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b', lineHeight: '1.3', flex: 1 }}>
                  {e.title}
                </h3>
                <span style={{ 
                  background: '#dcfce7', 
                  color: '#166534', 
                  padding: '8px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold', 
                  whiteSpace: 'nowrap', 
                  flexShrink: 0,
                  height: 'fit-content'
                }}>
                  ₹{e.budget} Needed
                </span>
              </div>
              
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.5' }}>{e.description}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#475569', marginBottom: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>📍 {e.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>📅 {e.date ? new Date(e.date).toLocaleDateString() : 'Date TBA'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#64748b' }}>
                  👤 Organizer: {e.createdBy?.name || "Unknown"}
                </span>
              </div>
            </div>

            {/* WhatsApp Button */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
              <button 
                onClick={() => handleSponsorClick(e)}
                style={{ 
                  width: '100%', 
                  background: '#25D366', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold', 
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.3s'
                }}
              >
                <span>Chat on WhatsApp</span> 💬
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SponsorDashboard;