import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`/api/events/${id}`);
      setEvent(res.data);
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); }
  };

  const getInstaUrl = (link) => {
    if (!link) return "#";
    if (link.startsWith("http")) return link;
    if (link.startsWith("www.")) return `https://${link}`;
    return `https://instagram.com/${link.replace('@', '')}`;
  };

  // --- SPONSOR HANDLER ---
  const handleSponsor = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'sponsor') return alert("Only Sponsors can fund events!");
    if (!amount || amount < 500) return alert("Minimum amount is ₹500");

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/events/sponsor/${id}`, { amount }, config);
      alert(`🎉 Success! You sponsored ₹${amount}`);
      setAmount('');
      fetchEvent(); // Refresh Data
    } catch (error) {
      alert(error.response?.data?.message || "Sponsorship Failed");
    }
  };

  // --- CANCEL HANDLER ---
  const handleCancel = async () => {
    if(!window.confirm("Are you sure you want to cancel? This will remove your sponsorship.")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/events/cancel-sponsor/${id}`, {}, config);
      
      // WhatsApp Logic
      const adminPhone = "919022489860"; // Tera Number
      const msg = `Hello Admin, I cancelled my sponsorship for Event: ${event.title}. Please confirm refund process.`;
      const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
      
      alert("⚠️ Sponsorship Cancelled. Redirecting to WhatsApp...");
      window.open(waLink, '_blank');
      fetchEvent();
    } catch (error) {
      alert("Error cancelling deal");
    }
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading Details...</div>;
  if (!event) return <div style={{textAlign:'center', padding:'50px'}}>Event Not Found</div>;

  // Logic Variables
  const raised = event.raisedAmount || 0;
  const budget = event.budget || 0;
  const isFullyFunded = raised >= budget;
  const remainingBudget = budget - raised;
  const mySponsorship = event.sponsors?.find(s => s.sponsorId === user?._id);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontFamily: 'Poppins' }}>
      
      {/* HEADER */}
      <div style={{borderBottom:'2px solid #f1f5f9', paddingBottom:'20px', marginBottom:'20px'}}>
        <h1 style={{fontSize:'2.5rem', color:'#1e293b', margin:0}}>{event.title}</h1>
        <div style={{display:'flex', gap:'20px', marginTop:'10px', color:'#64748b'}}>
            <span>📍 {event.location}</span>
            <span>📅 {new Date(event.date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* PROGRESS BAR CARD */}
      <div style={{background:'#f0f9ff', padding:'20px', borderRadius:'15px', border:'1px solid #bae6fd', marginBottom:'30px', textAlign:'center'}}>
         <p style={{margin:0, color:'#0369a1', fontWeight:'bold'}}>Funds Raised</p>
         <h2 style={{margin:'5px 0', color:'#0284c7', fontSize:'2rem'}}>₹ {raised} <span style={{fontSize:'1rem', color:'#64748b'}}>/ ₹ {budget}</span></h2>
         
         <div style={{width:'100%', height:'12px', background:'#e2e8f0', borderRadius:'10px', overflow:'hidden', marginTop:'10px'}}>
            <div style={{
                width: `${Math.min((raised / budget) * 100, 100)}%`, 
                height:'100%', 
                background: isFullyFunded ? '#22c55e' : '#3b82f6',
                transition: 'width 0.5s ease-in-out'
            }}></div>
         </div>
         <p style={{marginTop:'10px', fontWeight:'bold', color: isFullyFunded ? '#166534' : '#c2410c'}}>
            {isFullyFunded ? '🎉 Fully Funded!' : `🔥 Need ₹${remainingBudget} more`}
         </p>
      </div>

      {/* ORGANIZER INFO */}
      <div style={{background:'#f8fafc', padding:'15px', borderRadius:'10px', marginBottom:'30px', border:'1px solid #e2e8f0'}}>
        <h4 style={{margin:'0 0 5px 0', color:'#475569'}}>🎓 Organized By: {event.user?.collegeName || "Unknown College"}</h4>
        <p style={{margin:0, fontSize:'0.9rem', color:'#64748b'}}>Student Rep: {event.user?.name}</p>
      </div>

      {/* DETAILS */}
      <h3 style={{color:'#334155'}}>📝 Description</h3>
      <p style={{lineHeight:'1.8', color:'#4b5563', fontSize:'1.05rem', marginBottom:'30px'}}>{event.description}</p>

      {/* CONTACT INFO */}
      <div style={{background:'#fdf4ff', padding:'20px', borderRadius:'15px', textAlign:'center', marginBottom:'40px'}}>
         <span style={{display:'block', fontSize:'0.9rem', color:'#86198f', fontWeight:'bold'}}>Contact Info</span>
         <a href={`mailto:${event.contactEmail}`} style={{fontWeight:'bold', color:'#c026d3'}}>{event.contactEmail}</a>
         {event.instagramLink && (
            <div style={{marginTop:'5px'}}>
               <a href={getInstaUrl(event.instagramLink)} target="_blank" rel="noreferrer" style={{color:'#be185d', textDecoration:'underline'}}>📸 Instagram Profile</a>
            </div>
         )}
      </div>

      {/* ACTION AREA (Sponsor / Cancel) */}
      <div style={{borderTop:'1px solid #eee', paddingTop:'20px', textAlign:'center'}}>
        
        {/* CASE 1: ALREADY SPONSORED */}
        {mySponsorship ? (
            <div style={{padding:'20px', background:'#f0fdf4', borderRadius:'15px', border:'1px solid #bbf7d0'}}>
                <h3 style={{color:'#166534', margin:'0 0 5px 0'}}>✅ You Sponsored: ₹{mySponsorship.amount}</h3>
                <p style={{color:'#64748b', fontSize:'0.9rem', marginBottom:'15px'}}>Need to revoke?</p>
                <button onClick={handleCancel} style={{padding:'10px 20px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>
                    ❌ Cancel Sponsorship
                </button>
            </div>
        ) : (
            // CASE 2: NOT SPONSORED
            <div>
                {isFullyFunded ? (
                    <div style={{padding:'20px', background:'#dcfce7', color:'#166534', borderRadius:'15px', fontWeight:'bold', fontSize:'1.2rem'}}>
                       🚫 Event Fully Funded. Check other events!
                    </div>
                ) : (
                    // CASE 3: OPEN FOR FUNDING
                    <div style={{padding:'20px', background:'#fff', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', borderRadius:'15px'}}>
                        {user && user.role === 'sponsor' ? (
                            <div style={{display:'flex', flexDirection:'column', gap:'15px', alignItems:'center'}}>
                                <label style={{fontWeight:'bold', color:'#334155'}}>Enter Amount (Min ₹500)</label>
                                <input 
                                    type="number" 
                                    placeholder={`₹ 500 - ₹ ${remainingBudget}`}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="500"
                                    max={remainingBudget}
                                    style={{padding:'12px', width:'200px', fontSize:'1.1rem', textAlign:'center', border:'2px solid #3b82f6', borderRadius:'10px'}}
                                />
                                <button onClick={handleSponsor} style={{padding:'12px 40px', background:'#2563eb', color:'white', border:'none', borderRadius:'10px', fontSize:'1.1rem', fontWeight:'bold', cursor:'pointer'}}>
                                    🤝 Sponsor Now
                                </button>
                            </div>
                        ) : (
                            <p style={{color:'#64748b'}}>Login as a <strong>Sponsor</strong> to fund this event.</p>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>

      <button onClick={() => navigate('/')} style={{display:'block', margin:'30px auto 0', background:'none', border:'none', textDecoration:'underline', cursor:'pointer', color:'#64748b'}}>Back to Home</button>
    </div>
  );
};
export default EventDetails;