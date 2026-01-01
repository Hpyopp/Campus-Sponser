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

  // --- SPONSOR FUNCTION (Redirect Added) ---
  const handleSponsor = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'sponsor') return alert("Only Sponsors can fund events!");
    if (!amount || amount < 500) return alert("Minimum amount is ₹500");

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/events/sponsor/${id}`, { amount }, config);
      
      // 👇 CHANGE: Success ke baad seedha Agreement page par
      alert(`🎉 Success! You sponsored ₹${amount}. Generating Receipt...`);
      navigate(`/agreement/${id}`); 
      
    } catch (error) {
      alert(error.response?.data?.message || "Sponsorship Failed");
    }
  };

  // --- CANCEL FUNCTION ---
  const handleCancel = async () => {
    if(!window.confirm("Are you sure? This will remove your sponsorship and process refund.")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/events/cancel-sponsor/${id}`, {}, config);
      
      const adminPhone = "919022489860"; 
      const msg = `Hello Admin, I cancelled my sponsorship for Event: ${event.title}. Refund Amount: ₹${mySponsorship?.amount}. Please process.`;
      const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
      
      alert("⚠️ Sponsorship Cancelled. Redirecting to WhatsApp for Refund...");
      window.open(waLink, '_blank');
      fetchEvent();
    } catch (error) {
      alert("Error cancelling deal");
    }
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading Details...</div>;
  if (!event) return <div style={{textAlign:'center', padding:'50px'}}>Event Not Found</div>;

  const raised = event.raisedAmount || 0;
  const budget = event.budget || 0;
  const isFullyFunded = raised >= budget;
  const remainingBudget = budget - raised;
  const mySponsorship = event.sponsors?.find(s => s.sponsorId === user?._id);

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontFamily: 'Poppins' }}>
      
      {/* HEADER */}
      <div style={{borderBottom:'2px solid #f1f5f9', paddingBottom:'20px', marginBottom:'20px'}}>
        <h1 style={{fontSize:'2.5rem', color:'#1e293b', margin:0}}>{event.title}</h1>
        <div style={{display:'flex', gap:'20px', marginTop:'10px', color:'#64748b'}}>
            <span>📍 {event.location}</span>
            <span>📅 {new Date(event.date).toDateString()}</span>
        </div>
      </div>

      {/* FUNDS PROGRESS */}
      <div style={{background:'#f0f9ff', padding:'25px', borderRadius:'15px', border:'1px solid #bae6fd', marginBottom:'30px', textAlign:'center'}}>
         <p style={{margin:0, color:'#0369a1', fontWeight:'bold', fontSize:'0.9rem'}}>TOTAL FUNDS RAISED</p>
         <h2 style={{margin:'5px 0', color:'#0284c7', fontSize:'2.2rem'}}>₹ {raised} <span style={{fontSize:'1.2rem', color:'#64748b'}}>/ ₹ {budget}</span></h2>
         
         <div style={{width:'100%', height:'15px', background:'#e2e8f0', borderRadius:'10px', overflow:'hidden', marginTop:'15px', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.1)'}}>
            <div style={{
                width: `${Math.min((raised / budget) * 100, 100)}%`, 
                height:'100%', 
                background: isFullyFunded ? '#22c55e' : '#3b82f6',
                transition: 'width 0.6s ease-in-out'
            }}></div>
         </div>
         
         <p style={{marginTop:'10px', fontWeight:'bold', color: isFullyFunded ? '#166534' : '#c2410c'}}>
            {isFullyFunded ? '🎉 GOAL REACHED! Event Fully Funded.' : `🔥 Need ₹${remainingBudget} more to reach goal`}
         </p>
      </div>

      {/* ORGANIZER */}
      <div style={{background:'#f8fafc', padding:'15px', borderRadius:'10px', marginBottom:'30px', border:'1px solid #e2e8f0'}}>
        <h4 style={{margin:'0 0 5px 0', color:'#475569'}}>Organized By:</h4>
        <div style={{fontSize:'1.1rem', fontWeight:'bold'}}>{event.user?.collegeName || "Unknown College"}</div>
        <div style={{fontSize:'0.9rem', color:'#64748b'}}>Rep: {event.user?.name}</div>
      </div>

      <div style={{marginBottom:'40px'}}>
         <h3 style={{color:'#334155'}}>📝 Description</h3>
         <p style={{lineHeight:'1.7', color:'#4b5563', fontSize:'1.05rem'}}>{event.description}</p>
      </div>

      {/* CONTACT */}
      <div style={{textAlign:'center', padding:'20px', background:'#fdf4ff', borderRadius:'10px', marginBottom:'40px'}}>
         <span style={{fontWeight:'bold', color:'#86198f'}}>Contact Organizer: </span>
         <a href={`mailto:${event.contactEmail}`} style={{color:'#c026d3', fontWeight:'bold'}}>{event.contactEmail}</a>
         {event.instagramLink && (
             <div style={{marginTop:'10px'}}>
                 <a href={getInstaUrl(event.instagramLink)} target="_blank" rel="noreferrer" style={{color:'#be185d', fontWeight:'bold', textDecoration:'underline'}}>📸 Instagram Profile</a>
             </div>
         )}
      </div>

      {/* --- ACTION ZONE --- */}
      <div style={{borderTop:'2px dashed #e2e8f0', paddingTop:'30px', textAlign:'center'}}>
        
        {/* CASE 1: USER IS A SPONSOR */}
        {mySponsorship ? (
            <div style={{padding:'25px', background:'#f0fdf4', borderRadius:'15px', border:'1px solid #86efac', display:'inline-block', width:'100%'}}>
                <h2 style={{color:'#166534', margin:'0 0 10px 0'}}>✅ You Sponsored: ₹{mySponsorship.amount}</h2>
                <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'15px'}}>
                    {/* VIEW RECEIPT BUTTON */}
                    <button onClick={() => navigate(`/agreement/${id}`)} style={{padding:'12px 25px', background:'#166534', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>
                        📄 View Receipt / Agreement
                    </button>
                    
                    {/* CANCEL BUTTON */}
                    <button onClick={handleCancel} style={{padding:'12px 25px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>
                        ❌ Cancel & Refund
                    </button>
                </div>
            </div>
        ) : (
            // CASE 2: NOT SPONSORED YET
            <div>
                {isFullyFunded ? (
                    <div style={{padding:'20px', background:'#dcfce7', color:'#166534', borderRadius:'15px', fontWeight:'bold', fontSize:'1.2rem'}}>
                       🚫 Budget Full. No more sponsors needed.
                    </div>
                ) : (
                    // CASE 3: OPEN FOR FUNDING
                    <div style={{maxWidth:'400px', margin:'0 auto'}}>
                        {user && user.role === 'sponsor' ? (
                            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                <label style={{fontWeight:'bold', color:'#334155'}}>Enter Sponsorship Amount</label>
                                <input 
                                    type="number" 
                                    placeholder={`Min ₹500 - Max ₹${remainingBudget}`}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="500"
                                    max={remainingBudget}
                                    style={{padding:'15px', fontSize:'1.1rem', textAlign:'center', border:'2px solid #3b82f6', borderRadius:'10px', outline:'none'}}
                                />
                                <button onClick={handleSponsor} style={{padding:'15px', background:'#2563eb', color:'white', border:'none', borderRadius:'10px', fontSize:'1.1rem', fontWeight:'bold', cursor:'pointer', boxShadow:'0 4px 15px rgba(37, 99, 235, 0.3)'}}>
                                    🤝 Sponsor Now
                                </button>
                            </div>
                        ) : (
                            <div style={{padding:'20px', background:'#f1f5f9', borderRadius:'10px', color:'#64748b'}}>
                                Login as a <strong>Sponsor</strong> to fund this event.
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>

    </div>
  );
};
export default EventDetails;