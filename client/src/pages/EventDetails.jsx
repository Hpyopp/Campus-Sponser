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

  const mySponsorship = event.sponsors?.find(s => s.sponsorId === user?._id);
  const raised = event.raisedAmount || 0;
  const budget = event.budget || 0;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '15px', fontFamily: 'Poppins', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h1 style={{color:'#1e293b'}}>{event.title}</h1>
      <p style={{color:'#64748b'}}>📍 {event.location} | 📅 {new Date(event.date).toLocaleDateString()}</p>

      <div style={{background:'#f0f9ff', padding:'20px', borderRadius:'10px', marginTop:'20px', textAlign:'center', border:'1px solid #bae6fd'}}>
         <h2 style={{color:'#0284c7', margin:0}}>₹ {raised} <span style={{fontSize:'1rem', color:'#64748b'}}>/ ₹ {budget}</span></h2>
      </div>

      <div style={{marginTop:'30px'}}>
         <h3>📝 Description</h3>
         <p style={{color:'#475569', lineHeight:'1.6'}}>{event.description}</p>
      </div>

      <div style={{borderTop:'2px dashed #e2e8f0', marginTop:'30px', paddingTop:'30px', textAlign:'center'}}>
        
        {/* 👇 1. ADMIN VIEW (Show List of Sponsors) */}
        {user && user.role === 'admin' ? (
            <div style={{textAlign:'left'}}>
                <h3 style={{color:'#b91c1c', borderBottom:'2px solid #b91c1c', paddingBottom:'10px', marginBottom:'20px'}}>
                    👮 Admin View: Event Sponsors
                </h3>
                
                {event.sponsors && event.sponsors.length > 0 ? (
                    <div style={{display:'grid', gap:'15px'}}>
                        {event.sponsors.map((s, index) => (
                            <div key={index} style={{background:'#fff7ed', padding:'20px', borderRadius:'10px', border:'1px solid #ffedd5', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                
                                {/* Sponsor Details */}
                                <div>
                                    <div style={{color:'#d97706', fontWeight:'bold', fontSize:'1.1rem'}}>🏢 {s.companyName || "Individual"}</div>
                                    <div style={{fontWeight:'bold', color:'#334155'}}>{s.name} <span style={{fontWeight:'normal', fontSize:'0.8rem'}}>({s.email})</span></div>
                                    
                                    {/* Amount */}
                                    <div style={{color:'#16a34a', fontWeight:'bold', marginTop:'5px'}}>Pledged: ₹{s.amount}</div>
                                    
                                    {/* Note */}
                                    {s.comment ? (
                                        <div style={{marginTop:'5px', fontStyle:'italic', color:'#666', background:'white', padding:'5px', borderRadius:'5px', border:'1px dashed #ccc', display:'inline-block'}}>
                                            📝 "{s.comment}"
                                        </div>
                                    ) : <div style={{color:'#ccc', fontSize:'0.8rem', marginTop:'5px'}}>No notes added</div>}
                                </div>

                                {/* Action Button */}
                                <div>
                                    <button 
                                        onClick={() => navigate(`/agreement/${id}?sponsorId=${s.sponsorId}`)}
                                        style={{padding:'10px 15px', background:'#2563eb', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}
                                    >
                                        📄 View Agreement
                                    </button>
                                    {s.status === 'refund_requested' && (
                                        <div style={{color:'red', fontWeight:'bold', fontSize:'0.8rem', marginTop:'5px', textAlign:'center'}}>Refund Requested</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{padding:'20px', background:'#f1f5f9', borderRadius:'10px', textAlign:'center', color:'#64748b'}}>
                        No sponsors have pledged for this event yet.
                    </div>
                )}
            </div>
        ) : (
            // 👇 2. NORMAL SPONSOR/STUDENT VIEW (Existing Logic)
            <>
                {mySponsorship ? (
                    <div style={{background:'#f8fafc', padding:'25px', borderRadius:'10px', border:'1px solid #cbd5e1'}}>
                        <h3 style={{color:'#166534', marginTop:0}}>✅ You Pledged: ₹{mySponsorship.amount}</h3>
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
                    <div style={{maxWidth:'500px', margin:'0 auto'}}>
                        {user && user.role === 'sponsor' ? (
                            user.isVerified ? (
                                <div style={{display:'flex', flexDirection:'column', gap:'15px', background:'#f8fafc', padding:'20px', borderRadius:'10px', border:'1px solid #e2e8f0'}}>
                                    <div style={{textAlign:'left'}}>
                                        <label style={{fontWeight:'bold', color:'#334155', fontSize:'0.9rem'}}>Private Note for Organizer (Optional):</label>
                                        <textarea placeholder="E.g. 'We need our logo on the main banner...'" value={comment} onChange={e=>setComment(e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc', minHeight:'70px', marginTop:'5px', fontFamily:'inherit'}}/>
                                    </div>
                                    <div style={{display:'flex', gap:'10px'}}>
                                        <input type="number" placeholder="Amount (Min ₹500)" value={amount} onChange={e=>setAmount(e.target.value)} style={{padding:'12px', flex:1, border:'1px solid #ccc', borderRadius:'6px', fontSize:'1rem'}} />
                                        <button onClick={handleSponsor} style={{padding:'12px 25px', background:'#16a34a', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem'}}>Pledge Now 🤝</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{padding:'15px', background:'#fff7ed', color:'#c2410c', border:'1px solid #fdba74', borderRadius:'8px'}}>⚠️ Verification Pending</div>
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