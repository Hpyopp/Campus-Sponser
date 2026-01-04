import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Current User nikalo
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchEvent = async () => {
      try {
        // 👇 Backend API Call
        const { data } = await axios.get(`/api/events/${id}`);
        setEvent(data);
      } catch (error) {
        toast.error("Event not found");
        navigate('/'); // Agar event nahi mila toh home bhej do
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  // Sponsor Button Handler
  const handleSponsor = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'sponsor') return toast.error("Only Sponsors can fund events");

    const amount = prompt(`Enter amount to sponsor (Budget: ₹${event.budget})`);
    if (!amount) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/events/${id}/sponsor`, { amount }, config);
      toast.success("🎉 Sponsorship Successful!");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to sponsor");
    }
  };

  // 👇 PROFESSIONAL SKELETON LOADER (Jab tak load ho raha hai ye dikhega)
  if (loading) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Poppins' }}>
        <div style={{ height: '300px', background: '#e2e8f0', borderRadius: '15px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '40px', width: '60%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '15px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '20px', width: '100%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '10px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '20px', width: '90%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '30px', animation: 'pulse 1.5s infinite' }}></div>
        <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', fontFamily: 'Poppins' }}>
      
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        
        {/* Header Image / Gradient */}
        <div style={{ height: '250px', background: 'linear-gradient(135deg, #2563eb, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <h1 style={{ fontSize: '3rem', margin: 0 }}>🚀</h1>
        </div>

        <div style={{ padding: '40px' }}>
            {/* Title & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap:'wrap', gap:'10px' }}>
                <div>
                    <h1 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '2.2rem' }}>{event.title}</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📍 {event.location} &nbsp;|&nbsp; 📅 {new Date(event.date).toLocaleDateString()}
                    </p>
                </div>
                {event.isApproved ? (
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '8px 16px', borderRadius: '30px', fontWeight: 'bold' }}>✅ Approved</span>
                ) : (
                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '8px 16px', borderRadius: '30px', fontWeight: 'bold' }}>⚠️ Pending Approval</span>
                )}
            </div>

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

            {/* Description */}
            <h3 style={{ color: '#334155' }}>About Event</h3>
            <p style={{ lineHeight: '1.8', color: '#475569', fontSize: '1.05rem' }}>{event.description}</p>

            {/* Budget Box */}
            <div style={{ marginTop: '30px', background: '#f1f5f9', padding: '25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span style={{ display: 'block', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>TOTAL BUDGET NEEDED</span>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>₹{event.budget}</span>
                </div>
                
                {/* Sponsor Button */}
                {user?.role === 'sponsor' && (
                    <button 
                        onClick={handleSponsor}
                        style={{ padding: '15px 30px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)' }}
                    >
                        💰 Sponsor Now
                    </button>
                )}
            </div>

            {/* Organizer Info */}
            <div style={{ marginTop: '40px' }}>
                <h4 style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Organized By</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                    <div style={{ width: '50px', height: '50px', background: '#cbd5e1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                        {event.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{event.user?.name || 'Unknown Organizer'}</div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{event.user?.email}</div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetails;