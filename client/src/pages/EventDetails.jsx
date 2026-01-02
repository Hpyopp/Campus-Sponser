import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`/api/events/${id}`);
      setEvent(res.data);
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); }
  };

  const handleSponsor = async () => {
    if (!user) return navigate('/login');
    if (!user.isVerified) return alert("⛔ Account Not Verified! Admin approval needed.");
    if (user.role !== 'sponsor') return alert("Only Sponsors can fund events!");
    if (!amount || amount < 500) return alert("Min amount ₹500");

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/events/sponsor/${id}`, { amount, comment }, config);
      alert("🎉 Pledge Recorded! Redirecting to Agreement...");
      navigate(`/agreement/${id}`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed");
    }
  };

  const handleRequestRefund = async () => {
    if(!window.confirm("Are you sure you want to cancel pledge & refund?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/events/request-refund/${id}`, {}, config);
      alert("Refund Requested. Please inform Admin.");
      fetchEvent();
    } catch (error) { alert("Error"); }
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading...</div>;
  if (!event) return <div style={{textAlign:'center', padding:'50px'}}>Not Found</div>;

  // Roles Check
  const isOrganizer = user && event.user && (user._id === event.user._id);
  const isAdmin = user && user.role === 'admin';
  const showDashboard = isOrganizer || isAdmin;

  const mySponsorship = event.sponsors?.find(s => s.sponsorId === user?._id);
  const raised = event.raisedAmount || 0;
  const budget = event.budget || 0;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '15px', fontFamily: 'Poppins', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      
      {/* HEADER */}
      <h1 style={{color:'#1e293b', marginBottom:'5px'}}>{event.title}</h1>
      <p style={{color:'#64748b', margin:0}}>📍 {event.location} | 📅 {new Date(event.date).toLocaleDateString()}</p>

      {/* PROGRESS BAR */}
      <div style={{background:'#f0f9ff', padding:'20px', borderRadius:'10px', marginTop:'20px', textAlign:'center', border:'1px solid #bae6fd'}}>
         <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px', fontSize:'0.9rem', color:'#0369a1', fontWeight:'bold'}}>
             <span>Raised: ₹{raised}</span>
             <span>Goal: ₹{budget}</span>
         </div>
         <div style={{width:'100%', height:'10px', background:'#e0f2fe', borderRadius:'5px', overflow:'hidden'}}>
             <div style={{width: `${Math.min((raised/budget)*100, 100)}%`, height:'100%', background:'#0ea5e9', transition:'width 0.5s ease'}}></div>
         </div>
      </div>

      <div style={{marginTop:'30px'}}>
         <h3>📝 Description</h3>
         <p style={{color:'#475569', lineHeight:'1.6'}}>{event.description}</p>
      </div>

      <div style={{borderTop:'2px dashed #e2e8f0', marginTop:'30px', paddingTop:'30px', textAlign:'center'}}>
        
        {/* 👇 1. ORGANIZER & ADMIN DASHBOARD VIEW */}
        {showDashboard ? (
            <div style={{textAlign:'left'}}>
                <h3 style={{color: isOrganizer ? '#2563eb' : '#b91c1c', borderBottom:'2px solid #e2e8f0', paddingBottom:'10px', marginBottom:'20px'}}>
                    {isOrganizer ? "📋 Organizer Dashboard: Sponsors" : "👮 Admin View: Event Sponsors"}
                </h3>
                
                {event.sponsors && event.sponsors.length > 0 ? (
                    <div style={{display:'grid', gap:'15px'}}>
                        {event.sponsors.map((s, index) => (
                            <div key={index} style={{background:'#fff7ed', padding:'20px', borderRadius:'10px', border:'1px solid #ffedd5', display:'flex', flexDirection:'column', gap:'10px'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                    <div>
                                        <div style={{color:'#d97706', fontWeight:'bold', fontSize:'1.1rem'}}>🏢 {s.companyName || "Individual"}</div>
                                        <div style={{fontWeight:'bold', color:'#334155'}}>{s.name}</div> 
                                        <div style={{fontSize:'0.9rem', color:'#64748b'}}>{s.email}</div>
                                    </div>
                                    <div style={{textAlign:'right'}}>
                                        <div style={{color:'#16a34a', fontWeight:'bold', fontSize:'1.2rem'}}>₹{s.amount}</div>
                                        <div style={{fontSize:'0.8rem', color:'#666'}}>{new Date(s.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div style={{background:'white', padding:'10px', borderRadius:'5px', border:'1px dashed #ccc'}}>
                                    <strong>📝 Note:</strong> <em style={{color:'#555'}}>"{s.comment || 'No note'}"</em>
                                </div>
                                <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                                    <button onClick={() => navigate(`/agreement/${id}?sponsorId=${s.sponsorId}`)} style={{padding:'8px 15px', background:'#2563eb', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>📄 View Agreement</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{padding:'20px', background:'#f1f5f9', borderRadius:'10px', textAlign:'center', color:'#64748b'}}>No sponsors yet.</div>
                )}
            </div>
        ) : (
            // 👇 2. NORMAL SPONSOR VIEW
            <>
                {mySponsorship ? (
                    <div style={{background:'#f8fafc', padding:'25px', borderRadius:'10px', border:'1px solid #cbd5e1'}}>
                        
                        {/* 🔥 NEW: DEAL TRACKER UI */}
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', position:'relative'}}>
                            <div style={{position:'absolute', top:'15px', left:'10%', right:'10%', height:'2px', background:'#cbd5e1', zIndex:0}}></div>
                            
                            <div style={{zIndex:1, textAlign:'center'}}>
                                <div style={{width:'30px', height:'30px', background:'#16a34a', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto'}}>✓</div>
                                <span style={{fontSize:'0.8rem', fontWeight:'bold'}}>Pledged</span>
                            </div>
                            <div style={{zIndex:1, textAlign:'center'}}>
                                <div style={{width:'30px', height:'30px', background: mySponsorship.status === 'refund_requested' ? '#dc2626' : '#16a34a', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto'}}>
                                    {mySponsorship.status === 'refund_requested' ? '!' : '✓'}
                                </div>
                                <span style={{fontSize:'0.8rem', fontWeight:'bold'}}>Processing</span>
                            </div>
                            <div style={{zIndex:1, textAlign:'center', opacity: 0.5}}>
                                <div style={{width:'30px', height:'30px', background:'#cbd5e1', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto'}}>3</div>
                                <span style={{fontSize:'0.8rem', fontWeight:'bold'}}>Completed</span>
                            </div>
                        </div>

                        <h3 style={{color:'#166534', marginTop:0}}>✅ Pledged: ₹{mySponsorship.amount}</h3>
                        
                        {mySponsorship.comment && (
                            <div style={{background:'#fff', padding:'10px', borderRadius:'5px', border:'1px dashed #ccc', margin:'15px 0', fontStyle:'italic', color:'#555'}}>
                                📝 Your Note: "{mySponsorship.comment}"
                            </div>
                        )}

                        {mySponsorship.status === 'refund_requested' ? (
                            <span style={{color:'orange', fontWeight:'bold'}}>⏳ Refund Pending...</span>
                        ) : (
                            <div style={{display:'flex', gap:'20px', justifyContent:'center', marginTop:'15px'}}>
                                <button onClick={() => navigate(`/agreement/${id}`)} style={{padding:'12px 25px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>📄 View Agreement</button>
                                <button onClick={handleRequestRefund} style={{padding:'12px 25px', background:'#dc2626', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>❌ Request Refund</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{maxWidth:'550px', margin:'0 auto'}}>
                        {user && user.role === 'sponsor' ? (
                            user.isVerified ? (
                                <div style={{display:'flex', flexDirection:'column', gap:'15px', background:'#f8fafc', padding:'25px', borderRadius:'15px', border:'1px solid #e2e8f0'}}>
                                    <h3 style={{margin:'0 0 10px 0', color:'#334155'}}>🤝 Make a Pledge</h3>
                                    <textarea placeholder="Private Note for Organizer..." value={comment} onChange={e=>setComment(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #cbd5e1', minHeight:'80px'}}/>
                                    <div style={{display:'flex', gap:'15px'}}>
                                        <input type="number" placeholder="Amount (Min ₹500)" value={amount} onChange={e=>setAmount(e.target.value)} style={{padding:'12px', flex:1, border:'1px solid #cbd5e1', borderRadius:'8px', fontSize:'1rem'}} />
                                        <button onClick={handleSponsor} style={{padding:'12px 30px', background:'#16a34a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>Confirm Pledge</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{padding:'20px', background:'#fff7ed', color:'#c2410c', border:'1px solid #fdba74', borderRadius:'10px'}}>⚠️ Verification Pending</div>
                            )
                        ) : (
                            <p style={{color:'#64748b'}}>Login as Verified Sponsor to fund.</p>
                        )}
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};
export default EventDetails;