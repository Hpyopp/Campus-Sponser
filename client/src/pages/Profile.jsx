import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [myEvents, setMyEvents] = useState([]); 
  const [sponsoredEvents, setSponsoredEvents] = useState([]); 

  useEffect(() => {
    if (!user) navigate('/login');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const { data: allEvents } = await axios.get('/api/events');
        
        if (user.role === 'student') {
            const mine = allEvents.filter(e => e.user?._id === user._id || e.user === user._id);
            setMyEvents(mine);
        } else if (user.role === 'sponsor') {
            // Find events where this user is a sponsor
            const sponsored = allEvents.filter(e => e.sponsors.some(s => s.sponsorId === user._id));
            setSponsoredEvents(sponsored);
        }
    } catch (error) { console.error(error); }
  };

  const handleRefundRequest = async (eventId) => {
      if(!window.confirm("Are you sure you want to request a refund? This will cancel your sponsorship.")) return;
      
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.put(`/api/events/${eventId}/refund-request`, {}, config);
          toast.success("Refund Requested! Admin will verify.");
          fetchData(); // Refresh UI
      } catch (error) {
          toast.error("Request Failed");
      }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily:'Poppins' }}>
      
      {/* HEADER */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap:'wrap', gap:'20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', background: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h1 style={{ margin: 0, color: '#1e293b' }}>{user.name}</h1>
                <p style={{ margin: '5px 0', color: '#64748b' }}>{user.email}</p>
                <span style={{ background: user.isVerified ? '#dcfce7' : '#fef9c3', color: user.isVerified ? '#166534' : '#854d0e', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {user.isVerified ? 'Verified ✅' : 'Pending Verification ⏳'}
                </span>
            </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>

      <h2 style={{ marginTop: '40px', color: '#334155' }}>My Dashboard</h2>
      
      {/* STUDENT VIEW */}
      {user.role === 'student' && (
        <div style={{ display: 'grid', gap: '20px' }}>
            {myEvents.map(event => (
                <div key={event._id} style={{ background: 'white', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #2563eb', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{event.title}</h3>
                    <div style={{display:'flex', gap:'20px', color:'#64748b', fontSize:'0.9rem', marginBottom:'15px'}}>
                        <span>Raised: ₹{event.raisedAmount || 0} / ₹{event.budget}</span>
                        <span>Sponsors: {event.sponsors.length}</span>
                    </div>
                    {event.sponsors.length > 0 && (
                        <div style={{background:'#f8fafc', padding:'10px', borderRadius:'8px'}}>
                            <strong>Recent Sponsors:</strong>
                            {event.sponsors.map((s, i) => (
                                <div key={i} style={{fontSize:'0.9rem', marginTop:'5px', color: s.status === 'refunded' ? '#ef4444' : '#16a34a'}}>
                                    {s.status === 'refunded' ? '🚫 Refunded: ' : '+ '} ₹{s.amount} from {s.companyName}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            {myEvents.length === 0 && <p>No events created yet.</p>}
        </div>
      )}

      {/* SPONSOR VIEW (Refund Button Here) */}
      {user.role === 'sponsor' && (
        <div style={{ display: 'grid', gap: '20px' }}>
            {sponsoredEvents.map(event => {
                const mySponsorship = event.sponsors.find(s => s.sponsorId === user._id);
                return (
                    <div key={event._id} style={{ background: 'white', padding: '20px', borderRadius: '10px', borderLeft: `5px solid ${mySponsorship.status === 'verified' ? '#16a34a' : '#ef4444'}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 5px 0' }}>{event.title}</h3>
                        <p style={{color:'#64748b', fontSize:'0.9rem'}}>Paid: ₹{mySponsorship.amount} | Status: <strong style={{textTransform:'uppercase'}}>{mySponsorship.status}</strong></p>
                        
                        <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
                            <button onClick={() => navigate(`/event/${event._id}`)} style={{background:'#e2e8f0', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontSize:'0.85rem'}}>
                                View Details / Agreement
                            </button>
                            
                            {mySponsorship.status === 'verified' && (
                                <button onClick={() => handleRefundRequest(event._id)} style={{background:'#fee2e2', color:'#dc2626', border:'1px solid #dc2626', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontSize:'0.85rem'}}>
                                    Request Refund ↩️
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
            {sponsoredEvents.length === 0 && <p>You haven't sponsored any events yet.</p>}
        </div>
      )}
    </div>
  );
};

export default Profile;