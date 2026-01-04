import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    
    const fetchEvent = async () => {
        try {
            const config = storedUser ? { headers: { Authorization: `Bearer ${storedUser.token}` } } : {};
            const res = await axios.get(`/api/events/${id}`, config);
            setEvent(res.data);
        } catch (error) { 
            console.error("Error:", error); 
            toast.error("Event fetch failed. Server might be sleeping.");
        } finally { 
            setLoading(false); 
        }
    };
    fetchEvent();
  }, [id]);

  // Actions
  const handleShare = () => { navigator.clipboard.writeText(window.location.href); toast.success("🔗 Link Copied!"); };
  const handleWhatsApp = () => { const text = `Check out: ${event.title} at ${event.location}. ${window.location.href}`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); };

  // 👇 SPONSOR LOGIC (API FIX HERE)
  const handleSponsor = async () => { 
      if (!user) return navigate('/login'); 
      if (!user.isVerified) return toast.error("⛔ Not Verified! Check Profile."); 
      if (user.role !== 'sponsor') return toast.error("Only Sponsors account can fund."); 
      if (!amount || amount < 500) return toast.error("Minimum Sponsorship is ₹500"); 

      try { 
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          // FIX: URL Sahi kiya hai (/api/events/:id/sponsor)
          await axios.put(`/api/events/${id}/sponsor`, { amount, comment }, config); 
          toast.success("🎉 Pledge Recorded! Status: Pending"); 
          window.location.reload(); 
      } catch (error) { 
          toast.error("Failed to sponsor. Try again."); 
      } 
  };
  
  const handleVerifyPayment = async (sponsorId) => { 
      if(!window.confirm("Confirm Payment Received?")) return; 
      try { 
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.post('/api/events/admin/verify-payment', { eventId: id, sponsorId }, config); 
          toast.success("✅ Payment Verified!"); 
          window.location.reload(); 
      } catch (error) { toast.error("Error updating status"); } 
  };
  
  const handleRequestRefund = async () => { 
      if(!window.confirm("Cancel pledge and request refund?")) return; 
      try { 
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.put(`/api/events/request-refund/${id}`, {}, config); 
          toast.success("Refund Requested"); 
          window.location.reload(); 
      } catch (error) { toast.error("Error"); } 
  };

  const handleRejectDeal = async (sponsorId) => {
      if(!window.confirm("❌ Decline this offer? The sponsor will be removed.")) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.post('/api/events/organizer/reject-deal', { eventId: id, sponsorId }, config);
          toast.success("Offer Declined");
          window.location.reload();
      } catch (error) { toast.error("Action Failed"); }
  };

  const handleContactSponsor = (email, name) => {
      const subject = `Regarding sponsorship for ${event.title}`;
      const body = `Hi ${name},\n\nWe received your pledge regarding...`;
      window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  // 👇 SKELETON LOADER (Jab tak server jaag raha hai)
  if (loading) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Poppins' }}>
        <p style={{textAlign:'center', color:'#64748b'}}>Fetching Event Details...</p>
        <div style={{ height: '200px', background: '#e2e8f0', borderRadius: '15px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '40px', width: '60%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '15px', animation: 'pulse 1.5s infinite' }}></div>
        <div style={{ height: '20px', width: '100%', background: '#e2e8f0', borderRadius: '8px', marginBottom: '10px', animation: 'pulse 1.5s infinite' }}></div>
        <style>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
      </div>
    );
  }

  if (!event) return <div style={{textAlign:'center', padding:'50px'}}>Event Not Found</div>;

  // Variables
  const isOrganizer = user && event.user && (user._id === event.user._id);
  const isAdmin = user && user.role === 'admin';
  const showDashboard = isOrganizer || isAdmin;
  const mySponsorship = event.sponsors?.find(s => s.sponsorId === user?._id);
  const raised = event.raisedAmount || 0;
  const budget = event.budget || 0;
  const remaining = Math.max(0, budget - raised);
  
  // Trace System Colors
  const getStepColor = (step, currentStatus) => { 
      if (step === 1) return '#16a34a'; // Pledged (Always green if exists)
      if (step === 2) return '#16a34a'; // Processing
      if (step === 3) return currentStatus === 'verified' ? '#16a34a' : '#cbd5e1'; 
      return '#cbd5e1'; 
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '15px', fontFamily: 'Poppins', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      
      {/* HEADER */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'10px'}}>
        <div>
            <h1 style={{color:'#1e293b', marginBottom:'5px', marginTop:0}}>{event.title}</h1>
            <p style={{color:'#64748b', margin:0}}>📍 {event.location} | 📅 {new Date(event.date).toLocaleDateString()}</p>
        </div>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
            <div style={{background:'#f1f5f9', padding:'8px 12px', borderRadius:'20px', fontSize:'0.85rem', color:'#475569', fontWeight:'bold'}}>👁️ {event.views ? event.views.length : 0} Views</div>
            <button onClick={handleShare} style={{background:'#f1f5f9', border:'none', padding:'8px', borderRadius:'50%', cursor:'pointer', fontSize:'1.2rem'}}>🔗</button>
            <button onClick={handleWhatsApp} style={{background:'#dcfce7', border:'none', padding:'8px', borderRadius:'50%', cursor:'pointer', fontSize:'1.2rem'}}>💬</button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div style={{background:'#f0f9ff', padding:'20px', borderRadius:'10px', marginTop:'20px', textAlign:'center', border:'1px solid #bae6fd'}}>
         <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'0.95rem', fontWeight:'bold'}}>
             <span style={{color:'#16a34a'}}>💰 Raised: ₹{raised}</span>
             <span style={{color:'#dc2626'}}>📉 Needed: ₹{remaining}</span>
             <span style={{color:'#0369a1'}}>🎯 Goal: ₹{budget}</span>
         </div>
         <div style={{width:'100%', height:'12px', background:'#e0f2fe', borderRadius:'10px', overflow:'hidden'}}>
             <div style={{width: `${Math.min((raised/budget)*100, 100)}%`, height:'100%', background: remaining === 0 ? '#16a34a' : '#0ea5e9', transition:'width 0.5s ease'}}></div>
         </div>
         {remaining === 0 && <div style={{color:'#16a34a', fontWeight:'bold', marginTop:'5px', fontSize:'0.9rem'}}>🎉 Fully Funded!</div>}
      </div>

      <div style={{marginTop:'30px'}}><h3>📝 Description</h3><p style={{color:'#475569', lineHeight:'1.6'}}>{event.description}</p></div>

      {/* 👇 DASHBOARD / SPONSOR AREA */}
      <div style={{borderTop:'2px dashed #e2e8f0', marginTop:'30px', paddingTop:'30px', textAlign:'center'}}>
        {showDashboard ? (
            <div style={{textAlign:'left'}}>
                <h3 style={{color: isOrganizer ? '#2563eb' : '#b91c1c', borderBottom:'2px solid #e2e8f0', paddingBottom:'10px', marginBottom:'20px'}}>{isOrganizer ? "📋 Organizer Dashboard" : "👮 Admin Panel: Sponsors"}</h3>
                {event.sponsors && event.sponsors.length > 0 ? (
                    <div style={{display:'grid', gap:'15px'}}>{event.sponsors.map((s, index) => (
                        <div key={index} style={{background: s.status === 'verified' ? '#f0fdf4' : '#fff7ed', padding:'20px', borderRadius:'10px', border: s.status === 'verified' ? '1px solid #bbf7d0' : '1px solid #ffedd5', display:'flex', flexDirection:'column', gap:'10px'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                <div><div style={{color:'#d97706', fontWeight:'bold', fontSize:'1.1rem'}}>🏢 {s.companyName}</div><div style={{fontWeight:'bold', color:'#334155'}}>{s.name}</div></div>
                                <div style={{textAlign:'right'}}><div style={{color:'#16a34a', fontWeight:'bold', fontSize:'1.2rem'}}>₹{s.amount}</div><div style={{fontSize:'0.8rem', fontWeight:'bold', color: s.status === 'verified' ? 'green' : 'orange'}}>{s.status === 'verified' ? '✅ PAID' : '⏳ PENDING'}</div></div>
                            </div>
                            <div style={{background:'white', padding:'10px', borderRadius:'5px', border:'1px dashed #ccc'}}><strong>📝 Note:</strong> <em style={{color:'#555'}}>"{s.comment || 'No note'}"</em></div>
                            
                            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'5px', flexWrap:'wrap'}}>
                                {isOrganizer && s.status !== 'verified' && (
                                    <>
                                        <button onClick={() => handleContactSponsor(s.email, s.name)} style={{padding:'8px 15px', background:'#f59e0b', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>✉️ Discuss</button>
                                        <button onClick={() => handleRejectDeal(s.sponsorId)} style={{padding:'8px 15px', background:'#ef4444', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>❌ Decline</button>
                                        <button onClick={() => handleVerifyPayment(s.sponsorId)} style={{padding:'8px 15px', background:'#16a34a', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>✅ Verify Payment</button>
                                    </>
                                )}
                            </div>
                        </div>))}</div>
                ) : ( <div style={{padding:'20px', background:'#f1f5f9', textAlign:'center', color:'#64748b'}}>No sponsors yet.</div> )}
            </div>
        ) : (
            <>
            {/* 👇 SPONSOR VIEW (TRACKING SYSTEM) */}
            {mySponsorship ? (
                <div style={{background:'#f8fafc', padding:'25px', borderRadius:'10px', border:'1px solid #cbd5e1'}}>
                    
                    {/* STEPPER UI */}
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', position:'relative', maxWidth:'400px', margin:'0 auto 20px auto'}}>
                        <div style={{position:'absolute', top:'15px', left:'10%', right:'10%', height:'3px', background:'#e2e8f0', zIndex:0}}></div>
                        <div style={{zIndex:1, textAlign:'center'}}><div style={{width:'35px', height:'35px', background: getStepColor(1, mySponsorship.status), color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', fontWeight:'bold'}}>1</div><span style={{fontSize:'0.8rem', fontWeight:'bold'}}>Pledged</span></div>
                        <div style={{zIndex:1, textAlign:'center'}}><div style={{width:'35px', height:'35px', background: getStepColor(2, mySponsorship.status), color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', fontWeight:'bold'}}>2</div><span style={{fontSize:'0.8rem', fontWeight:'bold'}}>Processing</span></div>
                        <div style={{zIndex:1, textAlign:'center'}}><div style={{width:'35px', height:'35px', background: getStepColor(3, mySponsorship.status), color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', fontWeight:'bold'}}>3</div><span style={{fontSize:'0.8rem', fontWeight:'bold'}}>Completed</span></div>
                    </div>

                    <div style={{textAlign:'center', background: mySponsorship.status === 'verified' ? '#dcfce7' : '#fff7ed', color: mySponsorship.status === 'verified' ? '#166534' : '#c2410c', padding:'10px', borderRadius:'6px', fontSize:'0.9rem', marginBottom:'20px', border: mySponsorship.status === 'verified' ? '1px solid #16a34a' : '1px solid #fdba74'}}>
                        {mySponsorship.status === 'verified' ? "🎉 Payment Verified! Deal is Sealed." : "⏳ Admin/Organizer will verify payment soon."}
                    </div>
                    
                    <h3 style={{color:'#166534', marginTop:0}}>✅ Pledged: ₹{mySponsorship.amount}</h3>
                    {mySponsorship.status !== 'refund_requested' && (
                        <button onClick={handleRequestRefund} style={{padding:'12px 25px', background:'#dc2626', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', marginTop:'10px'}}>❌ Request Refund</button>
                    )}
                </div>
            ) : (
                <div style={{maxWidth:'550px', margin:'0 auto'}}>
                    {user && user.role === 'sponsor' ? (
                        user.isVerified ? (
                            <div style={{display:'flex', flexDirection:'column', gap:'15px', background:'#f8fafc', padding:'25px', borderRadius:'15px', border:'1px solid #e2e8f0'}}>
                                <h3 style={{margin:'0 0 10px 0', color:'#334155'}}>🤝 Make a Pledge</h3>
                                <textarea placeholder="Private Note for Organizer (e.g., 'Need Logo on Banner')..." value={comment} onChange={e=>setComment(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #cbd5e1', minHeight:'80px'}}/>
                                <div style={{display:'flex', gap:'15px'}}>
                                    <input type="number" placeholder="Amount (Min ₹500)" value={amount} onChange={e=>setAmount(e.target.value)} style={{padding:'12px', flex:1, border:'1px solid #cbd5e1', borderRadius:'8px', fontSize:'1rem'}} />
                                    <button onClick={handleSponsor} style={{padding:'12px 30px', background:'#16a34a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>Confirm Pledge</button>
                                </div>
                            </div>
                        ) : (<div style={{padding:'20px', background:'#fff7ed', color:'#c2410c', border:'1px solid #fdba74', borderRadius:'10px'}}>⚠️ Your Sponsor Account is Pending Verification. Cannot Fund yet.</div>)
                    ) : (<p style={{color:'#64748b'}}>Login as a <strong>Verified Sponsor</strong> to fund this event.</p>)}
                </div>
            )}
            </>
        )}
      </div>
    </div>
  );
};
export default EventDetails;