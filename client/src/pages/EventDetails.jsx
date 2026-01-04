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
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchEvent();
  }, [id]);

  const handleAction = async (url, body = {}, successMsg) => {
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(url, body, config);
        toast.success(successMsg);
        window.location.reload();
    } catch (error) { toast.error(error.response?.data?.message || "Action Failed"); }
  };

  const handleSponsor = async () => { 
      if (!user) return navigate('/login'); 
      if (!user.isVerified) return toast.error("Not Verified"); 
      if (user.role !== 'sponsor') return toast.error("Only Sponsors!"); 
      handleAction(`/api/events/${id}/sponsor`, { amount, comment }, "🎉 Pledged!");
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading...</div>;
  if (!event) return <div>Not Found</div>;

  const isOrganizer = user && event.user && (user._id === event.user._id);
  const isAdmin = user && user.role === 'admin';
  const showDashboard = isOrganizer || isAdmin;
  const mySponsorship = event.sponsors?.find(s => s.sponsorId === user?._id);
  const raised = event.raisedAmount || 0;
  const budget = event.budget || 0;
  const remaining = Math.max(0, budget - raised);

  const getStepColor = (step, currentStatus) => { 
      if (step === 1) return '#16a34a'; 
      if (step === 2) return (currentStatus === 'verified' || currentStatus === 'refund_requested' || currentStatus === 'pending') ? '#16a34a' : '#cbd5e1'; 
      if (step === 3) return currentStatus === 'verified' ? '#16a34a' : '#cbd5e1'; 
      return '#cbd5e1'; 
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '15px', fontFamily: 'Poppins', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h1 style={{color:'#1e293b', marginBottom:'5px'}}>{event.title}</h1>
      <p>📍 {event.location} | 📅 {new Date(event.date).toLocaleDateString()}</p>
      
      {/* Progress Section */}
      <div style={{background:'#f0f9ff', padding:'20px', borderRadius:'10px', marginTop:'20px', border:'1px solid #bae6fd'}}>
         <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', fontWeight:'bold'}}>
             <span style={{color:'#16a34a'}}>💰 Raised: ₹{raised}</span>
             <span style={{color:'#0369a1'}}>🎯 Goal: ₹{budget}</span>
         </div>
         <div style={{width:'100%', height:'12px', background:'#e0f2fe', borderRadius:'10px', overflow:'hidden'}}>
             <div style={{width: `${Math.min((raised/budget)*100, 100)}%`, height:'100%', background: remaining === 0 ? '#16a34a' : '#0ea5e9'}}></div>
         </div>
      </div>

      <div style={{marginTop:'30px'}}><h3>📝 About</h3><p>{event.description}</p></div>

      <div style={{borderTop:'2px dashed #e2e8f0', marginTop:'30px', paddingTop:'30px'}}>
        {showDashboard ? (
            <div>
                <h3 style={{color: '#2563eb'}}>📋 Organizer Dashboard</h3>
                {event.sponsors?.length > 0 ? (
                    <div style={{display:'grid', gap:'15px'}}>{event.sponsors.map((s, index) => (
                        <div key={index} style={{background: s.status === 'verified' ? '#f0fdf4' : '#fff7ed', padding:'20px', borderRadius:'10px', border: s.status === 'verified' ? '1px solid #bbf7d0' : '1px solid #ffedd5'}}>
                            <div style={{display:'flex', justifyContent:'space-between'}}>
                                <div><div style={{fontWeight:'bold', fontSize:'1.1rem'}}>{s.companyName}</div><div>{s.name}</div></div>
                                <div style={{textAlign:'right'}}><div style={{fontWeight:'bold', fontSize:'1.2rem'}}>₹{s.amount}</div><div style={{color: s.status === 'verified' ? 'green' : 'orange'}}>{s.status.toUpperCase()}</div></div>
                            </div>
                            <div style={{background:'white', padding:'10px', margin:'10px 0', borderRadius:'5px', border:'1px dashed #ccc'}}>Note: "{s.comment}"</div>
                            <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginTop:'15px'}}>
                                <button onClick={() => navigate(`/agreement/${id}?sponsorId=${s.sponsorId}`)} style={{padding:'8px 15px', background:'#2563eb', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>📄 View Doc</button>
                                {s.status !== 'verified' && s.status !== 'refund_requested' && (
                                    <>
                                        <button onClick={() => window.open(`mailto:${s.email}`)} style={{padding:'8px 15px', background:'#f59e0b', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>✉️ Chat</button>
                                        <button onClick={() => handleAction(`/api/events/${id}/reject-sponsor`, {sponsorId: s.sponsorId}, "Offer Declined")} style={{padding:'8px 15px', background:'#ef4444', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>❌ Decline</button>
                                        <button onClick={() => handleAction(`/api/events/${id}/verify-payment`, {sponsorId: s.sponsorId}, "✅ Payment Verified!")} style={{padding:'8px 15px', background:'#16a34a', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Verify Payment</button>
                                    </>
                                )}
                                {s.status === 'refund_requested' && (
                                    <button onClick={() => handleAction(`/api/events/${id}/process-refund`, {sponsorId: s.sponsorId}, "Refund Processed ✅")} style={{padding:'8px 15px', background:'#dc2626', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>⚙️ Process Refund</button>
                                )}
                                {s.status === 'verified' && <span style={{padding:'8px', color:'green', fontWeight:'bold'}}>Payment Verified ✅</span>}
                            </div>
                        </div>))}</div>
                ) : ( <div>No sponsors yet.</div> )}
            </div>
        ) : (
            mySponsorship ? (
                <div style={{background:'#f8fafc', padding:'25px', borderRadius:'10px', border:'1px solid #cbd5e1'}}>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', position:'relative', maxWidth:'300px', margin:'0 auto 20px'}}>
                        <div style={{position:'absolute', top:'15px', left:'10%', right:'10%', height:'3px', background:'#e2e8f0', zIndex:0}}></div>
                        {[1,2,3].map(step => (
                            <div key={step} style={{zIndex:1, width:'35px', height:'35px', background: getStepColor(step, mySponsorship.status), color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>{step}</div>
                        ))}
                    </div>
                    <div style={{textAlign:'center', marginBottom:'20px'}}>Status: <strong>{mySponsorship.status === 'verified' ? "Verified" : (mySponsorship.status === 'refund_requested' ? "Refund Processing" : "Processing")}</strong></div>
                    <button onClick={() => navigate(`/agreement/${id}`)} style={{width:'100%', padding:'12px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', marginBottom:'10px'}}>📄 View Agreement</button>
                    {mySponsorship.status !== 'verified' && mySponsorship.status !== 'refund_requested' && (
                        <button onClick={() => handleAction(`/api/events/${id}/request-refund`, {}, "Refund Requested! Admin will notify you.")} style={{width:'100%', padding:'10px', background:'none', color:'#ef4444', border:'1px solid #ef4444', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>❌ Request Refund</button>
                    )}
                </div>
            ) : (
                user?.role === 'sponsor' ? (
                   <div style={{background:'#f8fafc', padding:'25px', borderRadius:'15px', border:'1px solid #e2e8f0'}}>
                        <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
                        <textarea placeholder="Note..." value={comment} onChange={e=>setComment(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
                        <button onClick={handleSponsor} style={{width:'100%', padding:'12px', background:'#16a34a', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold'}}>Sponsor Now</button>
                   </div>
                ) : (<div>Login as Sponsor to fund.</div>)
            )
        )}
      </div>
    </div>
  );
};
export default EventDetails;