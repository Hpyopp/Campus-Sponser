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

  const handleSponsor = async () => {
    if (!user) return navigate('/login');
    
    // 🔒 STRICT CHECK
    if (!user.isVerified) {
        return alert("⛔ Action Blocked!\nYour account is not verified by Admin yet. Please wait for approval.");
    }

    if (user.role !== 'sponsor') return alert("Only Sponsors can fund events!");
    if (!amount || amount < 500) return alert("Minimum amount is ₹500");

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/events/sponsor/${id}`, { amount }, config);
      alert("🎉 Success! Receipt Generated.");
      navigate(`/agreement/${id}`);
    } catch (error) {
      alert(error.response?.data?.message || "Failed");
    }
  };

  const handleRequestRefund = async () => { if(!window.confirm("Request Refund?")) return; try { const config = { headers: { Authorization: `Bearer ${user.token}` } }; await axios.put(`/api/events/request-refund/${id}`, {}, config); const adminPhone = "919022489860"; const msg = `Hello Admin, I requested refund for: ${event.title}.`; window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`, '_blank'); fetchEvent(); } catch (error) { alert("Error"); } };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading...</div>;
  if (!event) return <div style={{textAlign:'center', padding:'50px'}}>Not Found</div>;

  const mySponsorship = event.sponsors?.find(s => s.sponsorId === user?._id);
  const raised = event.raisedAmount || 0;
  const budget = event.budget || 0;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '15px', fontFamily: 'Poppins', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h1 style={{color:'#1e293b'}}>{event.title}</h1>
      <p style={{color:'#64748b'}}>📍 {event.location} | 📅 {new Date(event.date).toLocaleDateString()}</p>

      <div style={{background:'#f0f9ff', padding:'20px', borderRadius:'10px', marginTop:'20px', textAlign:'center', border:'1px solid #bae6fd'}}>
         <h2 style={{color:'#0284c7', margin:0}}>₹ {raised} <span style={{fontSize:'1rem', color:'#64748b'}}>/ ₹ {budget}</span></h2>
      </div>

      <div style={{marginTop:'30px'}}>
         <h3>📝 Description</h3>
         <p style={{color:'#475569', lineHeight:'1.6'}}>{event.description}</p>
      </div>

      {/* ACTION AREA */}
      <div style={{borderTop:'2px dashed #e2e8f0', marginTop:'30px', paddingTop:'30px', textAlign:'center'}}>
        {mySponsorship ? (
            <div style={{background:'#f8fafc', padding:'20px', borderRadius:'10px'}}>
                <h3 style={{color:'#166534'}}>✅ You Sponsored: ₹{mySponsorship.amount}</h3>
                {mySponsorship.status === 'refund_requested' ? <span style={{color:'orange', fontWeight:'bold'}}>Refund Pending...</span> : 
                <div><button onClick={() => navigate(`/agreement/${id}`)} style={{marginRight:'10px'}}>Receipt</button><button onClick={handleRequestRefund} style={{color:'red'}}>Refund</button></div>}
            </div>
        ) : (
            <div style={{maxWidth:'400px', margin:'0 auto'}}>
                {user && user.role === 'sponsor' ? (
                    // CHECK VERIFICATION
                    user.isVerified ? (
                        <div style={{display:'flex', gap:'10px'}}>
                            <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} style={{padding:'10px', flex:1}} />
                            <button onClick={handleSponsor} style={{padding:'10px 20px', background:'#2563eb', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Sponsor Now</button>
                        </div>
                    ) : (
                        // BLOCKED
                        <div style={{padding:'15px', background:'#fff7ed', color:'#c2410c', border:'1px solid #fdba74', borderRadius:'8px'}}>
                            ⚠️ <strong>Account Pending Verification</strong><br/>
                            Wait for Admin to approve your ID proof.
                        </div>
                    )
                ) : (
                    <p style={{color:'#64748b'}}>Login as <strong>Verified Sponsor</strong> to fund.</p>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
export default EventDetails;