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
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`/api/events/${id}`);
        setEvent(data);
      } catch (error) {
        // Agar event na mile ya server down ho
        toast.error("Event load failed. Server might be waking up...");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSponsor = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'sponsor') return toast.error("Only Sponsors can fund events");

    const amount = prompt(`Enter amount (Budget: ₹${event.budget})`);
    if (!amount) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // 👇 Backend request
      await axios.put(`/api/events/${id}/sponsor`, { amount }, config);
      
      toast.success("🎉 Sponsorship Successful!");
      
      // Page reload mat karo, state update karo (Faster feel hoga)
      setEvent({ ...event, raisedAmount: (event.raisedAmount || 0) + Number(amount) });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to sponsor");
    }
  };

  // 👇 LOADING SKELETON (Animation jab tak server slow hai)
  if (loading) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Poppins' }}>
         <p style={{textAlign:'center', color:'#64748b', fontSize:'0.9rem'}}>Server is waking up, please wait...</p>
        <div style={{ height: '250px', background: '#e2e8f0', borderRadius: '15px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '40px', width: '70%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '15px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '20px', width: '100%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '10px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '20px', width: '90%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '30px', animation: 'pulse 1.5s infinite' }}></div>
        <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
      </div>
    );
  }

  if (!event) return <div style={{textAlign:'center', marginTop:'50px'}}>Event not found</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', fontFamily: 'Poppins' }}>
      
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        
        {/* Banner */}
        <div style={{ height: '200px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '3rem', margin: 0 }}>🚀</h1>
        </div>

        <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap:'wrap', gap:'10px' }}>
                <div>
                    <h1 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{event.title}</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>📍 {event.location} | 📅 {new Date(event.date).toLocaleDateString()}</p>
                </div>
                {/* Status Badge */}
                <span style={{ 
                    background: event.isApproved ? '#dcfce7' : '#fef3c7', 
                    color: event.isApproved ? '#166534' : '#b45309', 
                    padding: '8px 16px', borderRadius: '30px', fontWeight: 'bold', height: 'fit-content'
                }}>
                    {event.isApproved ? '✅ Approved' : '⚠️ Pending'}
                </span>
            </div>

            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

            <h3 style={{ color: '#334155' }}>About Event</h3>
            <p style={{ lineHeight: '1.8', color: '#475569' }}>{event.description}</p>

            {/* Budget Section */}
            <div style={{ marginTop: '30px', background: '#f1f5f9', padding: '25px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span style={{ display: 'block', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>BUDGET</span>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>₹{event.budget}</span>
                </div>
                
                {user?.role === 'sponsor' && (
                    <button 
                        onClick={handleSponsor}
                        style={{ padding: '15px 30px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        💰 Sponsor Now
                    </button>
                )}
            </div>

             {/* Organizer Info */}
             <div style={{ marginTop: '30px', padding:'15px', border:'1px solid #e2e8f0', borderRadius:'10px' }}>
                <h4 style={{ margin:'0 0 10px 0', fontSize:'0.9rem', color:'#94a3b8' }}>ORGANIZER</h4>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{event.user?.name || 'Unknown'}</div>
                <div style={{ color: '#64748b' }}>{event.user?.email}</div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetails;