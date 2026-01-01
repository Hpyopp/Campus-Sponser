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

  // --- SPONSOR ---
  const handleSponsor = async () => {
    if (!user) return navigate('/login');
    if (!user.isVerified) return alert("⛔ Verification Pending! You cannot sponsor yet.");
    if (user.role !== 'sponsor') return alert("Only Sponsors can fund events!");
    if (!amount || amount < 500) return alert("Min amount ₹500");

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/events/sponsor/${id}`, { amount }, config);
      alert("🎉 Sponsored Successfully! Redirecting to Receipt...");
      navigate(`/agreement/${id}`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed");
    }
  };

  // --- REQUEST REFUND ---
  const handleRequestRefund = async () => {
    if(!window.confirm("Request Refund from Admin?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/events/request-refund/${id}`, {}, config);
      
      // WhatsApp Redirect
      const adminPhone = "919022489860"; 
      const msg = `Hello Admin, I have requested a refund for Event: ${event.title}. Name: ${user.name}. Please approve from Admin Panel.`;
      const waLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
      
      alert("✅ Request Sent! Notify Admin on WhatsApp...");
      window.open(waLink, '_blank');
      fetchEvent();
    } catch (error) { alert("Error sending request"); }
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading...</div>;
  if (!event) return <div style={{textAlign:'center', padding:'50px'}}>Not Found</div>;

  const mySponsorship = event.sponsors?.find(s => s.sponsorId === user?._id);
  const raised = event.raisedAmount || 0;
  const budget = event.budget || 0;
  const remainingBudget = budget - raised;

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '15px', fontFamily: 'Poppins', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      
      <h1 style={{color:'#1e293b'}}>{event.title}</h1>
      <p style={{color:'#64748b'}}>📍 {event.location} | 📅 {new Date(event.date).toDateString()}</p>

      {/* FUNDS */}
      <div style={{background:'#f0f9ff', padding:'20px', borderRadius:'10px', marginTop:'20px', textAlign:'center', border:'1px solid #bae6fd'}}>
         <h2 style={{color:'#0284c7', margin:0}}>₹ {raised} <span style={{fontSize:'1rem', color:'#64748b'}}>/ ₹ {budget}</span></h2>
      </div>

      <div style={{marginTop:'30px'}}>
         <h3>📝 Description</h3>
         <p style={{color:'#475569', lineHeight:'1.6'}}>{event.description}</p>
      </div>

      {/* ACTION ZONE */}
      <div style={{borderTop:'2px dashed #e2e8f0', marginTop:'30px', paddingTop:'30px', textAlign:'center'}}>
        {mySponsorship ? (
            <div style={{background:'#f8fafc', padding:'25px', borderRadius:'15px', border:'1px solid #cbd5e1'}}>
                <h3 style={{color:'#166534', margin:'0 0 10px 0'}}>✅ You Sponsored: ₹{mySponsorship.amount}</h3>
                
                {mySponsorship.status === 'refund_requested' ? (
                    <div style={{padding:'15px', background:'#fff7ed', color:'#c2410c', border:'1px solid #fdba74', borderRadius:'8px', fontWeight:'bold', marginTop:'15px'}}>
                        ⏳ Refund Request Pending (Waiting for Admin)
                    </div>
                ) : (
                    <div style={{display:'flex', gap:'15px', justifyContent:'center', marginTop:'15px'}}>
                        <button onClick={() => navigate(`/agreement/${id}`)} style={{padding:'10px 20px', background:'#166534', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>📄 Receipt</button>
                        <button onClick={handleRequestRefund} style={{padding:'10px 20px', background:'#ef4444', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>❌ Request Refund</button>
                    </div>
                )}
            </div>
        ) : (
            <div style={{maxWidth:'400px', margin:'0 auto'}}>
                {user && user.role === 'sponsor' ? (
                    user.isVerified ? (
                        <div style={{display:'flex', gap:'10px'}}>
                            <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} style={{padding:'12px', flex:1, borderRadius:'5px', border:'1px solid #ccc'}} />
                            <button onClick={handleSponsor} style={{padding:'12px 25px', background:'#2563eb', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Sponsor Now</button>
                        </div>
                    ) : ( <div style={{padding:'15px', background:'#fff7ed', color:'#c2410c', borderRadius:'5px', border:'1px solid #fdba74'}}>⚠️ Verification Pending</div> )
                ) : ( <p style={{color:'#64748b'}}>Login as Sponsor to fund.</p> )}
            </div>
        )}
      </div>
    </div>
  );
};
export default EventDetails;