import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`/api/events/${id}`);
        setEvent(data);
      } catch (error) { toast.error("Event not found"); }
    };
    fetchEvent();
  }, [id]);

  // 👇 FRESH SERVER CHECK LOGIC
  const handleSponsor = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'sponsor') return toast.error("Only Sponsors can pledge!");

    setLoading(true);
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        // 1. Fresh Check from Server (Sabse Safe Tarika)
        const meRes = await axios.get('/api/users/me', config);
        
        // 2. Agar Verified nahi hai, toh rok do
        if (!meRes.data.isVerified) {
            toast.error("🚫 You are NOT Verified by Admin yet!");
            
            // LocalStorage bhi update kar do taaki user ko pata chale
            const updatedUser = { ...user, isVerified: false };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("storage"));
            
            setLoading(false);
            return;
        }

        // 3. Agar Verified hai, toh Pledge karo
        await axios.put(`/api/events/${id}/sponsor`, { amount, comment }, config);
        toast.success("🎉 Thank you for Pledging!");
        navigate('/');

    } catch (error) {
      toast.error("Transaction Failed");
    } finally { setLoading(false); }
  };

  const shareOnWhatsApp = () => {
      const message = `Check out this amazing event: *${event?.title}* on CampusSponsor! \n\nHelp us make it happen: ${window.location.href}`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  if (!event) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '10px' }}>{event.title}</h1>
        
        <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span>📅 {new Date(event.date).toLocaleDateString()}</span>
            <span>📍 {event.location}</span>
            <span>💰 Budget: ₹{event.budget}</span>
        </div>

        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#334155', marginBottom: '30px' }}>{event.description}</p>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button 
                onClick={shareOnWhatsApp}
                style={{ flex: 1, padding: '12px', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}
            >
                <span>📲 Share on WhatsApp</span>
            </button>

            {event.permissionLetter && (
                <a href={event.permissionLetter} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold' }}>
                    📄 View Permission
                </a>
            )}
        </div>
      </div>

      {/* SPONSOR FORM */}
      <div style={{ marginTop: '30px', background: '#f8fafc', padding: '30px', borderRadius: '15px', border: '2px dashed #cbd5e1' }}>
        <h2 style={{ textAlign: 'center', color: '#1e293b' }}>🤝 Become a Sponsor</h2>
        {user?.role === 'sponsor' ? (
            <form onSubmit={handleSponsor} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input type="number" placeholder="Enter Amount (₹)" value={amount} onChange={e=>setAmount(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                <textarea placeholder="Message for Organizer (Optional)" value={comment} onChange={e=>setComment(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', height: '80px' }} />
                
                {/* Button Logic */}
                <button type="submit" disabled={loading} style={{ padding: '15px', background: '#f59e0b', color: 'black', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    {loading ? 'Processing...' : 'Pledge Support'}
                </button>
            </form>
        ) : (
            <div style={{ textAlign: 'center', marginTop: '20px', color: '#64748b' }}>
                {user ? "Only Sponsors can pledge." : <span onClick={() => navigate('/login')} style={{color:'#2563eb', cursor:'pointer', fontWeight:'bold', textDecoration:'underline'}}>Login as Sponsor to Support</span>}
            </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;